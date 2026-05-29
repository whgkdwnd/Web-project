# backend/app/routers/teams.py
import random
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Team
from ..schemas import TeamCreate, TeamOut

router = APIRouter()

def _generate_code() -> str:
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=8))

@router.post("/teams", response_model=TeamOut)
def create_team(body: TeamCreate, db: Session = Depends(get_db)):
    code = _generate_code()
    while db.query(Team).filter(Team.code == code).first():
        code = _generate_code()
    team = Team(name=body.name, code=code)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team

@router.get("/teams/{code}", response_model=TeamOut)
def get_team(code: str, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.code == code).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team
