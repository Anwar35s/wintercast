from fastapi import APIRouter, HTTPException, Request
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

    async with httpx.AsyncClient(timeout=20) as client:
        # Token metadata
        meta = {}
        try:
            r = await client.get(
                f"https://deep-index.moralis.io/api/v2.2/erc20/metadata",
                headers=headers,
                params={"chain": "eth", "addresses[0]": address}
            )
            if r.status_code == 200:
                results = r.json()
                if results: meta = results[0]
        except Exception:
            pass

        # Token price
        price_data = {}
        try:
            r = await client.get(
                f"https://deep-index.moralis.io/api/v2.2/erc20/{address}/price",
                headers=headers,
                params={"chain": "eth"}
            )
            if r.status_code == 200:
                price_data = r.json()
        except Exception:
            pass

        # Top holders via Etherscan
        holders = []
        try:
            r = await client.get(
                "https://api.etherscan.io/v2/api",
                params={
                    "chainid": 1,
                    "module": "token",
                    "action": "tokenholderlist",
                    "contractaddress": address,
                    "page": 1,
                    "offset": 10,
                    "apikey": ETHERSCAN_KEY
                }
            )
            if r.status_code == 200 and r.json().get("status") == "1":
                for h in r.json().get("result", []):
                    try:
                        holders.append({
                            "address": h.get("TokenHolderAddress", ""),
                            "balance": h.get("TokenHolderQuantity", "0"),
                            "percentage": 0,
                        })
                    except Exception:
                        continue
        except Exception:
            pass

        # Holder count
        holder_count = 0
        try:
            r = await client.get(
                "https://api.etherscan.io/v2/api",
                params={
                    "chainid": 1,
                    "module": "token",
                    "action": "tokeninfo",
                    "contractaddress": address,
                    "apikey": ETHERSCAN_KEY
                }
            )
            if r.status_code == 200 and r.json().get("status") == "1":
                info = r.json().get("result", [{}])
                if info: holder_count = int(info[0].get("holdersCount", 0) or 0)
        except Exception:
            pass

    price_usd = float(price_data.get("usdPrice", 0) or 0)
    market_cap = float(price_data.get("usdPriceFormatted", 0) or price_usd) * float(meta.get("total_supply_formatted", 0) or 0)

    # Calculate holder percentages
    total_supply = float(meta.get("total_supply_formatted", 1) or 1)
    for h in holders:
        try:
            h["percentage"] = round(float(h["balance"]) / total_supply * 100, 4)
        except Exception:
            h["percentage"] = 0

    # Risk assessment
    top_10_pct = sum(h["percentage"] for h in holders[:10])
    concentration_risk = "HIGH" if top_10_pct > 50 else "MEDIUM" if top_10_pct > 30 else "LOW"
    liquidity_risk = "HIGH" if price_usd < 0.0001 else "MEDIUM" if price_usd < 1 else "LOW"

    return {
        "success": True,
        "token": {
            "address": address,
            "name": meta.get("name", "Unknown"),
            "symbol": meta.get("symbol", "?"),
            "decimals": meta.get("decimals", 18),
            "total_supply": meta.get("total_supply_formatted", 0),
            "price_usd": price_usd,
            "market_cap": market_cap,
            "volume_24h": float(price_data.get("24hrVolume", 0) or 0),
            "holder_count": holder_count,
            "top_holders": holders,
            "concentration_risk": concentration_risk,
            "liquidity_risk": liquidity_risk,
            "age_days": None,
        }
    }
