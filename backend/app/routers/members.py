# backend/app/routers/members.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Team, Member
from ..schemas import MemberCreate, MemberOut

router = APIRouter()

@router.post("/teams/{code}/members", response_model=MemberOut)
def create_member(code: str, body: MemberCreate, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.code == code).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    member = Member(team_id=team.id, name=body.name, color=body.color)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member

@router.get("/teams/{code}/members", response_model=List[MemberOut])
def get_members(code: str, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.code == code).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team.members
