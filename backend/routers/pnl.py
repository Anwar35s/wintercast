from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
import httpx, os

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()
MORALIS_KEY = os.environ.get("MORALIS_API_KEY")

@router.get("/pnl/{address}")
@limiter.limit("10/minute")
async def get_pnl(address: str, request: Request):
    headers = {"X-API-Key": MORALIS_KEY}
    async with httpx.AsyncClient(timeout=20) as client:
        try:
            r = await client.get(
                f"https://deep-index.moralis.io/api/v2.2/wallets/{address}/profitability",
                headers=headers,
                params={"chain":"eth","limit":20}
            )
            if r.status_code != 200:
                return {"success":False,"error":"PnL data unavailable"}

            data = r.json()
            tokens = data.get("result", [])

            total_pnl = sum(float(t.get("total_pnl_usd",0) or 0) for t in tokens)
            profitable = sum(1 for t in tokens if float(t.get("total_pnl_usd",0) or 0) > 0)
            total_trades = sum(int(t.get("count_of_trades",0) or 0) for t in tokens)
            best_trade = max((float(t.get("total_pnl_usd",0) or 0) for t in tokens), default=0)

            formatted_tokens = []
            for t in tokens:
                formatted_tokens.append({
                    "symbol": t.get("token_symbol","?"),
                    "name": t.get("name",""),
                    "total_pnl_usd": float(t.get("total_pnl_usd",0) or 0),
                    "realized_profit_percentage": float(t.get("realized_profit_percentage",0) or 0),
                    "count_of_trades": int(t.get("count_of_trades",0) or 0),
                    "avg_buy_price_usd": float(t.get("avg_buy_price_usd",0) or 0),
                })

            formatted_tokens.sort(key=lambda x: abs(x["total_pnl_usd"]), reverse=True)

            return {
                "success": True,
                "pnl": {
                    "address": address,
                    "total_pnl_usd": round(total_pnl, 2),
                    "win_rate_pct": round(profitable / max(len(tokens),1) * 100, 1),
                    "total_trades": total_trades,
                    "best_trade_usd": round(best_trade, 2),
                    "tokens": formatted_tokens[:20],
                }
            }
        except Exception as e:
            return {"success":False,"error":str(e)}
