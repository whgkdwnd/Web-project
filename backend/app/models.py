import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Team(Base):
    __tablename__ = "teams"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(8), unique=True, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    members = relationship("Member", back_populates="team")
    events = relationship("Event", back_populates="team")

class Member(Base):
    __tablename__ = "members"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    team_id = Column(String(36), ForeignKey("teams.id"), nullable=False)
    name = Column(String, nullable=False)
    color = Column(String(7), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    team = relationship("Team", back_populates="members")
    events = relationship("Event", back_populates="member")

class Event(Base):
    __tablename__ = "events"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    team_id = Column(String(36), ForeignKey("teams.id"), nullable=False)
    member_id = Column(String(36), ForeignKey("members.id"), nullable=False)
    title = Column(String, nullable=False)
    start_at = Column(DateTime, nullable=False)
    end_at = Column(DateTime, nullable=False)
    memo = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    team = relationship("Team", back_populates="events")
    member = relationship("Member", back_populates="events")
