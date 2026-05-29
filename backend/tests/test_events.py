# backend/tests/test_events.py
import pytest

@pytest.fixture
def team_and_member(client):
    team = client.post("/api/teams", json={"name": "테스트팀"}).json()
    member = client.post(f"/api/teams/{team['code']}/members",
                         json={"name": "홍길동", "color": "#FF6B6B"}).json()
    return team["code"], member["id"]

def test_create_event(client, team_and_member):
    code, member_id = team_and_member
    res = client.post(f"/api/teams/{code}/events", json={
        "member_id": member_id,
        "title": "팀 회의",
        "start_at": "2026-06-05T14:00:00",
        "end_at": "2026-06-05T15:00:00",
        "memo": "주간 회의"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "팀 회의"
    assert data["member"]["name"] == "홍길동"

def test_get_events_by_month(client, team_and_member):
    code, member_id = team_and_member
    client.post(f"/api/teams/{code}/events", json={
        "member_id": member_id,
        "title": "6월 일정",
        "start_at": "2026-06-10T10:00:00",
        "end_at": "2026-06-10T11:00:00"
    })
    client.post(f"/api/teams/{code}/events", json={
        "member_id": member_id,
        "title": "7월 일정",
        "start_at": "2026-07-10T10:00:00",
        "end_at": "2026-07-10T11:00:00"
    })
    res = client.get(f"/api/teams/{code}/events?year=2026&month=6")
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["title"] == "6월 일정"

def test_update_event(client, team_and_member):
    code, member_id = team_and_member
    event = client.post(f"/api/teams/{code}/events", json={
        "member_id": member_id,
        "title": "원래 제목",
        "start_at": "2026-06-05T14:00:00",
        "end_at": "2026-06-05T15:00:00"
    }).json()
    res = client.put(f"/api/teams/{code}/events/{event['id']}",
                     json={"title": "수정된 제목"})
    assert res.status_code == 200
    assert res.json()["title"] == "수정된 제목"

def test_delete_event(client, team_and_member):
    code, member_id = team_and_member
    event = client.post(f"/api/teams/{code}/events", json={
        "member_id": member_id,
        "title": "삭제할 일정",
        "start_at": "2026-06-05T14:00:00",
        "end_at": "2026-06-05T15:00:00"
    }).json()
    res = client.delete(f"/api/teams/{code}/events/{event['id']}")
    assert res.status_code == 204
