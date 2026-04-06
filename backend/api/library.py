import json
import os
import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

library_router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DB_FILE = os.path.join(DATA_DIR, "narratives.json")

class NarrativeEntry(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = ""
    narrative: str
    config: Optional[Dict[str, Any]] = None
    state_update_fn: Optional[str] = ""

def ensure_db():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    if not os.path.exists(DB_FILE):
        # Seed microgrid to start
        from backend.api.routes import get_examples
        ex = get_examples()
        mg = ex.get("microgrid", {})
        seed_data = [{
            "id": str(uuid.uuid4()),
            "title": "Microgrid Transition",
            "description": "Adoption of decentralized microgrids interacting with a centralized utility.",
            "narrative": mg.get("narrative", ""),
            "config": mg.get("config", {}),
            "state_update_fn": mg.get("state_update_fn", "")
        }]
        with open(DB_FILE, "w") as f:
            json.dump(seed_data, f, indent=2)

def read_db() -> List[Dict[str, Any]]:
    ensure_db()
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return []

def write_db(data: List[Dict[str, Any]]):
    ensure_db()
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=2)

@library_router.get("/narratives")
async def list_narratives():
    return {"narratives": read_db()}

@library_router.post("/narratives")
async def create_narrative(req: NarrativeEntry):
    db = read_db()
    new_entry = req.dict()
    new_entry["id"] = str(uuid.uuid4())
    db.append(new_entry)
    write_db(db)
    return {"status": "success", "narrative": new_entry}

@library_router.put("/narratives/{n_id}")
async def update_narrative(n_id: str, req: NarrativeEntry):
    db = read_db()
    for i, n in enumerate(db):
        if n["id"] == n_id:
            updated = req.dict()
            updated["id"] = n_id
            db[i] = updated
            write_db(db)
            return {"status": "success", "narrative": updated}
    raise HTTPException(status_code=404, detail="Narrative not found")

@library_router.delete("/narratives/{n_id}")
async def delete_narrative(n_id: str):
    db = read_db()
    filtered = [n for n in db if n["id"] != n_id]
    if len(filtered) == len(db):
        raise HTTPException(status_code=404, detail="Narrative not found")
    write_db(filtered)
    return {"status": "success"}
