import io
import json
import uuid

import pytest
from fastapi import UploadFile
from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.user_group_map import UserGroupMap
from app.services.storage_service import sanitize_filename, save_uploaded_file


@pytest.mark.anyio
async def test_dynamic_group_membership_transition(async_client):
    """Proposal Page 2 Core Requirement:

    'Group membership is checked live: if someone joins a group later, they
    automatically get access to that group's past announcements. If someone
    leaves, they lose it.'
    """
    unique_suffix = uuid.uuid4().hex[:6]
    title = f"Confidential Branch Memo {unique_suffix}"

    # 1. Sarah posts an announcement targeted to 'All Branch Managers'
    recipients = json.dumps(
        [{"type": "GROUP", "id": "grp-branch-managers", "name": "All Branch Managers"}]
    )
    form_data = {
        "title": title,
        "message_content": "Confidential directives for all branch leadership.",
        "recipients": recipients,
    }
    sample_file = [
        (
            "files",
            (
                "BranchProtocol.pdf",
                io.BytesIO(b"%PDF-1.4 Mock branch protocol bytes"),
                "application/pdf",
            ),
        ),
    ]

    create_resp = await async_client.post(
        "/api/v1/announcements",
        data=form_data,
        files=sample_file,
        headers={"X-User-Id": "user-sarah"},
    )
    assert create_resp.status_code == 201
    announcement_id = create_resp.json()["id"]

    # 2. Verify Alex Vorn (Staff) CANNOT see this announcement initially
    feed_before = await async_client.get(
        "/api/v1/announcements", headers={"X-User-Id": "user-alex"}
    )
    assert feed_before.status_code == 200
    assert announcement_id not in [a["id"] for a in feed_before.json()]

    # And Alex cannot open the folder directly -> 403 Forbidden
    detail_before = await async_client.get(
        f"/api/v1/announcements/{announcement_id}",
        headers={"X-User-Id": "user-alex"},
    )
    assert detail_before.status_code == 403

    # 3. Dynamic transition: Alex is promoted and joins the 'All Branch Managers' group
    db = SessionLocal()
    try:
        new_membership = UserGroupMap(
            user_id="user-alex", group_id="grp-branch-managers"
        )
        db.add(new_membership)
        db.commit()
    finally:
        db.close()

    # 4. LIVE CHECK: Alex NOW automatically sees the past announcement without republishing!
    feed_after_join = await async_client.get(
        "/api/v1/announcements", headers={"X-User-Id": "user-alex"}
    )
    assert feed_after_join.status_code == 200
    assert announcement_id in [a["id"] for a in feed_after_join.json()]

    # Alex can now access folder details and download files
    detail_after_join = await async_client.get(
        f"/api/v1/announcements/{announcement_id}",
        headers={"X-User-Id": "user-alex"},
    )
    assert detail_after_join.status_code == 200
    pdf_file_id = detail_after_join.json()["files"][0]["id"]

    download_resp = await async_client.get(
        f"/api/v1/announcements/{announcement_id}/files/{pdf_file_id}/download",
        headers={"X-User-Id": "user-alex"},
    )
    assert download_resp.status_code == 200

    # 5. Dynamic transition: Alex leaves the group
    db = SessionLocal()
    try:
        mem = db.execute(
            select(UserGroupMap).where(
                UserGroupMap.user_id == "user-alex",
                UserGroupMap.group_id == "grp-branch-managers",
            )
        ).scalar_one_or_none()
        if mem:
            db.delete(mem)
            db.commit()
    finally:
        db.close()

    # 6. LIVE CHECK: Alex immediately LOSES access!
    feed_after_leave = await async_client.get(
        "/api/v1/announcements", headers={"X-User-Id": "user-alex"}
    )
    assert feed_after_leave.status_code == 200
    assert announcement_id not in [a["id"] for a in feed_after_leave.json()]

    download_revoked = await async_client.get(
        f"/api/v1/announcements/{announcement_id}/files/{pdf_file_id}/download",
        headers={"X-User-Id": "user-alex"},
    )
    assert download_revoked.status_code == 403


@pytest.mark.anyio
async def test_anti_url_guessing_security(async_client):
    """Verifies that an unauthorized user cannot guess or access direct file download URLs."""
    # Sarah creates an announcement for 'Finance Department' only
    recipients = json.dumps(
        [{"type": "GROUP", "id": "grp-finance", "name": "Finance Department"}]
    )
    form_data = {
        "title": f"Finance Internal Audit {uuid.uuid4().hex[:6]}",
        "message_content": "Sensitive internal financial disclosures.",
        "recipients": recipients,
    }
    sample_file = [
        (
            "files",
            (
                "Q3_Financials.xlsx",
                io.BytesIO(b"PK\x03\x04 Mock excel bytes"),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ),
        ),
    ]

    create_resp = await async_client.post(
        "/api/v1/announcements",
        data=form_data,
        files=sample_file,
        headers={"X-User-Id": "user-sarah"},
    )
    assert create_resp.status_code == 201
    created_data = create_resp.json()
    announcement_id = created_data["id"]
    excel_file_id = next(
        f["id"] for f in created_data["files"] if not f["is_generated_pdf"]
    )

    # Emily (Finance) CAN download
    emily_dl = await async_client.get(
        f"/api/v1/announcements/{announcement_id}/files/{excel_file_id}/download",
        headers={"X-User-Id": "user-emily"},
    )
    assert emily_dl.status_code == 200

    # David Miller (Branch Manager) CANNOT download -> 403 Forbidden
    david_dl = await async_client.get(
        f"/api/v1/announcements/{announcement_id}/files/{excel_file_id}/download",
        headers={"X-User-Id": "user-david"},
    )
    assert david_dl.status_code == 403
    assert "Access Denied" in david_dl.json()["message"]

    # Alex (Staff) CANNOT download -> 403 Forbidden
    alex_dl = await async_client.get(
        f"/api/v1/announcements/{announcement_id}/files/{excel_file_id}/download",
        headers={"X-User-Id": "user-alex"},
    )
    assert alex_dl.status_code == 403


@pytest.mark.anyio
async def test_path_traversal_protection():
    """Verifies path traversal attempts are neutralized by sanitize_filename."""
    malicious_names = [
        "../../etc/passwd",
        "..\\..\\windows\\system32\\cmd.exe",
        "subfolder/../../../secret.txt",
        "/absolute/root/file.pdf",
    ]

    for malicious in malicious_names:
        safe = sanitize_filename(malicious)
        assert "/" not in safe
        assert "\\" not in safe
        assert ".." not in safe


@pytest.mark.anyio
async def test_oversized_file_rejection(tmp_path):
    """Verifies that uploaded files exceeding 25MB are rejected with clean error."""
    # Create mock upload exceeding 25MB
    large_data = b"0" * (26 * 1024 * 1024)
    mock_upload = UploadFile(
        file=io.BytesIO(large_data),
        filename="TooLargeDocument.pdf",
    )

    with pytest.raises(Exception) as exc_info:
        await save_uploaded_file(mock_upload, str(tmp_path))

    assert "exceeds maximum limit" in str(exc_info.value)
