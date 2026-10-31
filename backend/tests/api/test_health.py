import pytest


@pytest.mark.anyio
async def test_health_check(async_client):
    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("healthy", "degraded")
    assert data["project"] == "VaultNotice"
    assert "database" in data
    assert "storage" in data


@pytest.mark.anyio
async def test_root_endpoint(async_client):
    response = await async_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "VaultNotice"
    assert data["health"] == "/api/v1/health"
