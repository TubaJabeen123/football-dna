from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_players_returns_list():
    res = client.get("/api/players")
    assert res.status_code == 200
    data = res.json()
    assert "players" in data
    assert len(data["players"]) > 100


def test_player_has_stats():
    res = client.get("/api/players")
    first = res.json()["players"][0]
    assert "overall" in first
    assert "pace" in first
    assert "shooting" in first


def test_nations_returns_list():
    res = client.get("/api/nations")
    assert res.status_code == 200
    assert "nations" in res.json()
    assert len(res.json()["nations"]) > 10


def test_player_not_found():
    res = client.get("/api/player/XXXXXXNOTREAL")
    assert res.status_code == 404
