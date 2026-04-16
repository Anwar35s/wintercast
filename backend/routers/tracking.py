from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from pydantic import BaseModel
import httpx, os, json, time

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

MORALIS_KEY = os.environ.get("MORALIS_API_KEY")
ETHERSCAN_KEY = os.environ.get("ETHERSCAN_API_KEY")

# In-memory store (upgrade to DB later)
tracked_wallets = {}

class TrackRequest(BaseModel):
    address: str
    email: str
    threshold_usd: int = 50000

@router.post("/track")
@limiter.limit("5/minute")
async def track_wallet(request: Request, req: TrackRequest):
    key = f"{req.address.lower()}:{req.email.lower()}"
    tracked_wallets[key] = {
        "address": req.address,
        "email": req.email,
        "threshold_usd": req.threshold_usd,
        "added_at": time.time(),
    }
    return {"success": True, "message": f"Now tracking {req.address[:8]}... Alerts will be sent to {req.email}"}

@router.get("/track")
async def get_tracked(email: str = ""):
    if not email:
        return {"tracked": []}
    wallets = [v for k, v in tracked_wallets.items() if v["email"].lower() == email.lower()]
    return {"tracked": wallets}
