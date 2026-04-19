from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from services.chain_detector import detect_chain
import httpx, os, time
from collections import defaultdict

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()
MORALIS_KEY = os.environ.get("MORALIS_API_KEY")
HELIUS_KEY = os.environ.get("HELIUS_API_KEY")

@router.get("/activity/{address}")
@limiter.limit("10/minute")
async def get_activity(address: str, request: Request):
    chain = detect_chain(address)
    
    if chain == "solana":
        return await get_solana_activity(address)
    else:
        return await get_evm_activity(address)

async def get_evm_activity(address: str):
    headers = {"X-API-Key": MORALIS_KEY}
    activity = []
    
    async with httpx.AsyncClient(timeout=20) as client:
        try:
            r = await client.get(
                f"https://deep-index.moralis.io/api/v2.2/wallets/{address}/defi/summary",
                headers=headers,
                params={"chain": "eth"}
            )
            
            # Get token swaps
            r2 = await client.get(
                f"https://deep-index.moralis.io/api/v2.2/{address}/erc20/transfers",
                headers=headers,
                params={"chain": "eth", "limit": 50}
            )
            
            if r2.status_code == 200:
                transfers = r2.json().get("result", [])
                token_stats = defaultdict(lambda: {"buys": 0, "sells": 0, "buy_usd": 0, "sell_usd": 0, "symbol": "", "name": ""})
                
                for t in transfers:
                    is_incoming = t.get("to_address", "").lower() == address.lower()
                    token_symbol = t.get("token_symbol") or "?"
                    token_name = t.get("token_name") or ""
                    
                    try:
                        decimals = int(t.get("token_decimals") or 18)
                        amount = float(t.get("value", 0)) / (10 ** decimals)
                        usd_price = float(t.get("usd_price") or 0)
                        value_usd = amount * usd_price
                    except:
                        amount = 0
                        value_usd = 0
                    
                    tx_type = "buy" if is_incoming else "sell"
                    
                    activity.append({
                        "type": tx_type,
                        "token_symbol": token_symbol,
                        "token_name": token_name,
                        "amount": round(amount, 6),
                        "value_usd": round(value_usd, 2),
                        "timestamp": int(t.get("block_timestamp", "0")[:10]) if t.get("block_timestamp") else 0,
                        "hash": t.get("transaction_hash", ""),
                    })
                    
                    token_stats[token_symbol]["symbol"] = token_symbol
                    token_stats[token_symbol]["name"] = token_name
                    if is_incoming:
                        token_stats[token_symbol]["buys"] += 1
                        token_stats[token_symbol]["buy_usd"] += value_usd
                    else:
                        token_stats[token_symbol]["sells"] += 1
                        token_stats[token_symbol]["sell_usd"] += value_usd

                top_tokens = []
                for sym, stats in token_stats.items():
                    net_usd = stats["buy_usd"] - stats["sell_usd"]
                    top_tokens.append({
                        "symbol": sym,
                        "name": stats["name"],
                        "buys": stats["buys"],
                        "sells": stats["sells"],
                        "net_usd": round(net_usd, 2),
                    })
                top_tokens.sort(key=lambda x: abs(x["net_usd"]), reverse=True)
                
                total_bought = sum(a["value_usd"] for a in activity if a["type"] == "buy")
                total_sold = sum(a["value_usd"] for a in activity if a["type"] == "sell")
                
                return {
                    "success": True,
                    "address": address,
                    "chain": "eth",
                    "total_trades": len(activity),
                    "total_bought_usd": round(total_bought, 2),
                    "total_sold_usd": round(total_sold, 2),
                    "unique_tokens": len(token_stats),
                    "top_tokens": top_tokens[:8],
                    "activity": activity[:50],
                }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    return {"success": False, "error": "Failed to fetch activity"}

async def get_solana_activity(address: str):
    activity = []
    
    async with httpx.AsyncClient(timeout=20) as client:
        try:
            r = await client.post(
                f"https://api.helius.xyz/v0/addresses/{address}/transactions",
                params={"api-key": HELIUS_KEY, "limit": 50, "type": "SWAP"},
            )
            
            if r.status_code == 200:
                txs = r.json()
                token_stats = defaultdict(lambda: {"buys": 0, "sells": 0, "buy_usd": 0, "sell_usd": 0})
                
                for tx in txs:
                    events = tx.get("events", {})
                    swap = events.get("swap", {})
                    if not swap:
                        continue
                    
                    token_in = swap.get("tokenInputs", [{}])[0] if swap.get("tokenInputs") else {}
                    token_out = swap.get("tokenOutputs", [{}])[0] if swap.get("tokenOutputs") else {}
                    
                    if token_out:
                        symbol = token_out.get("symbol") or "?"
                        amount = float(token_out.get("tokenAmount") or 0)
                        activity.append({
                            "type": "buy",
                            "token_symbol": symbol,
                            "token_name": token_out.get("name") or "",
                            "amount": round(amount, 4),
                            "value_usd": round(float(token_out.get("tokenAmountInUSD") or 0), 2),
                            "timestamp": tx.get("timestamp", 0),
                            "hash": tx.get("signature", ""),
                        })
                        token_stats[symbol]["buys"] += 1
                        token_stats[symbol]["buy_usd"] += float(token_out.get("tokenAmountInUSD") or 0)
                    
                    if token_in:
                        symbol = token_in.get("symbol") or "?"
                        amount = float(token_in.get("tokenAmount") or 0)
                        activity.append({
                            "type": "sell",
                            "token_symbol": symbol,
                            "token_name": token_in.get("name") or "",
                            "amount": round(amount, 4),
                            "value_usd": round(float(token_in.get("tokenAmountInUSD") or 0), 2),
                            "timestamp": tx.get("timestamp", 0),
                            "hash": tx.get("signature", ""),
                        })
                        token_stats[symbol]["sells"] += 1
                        token_stats[symbol]["sell_usd"] += float(token_in.get("tokenAmountInUSD") or 0)
                
                top_tokens = [{"symbol": s, "net_usd": round(v["buy_usd"]-v["sell_usd"], 2), "buys": v["buys"], "sells": v["sells"]} for s, v in token_stats.items()]
                top_tokens.sort(key=lambda x: abs(x["net_usd"]), reverse=True)
                
                total_bought = sum(a["value_usd"] for a in activity if a["type"] == "buy")
                total_sold = sum(a["value_usd"] for a in activity if a["type"] == "sell")
                
                return {
                    "success": True,
                    "address": address,
                    "chain": "solana",
                    "total_trades": len(activity),
                    "total_bought_usd": round(total_bought, 2),
                    "total_sold_usd": round(total_sold, 2),
                    "unique_tokens": len(token_stats),
                    "top_tokens": top_tokens[:8],
                    "activity": sorted(activity, key=lambda x: x["timestamp"], reverse=True)[:50],
                }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    return {"success": False, "error": "Failed to fetch Solana activity"}
