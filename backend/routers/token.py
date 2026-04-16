from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
import httpx, os

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()
MORALIS_KEY = os.environ.get("MORALIS_API_KEY")
ETHERSCAN_KEY = os.environ.get("ETHERSCAN_API_KEY")

@router.get("/token/{address}")
@limiter.limit("10/minute")
async def get_token(address: str, request: Request):
    headers = {"X-API-Key": MORALIS_KEY}
    meta, price_data, holders = {}, {}, []

    async with httpx.AsyncClient(timeout=20) as client:
        try:
            r = await client.get(f"https://deep-index.moralis.io/api/v2.2/erc20/metadata", headers=headers, params={"chain":"eth","addresses[0]":address})
            if r.status_code == 200 and r.json(): meta = r.json()[0]
        except Exception: pass

        try:
            r = await client.get(f"https://deep-index.moralis.io/api/v2.2/erc20/{address}/price", headers=headers, params={"chain":"eth"})
            if r.status_code == 200: price_data = r.json()
        except Exception: pass

        try:
            r = await client.get("https://api.etherscan.io/v2/api", params={"chainid":1,"module":"token","action":"tokenholderlist","contractaddress":address,"page":1,"offset":10,"apikey":ETHERSCAN_KEY})
            if r.status_code == 200 and r.json().get("status") == "1":
                for h in r.json().get("result", []):
                    holders.append({"address": h.get("TokenHolderAddress",""), "balance": h.get("TokenHolderQuantity","0"), "percentage": 0})
        except Exception: pass

    price_usd = float(price_data.get("usdPrice", 0) or 0)
    total_supply = float(meta.get("total_supply_formatted", 1) or 1)
    for h in holders:
        try: h["percentage"] = round(float(h["balance"]) / total_supply * 100, 4)
        except: h["percentage"] = 0

    top_10_pct = sum(h["percentage"] for h in holders[:10])
    return {
        "success": True,
        "token": {
            "address": address,
            "name": meta.get("name","Unknown"),
            "symbol": meta.get("symbol","?"),
            "price_usd": price_usd,
            "market_cap": price_usd * total_supply,
            "volume_24h": float(price_data.get("24hrVolume", 0) or 0),
            "holder_count": 0,
            "top_holders": holders,
            "concentration_risk": "HIGH" if top_10_pct > 50 else "MEDIUM" if top_10_pct > 30 else "LOW",
            "liquidity_risk": "HIGH" if price_usd < 0.0001 else "MEDIUM" if price_usd < 1 else "LOW",
        }
    }
