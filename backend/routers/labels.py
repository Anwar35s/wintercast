from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from services.wallet_labels import get_label, search_labels, get_all_labels, add_label
from pydantic import BaseModel
import os

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

@router.get("/labels/{address}")
@limiter.limit("60/minute")
async def get_wallet_label(address: str, request: Request):
    label = get_label(address)
    if label:
        return {"success": True, "address": address, "label": label}
    return {"success": False, "label": None}

@router.get("/labels")
@limiter.limit("30/minute")
async def search_wallet_labels(request: Request, q: str = ""):
    if q:
        results = search_labels(q)
        return {"success": True, "results": results, "count": len(results)}
    all_labels = get_all_labels()
    return {"success": True, "total": len(all_labels), "categories": {
        "exchanges": sum(1 for v in all_labels.values() if v["category"] == "exchange"),
        "protocols": sum(1 for v in all_labels.values() if v["category"] == "protocol"),
        "whales": sum(1 for v in all_labels.values() if v["category"] == "whale"),
        "mev": sum(1 for v in all_labels.values() if v["category"] == "mev"),
        "bridges": sum(1 for v in all_labels.values() if v["category"] == "bridge"),
        "influencers": sum(1 for v in all_labels.values() if v["category"] == "influencer"),
    }}

class AddLabelRequest(BaseModel):
    address: str
    label: str
    category: str
    icon: str = "🏷️"
    risk: str = "unknown"
    monitor_key: str

@router.post("/labels")
@limiter.limit("10/minute")
async def add_wallet_label(req: AddLabelRequest, request: Request):
    monitor_key = os.environ.get("MONITOR_KEY", "")
    if req.monitor_key != monitor_key:
        return {"success": False, "error": "Unauthorized"}
    add_label(req.address, req.label, req.category, req.icon, req.risk)
    return {"success": True, "message": f"Label added for {req.address[:8]}..."}
