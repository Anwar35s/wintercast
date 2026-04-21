from fastapi import APIRouter
from services.wallet_labels import get_label, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from services.whale_tracker import fetch_recent_whale_moves, fetch_solana_whale_moves
import time

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

_cache = {"data": [], "timestamp": 0}
CACHE_TTL = 60

@router.get("/whales")
@limiter.limit("30/minute")
async def get_whale_feed(request: Request):
    global _cache
    now = time.time()
    if now - _cache["timestamp"] < CACHE_TTL and _cache["data"]:
        return {"moves": _cache["data"], "cached": True, "next_refresh": int(CACHE_TTL - (now - _cache["timestamp"]))}
    try:
        evm_moves = await fetch_recent_whale_moves()
        sol_moves = await fetch_solana_whale_moves()
        all_moves = sorted(evm_moves + sol_moves, key=lambda x: x["value_usd"], reverse=True)[:20]
        _cache = {"data": all_moves, "timestamp": now}
        return {"moves": all_moves, "cached": False, "next_refresh": CACHE_TTL}
    except Exception as e:
        return {"moves": _cache.get("data", []), "error": str(e)}

@router.get("/whales/stats")
async def whale_stats():
    moves = _cache.get("data", [])
    if not moves:
        return {"total_volume_usd": 0, "move_count": 0, "largest_move_usd": 0}
    return {
        "total_volume_usd": sum(m["value_usd"] for m in moves),
        "move_count": len(moves),
        "largest_move_usd": max(m["value_usd"] for m in moves),
    }
