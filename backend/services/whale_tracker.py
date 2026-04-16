import httpx
import os
import time

MORALIS_KEY = os.environ.get("MORALIS_API_KEY")
WHALE_THRESHOLD_USD = 100_000
ETH_PRICE = 2500
SOL_PRICE = 150
BNB_PRICE = 400

KNOWN_LABELS = {
    "0x28c6c06298d514db089934071355e5743bf21d60": "Binance Hot Wallet",
    "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8": "Binance Cold Wallet",
    "0xd8da6bf26964af9d7eed9e03e53415d37aa96045": "Vitalik.eth",
}

async def fetch_recent_whale_moves() -> list:
    moves = []
    headers = {"X-API-Key": MORALIS_KEY}
    async with httpx.AsyncClient(timeout=15) as client:
        for chain, price in [("eth", ETH_PRICE), ("base", ETH_PRICE), ("bsc", BNB_PRICE)]:
            try:
                r = await client.get(
                    "https://deep-index.moralis.io/api/v2.2/transactions",
                    headers=headers,
                    params={"chain": chain, "limit": 20}
                )
                if r.status_code != 200:
                    continue
                for tx in r.json().get("result", []):
                    try:
                        value_usd = float(tx.get("value", 0)) / 1e18 * price
                        if value_usd < WHALE_THRESHOLD_USD:
                            continue
                        from_addr = tx.get("from_address", "").lower()
                        to_addr = tx.get("to_address", "").lower()
                        moves.append({
                            "hash": tx.get("hash", ""),
                            "chain": chain,
                            "from_address": tx.get("from_address", ""),
                            "to_address": tx.get("to_address", ""),
                            "from_label": KNOWN_LABELS.get(from_addr),
                            "to_label": KNOWN_LABELS.get(to_addr),
                            "value_usd": round(value_usd, 0),
                            "value_native": round(float(tx.get("value", 0)) / 1e18, 4),
                            "native_symbol": "ETH" if chain in ["eth", "base"] else "BNB",
                            "timestamp": tx.get("block_timestamp", ""),
                        })
                    except Exception:
                        continue
            except Exception:
                continue
    moves.sort(key=lambda x: x["value_usd"], reverse=True)
    return moves[:20]

async def fetch_solana_whale_moves() -> list:
    return []
