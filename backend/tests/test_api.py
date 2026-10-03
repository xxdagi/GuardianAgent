from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_create_and_list_items():
    r = client.post("/api/v1/items", json={"name": "demo"})
    assert r.status_code == 201
    assert r.json()["name"] == "demo"
    assert any(i["name"] == "demo" for i in client.get("/api/v1/items").json())


def test_validation_error_format():
    r = client.post("/api/v1/items", json={"name": ""})
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "VALIDATION_ERROR"
