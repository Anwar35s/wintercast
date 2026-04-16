from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
import httpx, os

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

MORALIS_KEY = os.environ.get("MORALIS_API_KEY")
CHAINS = ["eth", "base", "polygon", "arbitrum", "bsc", "optimism"]

@router.get("/portfolio/{address}")
@limiter.limit("10/minute")
async def get_portfolio(address: str, request: Request):
    headers = {"X-API-Key": MORALIS_KEY}
    all_tokens = []
    chain_breakdown = {}

    async with httpx.AsyncClient(timeout=20) as client:
        for chain in CHAINS:
            try:
                r = await client.get(
                    f"https://deep-index.moralis.io/api/v2.2/wallets/{address}/tokens",
                    headers=headers,
                    params={"chain": chain, "exclude_spam": "true", "exclude_unverified_contracts": "true"}
                )
                if r.status_code != 200:
                    continue
                for t in r.json().get("result", []):
                    try:
                        usd = float(t.get("usd_value") or 0)
                        if usd < 1:
                            continue
                        all_tokens.append({
                            "symbol": t.get("symbol", "?"),
                            "name": t.get("name", "Unknown"),
                            "balance": float(t.get("balance_formatted") or 0),
                            "usd_value": round(usd, 2),
                            "price_usd": round(float(t.get("usd_price") or 0), 6),
                            "chain": chain,
                            "token_address": t.get("token_address", ""),
                            "percent_of_portfolio": 0,
                        })
                        chain_breakdown[chain] = round(chain_breakdown.get(chain, 0) + usd, 2)
                    except Exception:
                        continue
            except Exception:
                continue

    all_tokens.sort(key=lambda x: x["usd_value"], reverse=True)
    total_usd = sum(t["usd_value"] for t in all_tokens)
    for t in all_tokens:
        t["percent_of_portfolio"] = round(t["usd_value"] / max(total_usd, 1) * 100, 1)

    return {
        "success": True,
        "portfolio": {
            "address": address,
            "total_usd": round(total_usd, 2),
            "tokens": all_tokens[:50],
            "chain_breakdown": chain_breakdown,
            "top_holding_pct": all_tokens[0]["percent_of_portfolio"] if all_tokens else 0,
        }
    }
