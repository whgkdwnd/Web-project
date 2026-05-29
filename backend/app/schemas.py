from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TeamCreate(BaseModel):
    name: str

class TeamOut(BaseModel):
    id: str
    code: str
    name: str
    model_config = {"from_attributes": True}

class MemberCreate(BaseModel):
    name: str
    color: str

class MemberOut(BaseModel):
    id: str
    name: str
    color: str
    model_config = {"from_attributes": True}

class EventCreate(BaseModel):
    member_id: str
    title: str
    start_at: datetime
    end_at: datetime
    memo: Optional[str] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    memo: Optional[str] = None

class EventOut(BaseModel):
    id: str
    title: str
    start_at: datetime
    end_at: datetime
    memo: Optional[str] = None
    member: MemberOut
    model_config = {"from_attributes": True}
