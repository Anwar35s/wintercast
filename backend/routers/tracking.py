from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from pydantic import BaseModel
import time

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()
tracked_wallets = {}

class TrackRequest(BaseModel):
    address: str
    email: str
    threshold_usd: int = 50000

@router.post("/track")
@limiter.limit("5/minute")
async def track_wallet(request: Request, req: TrackRequest):
    key = f"{req.address.lower()}:{req.email.lower()}"
    tracked_wallets[key] = {"address": req.address, "email": req.email, "threshold_usd": req.threshold_usd, "added_at": time.time()}
    return {"success": True, "message": f"Now tracking {req.address[:8]}..."}

@router.get("/track")
async def get_tracked(email: str = ""):
    wallets = [v for k,v in tracked_wallets.items() if v["email"].lower() == email.lower()]
    return {"tracked": wallets}
