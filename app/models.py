from app.app import db

from sqlalchemy import Integer, String, DateTime, ForeignKey, JSON, Column
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

class User(db.Model):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(unique=True)
    hash: Mapped[str] = mapped_column(unique=True)
    tokens: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    Workflow = db.relationship("Workflow", backref="user")
    Generation = db.relationship("Generation", backref="user")

def __repr__(self):
    return f"User with name {self.id} and email {self.email}"

class Workflow(db.Model):
    __tablename__ = "workflow"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"))
    blueprint_id: Mapped[int] = mapped_column(Integer, ForeignKey("blueprint.id"))
    title: Mapped[str] = mapped_column(unique=False)
    description: Mapped[str] = mapped_column(unique=False)
    #Workflow JSON data
    workflow = mapped_column(JSON, nullable=True, unique=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

class Blueprint(db.Model):
    __tablename__ = "blueprint"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(unique=False) 
    Workflow = db.relationship("Workflow", backref="blueprint")
    Generation = db.relationship("Generation", backref="blueprint")

class Generation(db.Model):
    __tablename__ = "generation"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"))
    path: Mapped[str] = mapped_column(unique=False) 
    blueprint_id: Mapped[int] = mapped_column(Integer, ForeignKey("blueprint.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
