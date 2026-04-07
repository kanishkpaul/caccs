import json
import os
import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.config import DATABASE_URL

# Database setup
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class NarrativeModel(Base):
    __tablename__ = "narratives"
    id = Column(String(36), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    narrative = Column(Text, nullable=False)
    config = Column(JSON)
    state_update_fn = Column(Text)

# Create tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database connection/table creation failed: {e}")

library_router = APIRouter()

class NarrativeEntry(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = ""
    narrative: str
    config: Optional[Dict[str, Any]] = None
    state_update_fn: Optional[str] = ""

@library_router.get("/narratives")
async def list_narratives():
    db = SessionLocal()
    try:
        narratives = db.query(NarrativeModel).all()
        return {"narratives": [
            {
                "id": n.id,
                "title": n.title,
                "description": n.description,
                "narrative": n.narrative,
                "config": n.config,
                "state_update_fn": n.state_update_fn
            } for n in narratives
        ]}
    finally:
        db.close()

@library_router.post("/narratives")
async def create_narrative(req: NarrativeEntry):
    db = SessionLocal()
    try:
        new_entry = NarrativeModel(
            id=str(uuid.uuid4()),
            title=req.title,
            description=req.description,
            narrative=req.narrative,
            config=req.config,
            state_update_fn=req.state_update_fn
        )
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
        print(f"--- DEBUG: SAVED NARRATIVE: {new_entry.title} (ID: {new_entry.id}) ---")
        return {
            "status": "success", 
            "narrative": {
                "id": new_entry.id,
                "title": new_entry.title,
                "description": new_entry.description,
                "narrative": new_entry.narrative,
                "config": new_entry.config,
                "state_update_fn": new_entry.state_update_fn
            }
        }
    except Exception as e:
        print(f"--- ERROR: FAILED TO SAVE NARRATIVE: {e} ---")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@library_router.put("/narratives/{n_id}")
async def update_narrative(n_id: str, req: NarrativeEntry):
    db = SessionLocal()
    try:
        n = db.query(NarrativeModel).filter(NarrativeModel.id == n_id).first()
        if not n:
            raise HTTPException(status_code=404, detail="Narrative not found")
        
        n.title = req.title
        n.description = req.description
        n.narrative = req.narrative
        n.config = req.config
        n.state_update_fn = req.state_update_fn
        
        db.commit()
        return {"status": "success"}
    finally:
        db.close()

@library_router.delete("/narratives/{n_id}")
async def delete_narrative(n_id: str):
    db = SessionLocal()
    try:
        n = db.query(NarrativeModel).filter(NarrativeModel.id == n_id).first()
        if not n:
            raise HTTPException(status_code=404, detail="Narrative not found")
        db.delete(n)
        db.commit()
        return {"status": "success"}
    finally:
        db.close()
