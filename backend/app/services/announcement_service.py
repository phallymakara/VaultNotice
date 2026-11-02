import json
import os
from datetime import UTC, datetime

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.exceptions import APIError, ForbiddenError, NotFoundError
from app.core.logging import logger
from app.models.acknowledgement import AnnouncementAcknowledgement
from app.models.announcement import Announcement
from app.models.file import AnnouncementFile
from app.models.permission import AnnouncementPermission
from app.models.user import User
from app.repositories.announcement_repository import (
    check_user_access,
    create_announcement_record,
    get_announcement_by_id,
    get_security_trimmed_announcements,
)
from app.repositories.user_repository import (
    get_all_groups,
    get_all_users,
    get_group_members,
    get_user_group_ids,
)
from app.schemas.announcement import (
    AcknowledgementResponse,
    AnnouncementDetailResponse,
    AnnouncementPermissionResponse,
    AnnouncementSummaryResponse,
    FullControlUserResponse,
    GroupMemberResponse,
    RecipientTarget,
)
from app.schemas.file import FileResponse
from app.services.notification_service import dispatch_simulated_notifications
from app.services.pdf_service import generate_announcement_pdf
from app.services.storage_service import (
    create_announcement_folder,
    sanitize_folder_name,
    save_uploaded_file,
)


def can_post_announcement(user: User) -> bool:
    """Checks whether the user belongs to Management or Portal Admins."""
    if user.role in ("Management", "Portal Admin"):
        return True
    user_groups = [m.group.name for m in user.group_memberships if m.group]
    return "Management" in user_groups or "Portal Admins" in user_groups


def build_announcement_summary(
    announcement: Announcement,
    users_map: dict[str, str] | None = None,
    groups_map: dict[str, str] | None = None,
    current_user_id: str | None = None,
) -> AnnouncementSummaryResponse:
    # Compute target audience summary
    targets: list[str] = []
    for perm in announcement.permissions:
        if perm.access_level != "FULL_CONTROL":
            name = perm.recipient_id
            if (
                perm.recipient_type == "USER"
                and users_map
                and perm.recipient_id in users_map
            ):
                name = users_map[perm.recipient_id]
            elif (
                perm.recipient_type == "GROUP"
                and groups_map
                and perm.recipient_id in groups_map
            ):
                name = groups_map[perm.recipient_id]
            targets.append(name)

    # Count attachments excluding generated PDF
    attachment_count = sum(1 for f in announcement.files if not f.is_generated_pdf)

    is_acknowledged = (
        any(ack.user_id == current_user_id for ack in announcement.acknowledgements)
        if current_user_id
        else False
    )
    ack_count = len(announcement.acknowledgements)

    return AnnouncementSummaryResponse(
        id=announcement.id,
        title=announcement.title,
        folder_name=announcement.folder_name,
        author_id=announcement.author_id,
        author_name=announcement.author.name if announcement.author else "Management",
        created_at=announcement.created_at,
        status=announcement.status,
        confidentiality_level=announcement.confidentiality_level or "Internal",
        expires_at=announcement.expires_at,
        acknowledged=is_acknowledged,
        acknowledgement_count=ack_count,
        target_summary=targets,
        attachment_count=attachment_count,
    )


def build_announcement_detail(
    announcement: Announcement,
    db: Session,
    current_user: User | None = None,
) -> AnnouncementDetailResponse:
    all_users = get_all_users(db)
    users_obj_map = {u.id: u for u in all_users}
    users_map = {u.id: u.name for u in all_users}
    groups_obj_map = {g.id: g for g in get_all_groups(db)}
    groups_map = {g.id: g.name for g in groups_obj_map.values()}

    # Determine user role / permissions for detail view
    is_author = bool(current_user and announcement.author_id == current_user.id)
    user_groups = get_user_group_ids(db, current_user.id) if current_user else []
    is_admin = bool(
        current_user
        and (
            current_user.role == "Portal Admin"
            or "grp-portal-admins" in user_groups
            or (
                hasattr(current_user, "group_memberships")
                and "Portal Admins"
                in [
                    m.group.name
                    for m in current_user.group_memberships
                    if getattr(m, "group", None)
                ]
            )
        )
    )
    can_view_detailed_permissions = bool(is_author or is_admin)

    permissions_resp: list[AnnouncementPermissionResponse] = []
    selected_recipients: list[RecipientTarget] = []
    targets: list[str] = []
    accessible_user_ids: set[str] = {announcement.author_id}

    # Add portal admins to accessible users set
    admin_members = list(get_group_members(db, "grp-portal-admins"))
    for adm in admin_members:
        accessible_user_ids.add(adm.id)

    for perm in announcement.permissions:
        if perm.recipient_type == "USER":
            name = users_map.get(perm.recipient_id, perm.recipient_id)
            accessible_user_ids.add(perm.recipient_id)
            group_members_list: list[GroupMemberResponse] = []
        else:
            name = groups_map.get(perm.recipient_id, perm.recipient_id)
            live_members = list(get_group_members(db, perm.recipient_id))
            for m in live_members:
                accessible_user_ids.add(m.id)

            # Poster and admin see the member list behind each group, checked live
            if can_view_detailed_permissions:
                group_members_list = [
                    GroupMemberResponse(
                        id=m.id,
                        name=m.name,
                        email=m.email,
                        role=m.role,
                        department=m.department,
                    )
                    for m in live_members
                ]
            else:
                group_members_list = []

        permissions_resp.append(
            AnnouncementPermissionResponse(
                id=perm.id,
                recipient_type=perm.recipient_type,
                recipient_id=perm.recipient_id,
                recipient_name=name,
                access_level=perm.access_level,
                group_members=group_members_list,
            )
        )
        if perm.access_level != "FULL_CONTROL":
            targets.append(name)
            selected_recipients.append(
                RecipientTarget(
                    type="USER" if perm.recipient_type == "USER" else "GROUP",
                    id=perm.recipient_id,
                    name=name,
                )
            )

    # Full Control Users: Poster and admin see who has Full Control
    full_control_users: list[FullControlUserResponse] = []
    if can_view_detailed_permissions:
        author_user = users_obj_map.get(announcement.author_id)
        if author_user:
            full_control_users.append(
                FullControlUserResponse(
                    id=author_user.id,
                    name=author_user.name,
                    role=author_user.role,
                    department=author_user.department,
                    reason="Author & Owner (Management)",
                )
            )
        for adm in admin_members:
            if adm.id != announcement.author_id:
                full_control_users.append(
                    FullControlUserResponse(
                        id=adm.id,
                        name=adm.name,
                        role=adm.role,
                        department=adm.department,
                        reason="System Administrator (Portal Admin)",
                    )
                )

    # Files with uploader, version, last modified
    author_display_name = (
        announcement.author.name if announcement.author else "Management"
    )
    files_resp: list[FileResponse] = [
        FileResponse(
            id=f.id,
            announcement_id=f.announcement_id,
            file_name=f.file_name,
            file_size=f.file_size,
            mime_type=f.mime_type,
            is_generated_pdf=f.is_generated_pdf,
            download_url=f"/api/v1/announcements/{announcement.id}/files/{f.id}/download",
            uploaded_by="Automated System (PDF Engine)"
            if f.is_generated_pdf
            else author_display_name,
            version="1.0",
            last_modified=announcement.created_at,
        )
        for f in announcement.files
    ]

    # Alert stats
    notifications = announcement.notifications or []
    teams_sent = (
        any(n.channel == "TEAMS" for n in notifications) if notifications else True
    )
    email_sent = (
        any(n.channel == "EMAIL" for n in notifications) if notifications else True
    )
    alerts_time = notifications[0].sent_at if notifications else announcement.created_at
    alerted_count = (
        len({n.recipient_user_id for n in notifications})
        if notifications
        else len(accessible_user_ids)
    )

    # Author details
    author_role = announcement.author.role if announcement.author else "Management"
    author_dept = (
        announcement.author.department if announcement.author else "Executive Office"
    )

    # SharePoint folder link (simulated SharePoint Online document library path)
    folder_url = f"https://prosethsolutions.sharepoint.com/sites/vaultnotice/SharedDocuments/{announcement.folder_name}"

    # Acknowledgement status (preserved for schema compatibility)
    user_ack = next(
        (
            ack
            for ack in announcement.acknowledgements
            if current_user and ack.user_id == current_user.id
        ),
        None,
    )
    is_acknowledged = user_ack is not None
    acknowledged_at = user_ack.acknowledged_at if user_ack else None
    ack_count = len(announcement.acknowledgements)

    return AnnouncementDetailResponse(
        id=announcement.id,
        title=announcement.title,
        folder_name=announcement.folder_name,
        folder_url=folder_url,
        message_content=announcement.message_content,
        author_id=announcement.author_id,
        author_name=author_display_name,
        author_role=author_role,
        author_department=author_dept,
        template_name=announcement.template.name if announcement.template else None,
        confidentiality_level=announcement.confidentiality_level or "Internal",
        expires_at=announcement.expires_at,
        acknowledged=is_acknowledged,
        acknowledged_at=acknowledged_at,
        acknowledgement_count=ack_count,
        created_at=announcement.created_at,
        status=announcement.status or "SUCCESS",
        error_message=announcement.error_message,
        target_summary=targets,
        selected_recipients=selected_recipients,
        permissions=permissions_resp,
        full_control_users=full_control_users,
        effective_access_count=len(accessible_user_ids),
        teams_alert_sent=teams_sent,
        email_alert_sent=email_sent,
        alerts_sent_at=alerts_time,
        alerted_users_count=alerted_count,
        can_view_detailed_permissions=can_view_detailed_permissions,
        files=files_resp,
    )


async def process_and_create_announcement(
    db: Session,
    current_user: User,
    title: str,
    message_content: str,
    recipients_json: str,
    template_id: int | None = None,
    confidentiality_level: str = "Internal",
    expires_at: datetime | None = None,
    files: list[UploadFile] | None = None,
) -> AnnouncementDetailResponse:
    """Automated backend processing engine replicating Power Automate workflow:

    1. Audience verification
    2. Folder creation (YYYY-MM-DD - Title)
    3. Attachment file saving
    4. PDF generation (Announcement.pdf)
    5. Folder ACL break & unique permissions assignment
    6. Simulated Email & Teams notification alerts
    7. Audit trail logging
    """
    # 1. Audience verification
    if not can_post_announcement(current_user):
        raise ForbiddenError(
            "Only Management and Portal Admins are authorized to post announcements."
        )

    if not title.strip():
        raise APIError("Announcement title cannot be empty", status_code=400)
    if not message_content.strip():
        raise APIError("Announcement message content cannot be empty", status_code=400)

    # Parse recipients
    try:
        recipients_raw = json.loads(recipients_json)
        recipients = [RecipientTarget(**r) for r in recipients_raw]
    except Exception as e:
        raise APIError(f"Invalid recipients JSON format: {e!s}", status_code=400) from e

    if not recipients:
        raise APIError(
            "At least one audience recipient (User or Group) must be selected.",
            status_code=400,
        )

    now = datetime.now(UTC)
    date_prefix = now.strftime("%Y-%m-%d")
    folder_name = sanitize_folder_name(date_prefix, title)

    try:
        # 2. Create SharePoint-mirrored storage folder
        folder_path = create_announcement_folder(folder_name)

        # 3. Save uploaded attachments
        file_records: list[AnnouncementFile] = []
        attachment_names: list[str] = []

        if files:
            for upload in files:
                if upload.filename:
                    fname, fpath, fsize, ftype = await save_uploaded_file(
                        upload, folder_path
                    )
                    file_records.append(
                        AnnouncementFile(
                            file_name=fname,
                            file_path=fpath,
                            file_size=fsize,
                            mime_type=ftype,
                            is_generated_pdf=False,
                        )
                    )
                    attachment_names.append(fname)

        # 4. Generate Announcement.pdf inside folder
        pdf_filename = "Announcement.pdf"
        pdf_path = os.path.join(folder_path, pdf_filename)
        target_names = [r.name for r in recipients]

        _, pdf_size = generate_announcement_pdf(
            output_path=pdf_path,
            title=title,
            author_name=current_user.name,
            author_role=current_user.role,
            author_dept=current_user.department,
            target_summary=target_names,
            message_content=message_content,
            created_at=now,
            attachment_names=attachment_names,
        )

        file_records.insert(
            0,
            AnnouncementFile(
                file_name=pdf_filename,
                file_path=pdf_path,
                file_size=pdf_size,
                mime_type="application/pdf",
                is_generated_pdf=True,
            ),
        )

        # 5. Break inheritance and assign explicit folder permissions (ACL)
        permissions: list[AnnouncementPermission] = [
            AnnouncementPermission(
                recipient_type="USER",
                recipient_id=current_user.id,
                access_level="FULL_CONTROL",
            ),
            AnnouncementPermission(
                recipient_type="GROUP",
                recipient_id="grp-portal-admins",
                access_level="FULL_CONTROL",
            ),
        ]

        for r in recipients:
            # Avoid duplicate if creator is also in recipient list
            if r.type == "USER" and r.id == current_user.id:
                continue
            permissions.append(
                AnnouncementPermission(
                    recipient_type=r.type,
                    recipient_id=r.id,
                    access_level="READ",
                )
            )

        # 6. Dispatch simulated notifications
        notifications = dispatch_simulated_notifications(
            db=db,
            recipients=recipients,
            announcement_title=title,
            author_name=current_user.name,
            attachment_count=len(attachment_names),
        )

        # 7. Commit master audit record
        announcement = Announcement(
            title=title,
            folder_name=folder_name,
            message_content=message_content,
            author_id=current_user.id,
            template_id=template_id,
            confidentiality_level=confidentiality_level or "Internal",
            expires_at=expires_at,
            status="SUCCESS",
            created_at=now,
        )

        created = create_announcement_record(
            db=db,
            announcement=announcement,
            permissions=permissions,
            files=file_records,
            notifications=notifications,
        )

        logger.info(
            f"Successfully posted announcement '{title}' (ID: {created.id}) inside folder '{folder_name}'"
        )
        return build_announcement_detail(created, db, current_user=current_user)

    except Exception as exc:
        logger.exception(f"Failed to process announcement '{title}': {exc!s}")
        raise APIError(
            f"Failed to post announcement: {exc!s}",
            error_code="PROCESSING_ERROR",
            status_code=500,
        ) from exc


def list_security_trimmed_announcements(
    db: Session,
    current_user: User,
    limit: int = 50,
    offset: int = 0,
) -> list[AnnouncementSummaryResponse]:
    """Retrieves announcement folders with dynamic security trimming."""
    user_groups = get_user_group_ids(db, current_user.id)
    is_admin = current_user.role == "Portal Admin" or "grp-portal-admins" in user_groups

    announcements = get_security_trimmed_announcements(
        db=db,
        user_id=current_user.id,
        group_ids=user_groups,
        is_admin=is_admin,
        limit=limit,
        offset=offset,
    )
    users_map = {u.id: u.name for u in get_all_users(db)}
    groups_map = {g.id: g.name for g in get_all_groups(db)}
    return [
        build_announcement_summary(
            a, users_map, groups_map, current_user_id=current_user.id
        )
        for a in announcements
    ]


def get_announcement_details_authorized(
    db: Session,
    announcement_id: int,
    current_user: User,
) -> AnnouncementDetailResponse:
    """Fetches full folder details if authorized, else raises HTTP 403 / 404."""
    user_groups = get_user_group_ids(db, current_user.id)
    is_admin = current_user.role == "Portal Admin" or "grp-portal-admins" in user_groups

    has_access, _ = check_user_access(
        db=db,
        announcement_id=announcement_id,
        user_id=current_user.id,
        group_ids=user_groups,
        is_admin=is_admin,
    )

    if not has_access:
        raise ForbiddenError(
            "You do not have permission to access this announcement folder."
        )

    announcement = get_announcement_by_id(db, announcement_id)
    if not announcement:
        raise NotFoundError(f"Announcement {announcement_id} not found.")

    return build_announcement_detail(announcement, db, current_user=current_user)


def acknowledge_announcement(
    db: Session,
    announcement_id: int,
    current_user: User,
) -> AcknowledgementResponse:
    """Records read acknowledgement for the active user."""
    user_groups = get_user_group_ids(db, current_user.id)
    is_admin = current_user.role == "Portal Admin" or "grp-portal-admins" in user_groups

    has_access, _ = check_user_access(
        db=db,
        announcement_id=announcement_id,
        user_id=current_user.id,
        group_ids=user_groups,
        is_admin=is_admin,
    )

    if not has_access:
        raise ForbiddenError(
            "You do not have permission to access or acknowledge this announcement."
        )

    announcement = get_announcement_by_id(db, announcement_id)
    if not announcement:
        raise NotFoundError(f"Announcement {announcement_id} not found.")

    existing_ack = (
        db.query(AnnouncementAcknowledgement)
        .filter_by(announcement_id=announcement_id, user_id=current_user.id)
        .first()
    )

    if not existing_ack:
        new_ack = AnnouncementAcknowledgement(
            announcement_id=announcement_id,
            user_id=current_user.id,
            acknowledged_at=datetime.now(UTC),
        )
        db.add(new_ack)
        db.commit()
        db.refresh(new_ack)
        existing_ack = new_ack

    ack_count = (
        db.query(AnnouncementAcknowledgement)
        .filter_by(announcement_id=announcement_id)
        .count()
    )

    return AcknowledgementResponse(
        announcement_id=announcement_id,
        acknowledged=True,
        acknowledged_at=existing_ack.acknowledged_at,
        acknowledgement_count=ack_count,
    )
