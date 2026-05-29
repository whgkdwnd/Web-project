# backend/app/routers/events.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from ..models import Team, Member, Event
from ..schemas import EventCreate, EventUpdate, EventOut

router = APIRouter()

@router.get("/teams/{code}/events", response_model=List[EventOut])
def get_events(
    code: str,
    year: int = Query(...),
    month: int = Query(...),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.code == code).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    start = datetime(year, month, 1)
    end = datetime(year + 1, 1, 1) if month == 12 else datetime(year, month + 1, 1)
    return db.query(Event).filter(
        Event.team_id == team.id,
        Event.start_at >= start,
        Event.start_at < end
    ).all()

@router.post("/teams/{code}/events", response_model=EventOut)
def create_event(code: str, body: EventCreate, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.code == code).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    member = db.query(Member).filter(
        Member.id == body.member_id,
        Member.team_id == team.id
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    event = Event(
        team_id=team.id,
        member_id=body.member_id,
        title=body.title,
        start_at=body.start_at,
        end_at=body.end_at,
        memo=body.memo
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.put("/teams/{code}/events/{event_id}", response_model=EventOut)
def update_event(code: str, event_id: str, body: EventUpdate, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.code == code).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    event = db.query(Event).filter(Event.id == event_id, Event.team_id == team.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    event.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(event)
    return event

@router.delete("/teams/{code}/events/{event_id}", status_code=204)
def delete_event(code: str, event_id: str, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.code == code).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    event = db.query(Event).filter(Event.id == event_id, Event.team_id == team.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
