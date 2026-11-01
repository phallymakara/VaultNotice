import io
import json

import pytest


@pytest.mark.anyio
async def test_directory_search(async_client):
    # Search for group
    resp = await async_client.get("/api/v1/directory/search?q=Branch")
    assert resp.status_code == 200
    data = resp.json()
    assert any(
        item["name"] == "All Branch Managers" and item["type"] == "GROUP"
        for item in data
    )

    # Search for user
    resp = await async_client.get("/api/v1/directory/search?q=Sarah")
    assert resp.status_code == 200
    data = resp.json()
    assert any(item["name"] == "Sarah Lin" and item["type"] == "USER" for item in data)


@pytest.mark.anyio
async def test_current_user_audience_check(async_client):
    # Sarah (Management)
    resp = await async_client.get(
        "/api/v1/directory/users/current", headers={"X-User-Id": "user-sarah"}
    )
    assert resp.status_code == 200
    assert resp.json()["can_post_announcement"] is True

    # Alex (Staff)
    resp = await async_client.get(
        "/api/v1/directory/users/current", headers={"X-User-Id": "user-alex"}
    )
    assert resp.status_code == 200
    assert resp.json()["can_post_announcement"] is False


@pytest.mark.anyio
async def test_post_announcement_audience_restriction(async_client):
    # Alex (Staff) tries to post -> 403 Forbidden
    payload = {
        "title": "Unauthorized Announcement",
        "message_content": "This should be rejected",
        "recipients": json.dumps(
            [{"type": "GROUP", "id": "grp-operations", "name": "Operations Team"}]
        ),
    }
    resp = await async_client.post(
        "/api/v1/announcements",
        data=payload,
        headers={"X-User-Id": "user-alex"},
    )
    assert resp.status_code == 403
    assert "Only Management" in resp.json()["message"]


@pytest.mark.anyio
async def test_complete_announcement_workflow(async_client):
    # 1. Sarah (CEO) posts announcement targeted to "All Branch Managers" with an attachment
    recipients = json.dumps(
        [{"type": "GROUP", "id": "grp-branch-managers", "name": "All Branch Managers"}]
    )

    form_data = {
        "title": "Q4 Executive Branch Directive",
        "message_content": "### Urgent Branch Guidelines\n\nPlease ensure all branch vault procedures are reviewed.\n\n* Mandatory daily reconciliation\n* Security verification protocol",
        "recipients": recipients,
    }

    sample_doc_content = b"PDF-1.4 Mock circular document for branch managers."
    files = [
        (
            "files",
            ("Circular_Q4.pdf", io.BytesIO(sample_doc_content), "application/pdf"),
        ),
    ]

    create_resp = await async_client.post(
        "/api/v1/announcements",
        data=form_data,
        files=files,
        headers={"X-User-Id": "user-sarah"},
    )
    assert create_resp.status_code == 201
    created_data = create_resp.json()

    announcement_id = created_data["id"]
    assert created_data["title"] == "Q4 Executive Branch Directive"
    assert "All Branch Managers" in created_data["target_summary"]
    assert len(created_data["files"]) == 2  # Announcement.pdf + Circular_Q4.pdf

    pdf_file = next(f for f in created_data["files"] if f["is_generated_pdf"])
    attachment_file = next(
        f for f in created_data["files"] if not f["is_generated_pdf"]
    )
    assert pdf_file["file_name"] == "Announcement.pdf"
    assert attachment_file["file_name"].startswith("Circular_Q4")

    # 2. Verify Security Trimming in Feed:
    # David Miller (Branch Manager) MUST see it
    david_resp = await async_client.get(
        "/api/v1/announcements", headers={"X-User-Id": "user-david"}
    )
    assert david_resp.status_code == 200
    david_ids = [a["id"] for a in david_resp.json()]
    assert announcement_id in david_ids

    # Emily Tan (Finance) MUST NOT see it
    emily_resp = await async_client.get(
        "/api/v1/announcements", headers={"X-User-Id": "user-emily"}
    )
    assert emily_resp.status_code == 200
    emily_ids = [a["id"] for a in emily_resp.json()]
    assert announcement_id not in emily_ids

    # Alex Vorn (Staff) MUST NOT see it
    alex_resp = await async_client.get(
        "/api/v1/announcements", headers={"X-User-Id": "user-alex"}
    )
    assert alex_resp.status_code == 200
    alex_ids = [a["id"] for a in alex_resp.json()]
    assert announcement_id not in alex_ids

    # Portal Admin MUST see it
    admin_resp = await async_client.get(
        "/api/v1/announcements", headers={"X-User-Id": "user-admin"}
    )
    assert admin_resp.status_code == 200
    admin_ids = [a["id"] for a in admin_resp.json()]
    assert announcement_id in admin_ids

    # 3. Verify Direct File Download Authorization:
    # David can download
    dl_resp = await async_client.get(
        f"/api/v1/announcements/{announcement_id}/files/{pdf_file['id']}/download",
        headers={"X-User-Id": "user-david"},
    )
    assert dl_resp.status_code == 200
    assert len(dl_resp.content) > 0

    # Alex (unauthorized) gets 403 Forbidden
    unauth_resp = await async_client.get(
        f"/api/v1/announcements/{announcement_id}/files/{pdf_file['id']}/download",
        headers={"X-User-Id": "user-alex"},
    )
    assert unauth_resp.status_code == 403

    # 4. Verify Simulated Notifications:
    # David received alerts
    notif_resp = await async_client.get(
        "/api/v1/notifications/my", headers={"X-User-Id": "user-david"}
    )
    assert notif_resp.status_code == 200
    david_notifs = notif_resp.json()
    assert any(n["announcement_id"] == announcement_id for n in david_notifs)

    # Alex did not receive alerts for this announcement
    alex_notif_resp = await async_client.get(
        "/api/v1/notifications/my", headers={"X-User-Id": "user-alex"}
    )
    assert alex_notif_resp.status_code == 200
    assert not any(
        n["announcement_id"] == announcement_id for n in alex_notif_resp.json()
    )

    # 5. Verify Audit Logs:
    audit_resp = await async_client.get(
        "/api/v1/audit/logs", headers={"X-User-Id": "user-admin"}
    )
    assert audit_resp.status_code == 200
    audit_logs = audit_resp.json()
    assert any(
        log["announcement_id"] == announcement_id and log["status"] == "SUCCESS"
        for log in audit_logs
    )

    # 6. Verify Read Acknowledgement:
    # Initial status for David (not yet acknowledged)
    detail_before = await async_client.get(
        f"/api/v1/announcements/{announcement_id}",
        headers={"X-User-Id": "user-david"},
    )
    assert detail_before.status_code == 200
    assert detail_before.json()["acknowledged"] is False
    assert detail_before.json()["acknowledgement_count"] == 0

    # David acknowledges
    ack_resp = await async_client.post(
        f"/api/v1/announcements/{announcement_id}/acknowledge",
        headers={"X-User-Id": "user-david"},
    )
    assert ack_resp.status_code == 200
    ack_data = ack_resp.json()
    assert ack_data["acknowledged"] is True
    assert ack_data["acknowledgement_count"] == 1
    assert ack_data["acknowledged_at"] is not None

    # Detail page reflects acknowledgement
    detail_after = await async_client.get(
        f"/api/v1/announcements/{announcement_id}",
        headers={"X-User-Id": "user-david"},
    )
    assert detail_after.status_code == 200
    assert detail_after.json()["acknowledged"] is True
    assert detail_after.json()["acknowledgement_count"] == 1
