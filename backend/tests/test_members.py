# backend/tests/test_members.py
import pytest

@pytest.fixture
def team_code(client):
    res = client.post("/api/teams", json={"name": "테스트팀"})
    return res.json()["code"]

def test_create_member(client, team_code):
    res = client.post(f"/api/teams/{team_code}/members",
                      json={"name": "홍길동", "color": "#FF6B6B"})
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "홍길동"
    assert data["color"] == "#FF6B6B"

def test_get_members(client, team_code):
    client.post(f"/api/teams/{team_code}/members",
                json={"name": "홍길동", "color": "#FF6B6B"})
    client.post(f"/api/teams/{team_code}/members",
                json={"name": "김철수", "color": "#4ECDC4"})
    res = client.get(f"/api/teams/{team_code}/members")
    assert res.status_code == 200
    assert len(res.json()) == 2

def test_create_member_team_not_found(client):
    res = client.post("/api/teams/XXXXXXXX/members",
                      json={"name": "홍길동", "color": "#FF6B6B"})
    assert res.status_code == 404
