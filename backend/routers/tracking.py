from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from pydantic import BaseModel
from services.email_service import send_welcome_email, send_wallet_alert
import os, time

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()
TRACKED: dict = {}

class TrackRequest(BaseModel):
    address: str
    email: str
    threshold: float = 10000.0

class AlertRequest(BaseModel):
    address: str
    value_usd: float
    from_address: str
    to_address: str
    chain: str
    monitor_key: str

@router.post("/track")
@limiter.limit("10/minute")
async def track_wallet(req: TrackRequest, request: Request):
    addr = req.address.strip().lower()
    if not addr or not req.email or "@" not in req.email:
        return {"success": False, "error": "Invalid address or email"}
    if addr not in TRACKED:
        TRACKED[addr] = []
    existing = [t for t in TRACKED[addr] if t["email"] == req.email]
    if existing:
        return {"success": True, "message": "Already tracking this wallet"}
    TRACKED[addr].append({"email": req.email, "threshold": req.threshold, "created_at": time.time()})
    await send_welcome_email(req.email, req.address)
    return {"success": True, "message": f"Now tracking {req.address[:8]}... Alerts will be sent to {req.email}"}

@router.get("/track")
@limiter.limit("30/minute")
async def get_tracked(request: Request, email: str = ""):
    if not email:
        return {"success": True, "tracked": list(TRACKED.keys()), "total": len(TRACKED)}
    wallets = [addr for addr, trackers in TRACKED.items() if any(t["email"] == email for t in trackers)]
    return {"success": True, "tracked": wallets}

@router.post("/track/alert")
@limiter.limit("60/minute")
async def send_alert(req: AlertRequest, request: Request):
    monitor_key = os.environ.get("MONITOR_KEY", "")
    if req.monitor_key != monitor_key:
        return {"success": False, "error": "Unauthorized"}
    addr = req.address.strip().lower()
    if addr not in TRACKED:
        return {"success": True, "sent": 0}
    sent = 0
    for tracker in TRACKED[addr]:
        if req.value_usd >= tracker["threshold"]:
            ok = await send_wallet_alert(tracker["email"], req.address, req.value_usd, req.from_address, req.to_address, req.chain)
            if ok:
                sent += 1
    return {"success": True, "sent": sent}

@router.delete("/track")
@limiter.limit("10/minute")
async def untrack_wallet(request: Request, address: str, email: str):
    addr = address.strip().lower()
    if addr in TRACKED:
        TRACKED[addr] = [t for t in TRACKED[addr] if t["email"] != email]
        if not TRACKED[addr]:
            del TRACKED[addr]
    return {"success": True}
