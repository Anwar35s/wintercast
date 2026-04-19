from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from services.cache import get_cached_profiles
import random

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

LEGENDARY_WALLETS = [
    {"address":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045","archetype":"Smart Money","archetype_icon":"🧠","score":94,"chain":"eth","reason":"Ethereum co-founder. Early DeFi adopter, patient accumulator, rarely sells."},
    {"address":"0x28C6c06298d514Db089934071355E5743bf21d60","archetype":"The Whale","archetype_icon":"🐋","score":88,"chain":"eth","reason":"Binance hot wallet. Processes billions in daily volume with machine-like precision."},
    {"address":"0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8","archetype":"The Whale","archetype_icon":"🐋","score":85,"chain":"eth","reason":"Binance cold storage. One of the largest ETH holders on the network."},
]

@router.get("/hall")
@limiter.limit("20/minute")
async def get_hall(request: Request):
    profiles = get_cached_profiles()
    top_wallets = sorted(profiles, key=lambda x: x.get("score",0), reverse=True)[:10]

    if len(top_wallets) < 3:
        top_wallets = LEGENDARY_WALLETS + top_wallets

    daily = random.choice(LEGENDARY_WALLETS)

    return {
        "success": True,
        "daily_wallet": daily,
        "top_wallets": top_wallets[:10],
        "total": len(profiles),
    }
