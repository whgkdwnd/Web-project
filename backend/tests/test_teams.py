# backend/tests/test_teams.py
def test_create_team(client):
    res = client.post("/api/teams", json={"name": "우리팀"})
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "우리팀"
    assert len(data["code"]) == 8

def test_get_team_by_code(client):
    res = client.post("/api/teams", json={"name": "우리팀"})
    code = res.json()["code"]
    res2 = client.get(f"/api/teams/{code}")
    assert res2.status_code == 200
    assert res2.json()["code"] == code

def test_get_team_not_found(client):
    res = client.get("/api/teams/XXXXXXXX")
    assert res.status_code == 404
