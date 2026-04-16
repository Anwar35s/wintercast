import httpx
import os

MORALIS_KEY = os.environ.get("MORALIS_API_KEY")
WHALE_THRESHOLD_USD = 50_000
ETH_PRICE = 2500
SOL_PRICE = 150
BNB_PRICE = 400

KNOWN_WHALES = [
    ("0x28C6c06298d514Db089934071355E5743bf21d60", "Binance Hot Wallet", "eth"),
    ("0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8", "Binance Cold Wallet", "eth"),
    ("0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503", "Binance 8", "eth"),
    ("0xF977814e90dA44bFA03b6295A0616a897441acEc", "Binance 20", "eth"),
    ("0x8894E0a0c962CB723c1976a4421c95949bE2D4E3", "Binance 21", "eth"),
    ("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", "Vitalik.eth", "eth"),
    ("0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf", "Kraken", "eth"),
    ("0x0A869d79a7052C7f1b55a8EbabbEa3420F0D1E13", "Kraken 2", "eth"),
    ("0x7589Bc718db556a5F6Bd0b66A3b5f7F6E6B8a72b", "FTX Estate", "eth"),
]

KNOWN_LABELS = {w[0].lower(): w[1] for w in KNOWN_WHALES}

async def fetch_recent_whale_moves() -> list:
    moves = []
    headers = {"X-API-Key": MORALIS_KEY}

    async with httpx.AsyncClient(timeout=20) as client:
        for address, label, chain in KNOWN_WHALES[:6]:
            price = ETH_PRICE if chain == "eth" else BNB_PRICE
            try:
                r = await client.get(
                    f"https://deep-index.moralis.io/api/v2.2/{address}",
                    headers=headers,
                    params={"chain": chain, "limit": 5}
                )
                if r.status_code != 200:
                    continue

                for tx in r.json().get("result", []):
                    try:
                        value_native = float(tx.get("value", 0)) / 1e18
                        value_usd = value_native * price
                        if value_usd < WHALE_THRESHOLD_USD:
                            continue

                        from_addr = tx.get("from_address", "").lower()
                        to_addr = tx.get("to_address", "").lower()

                        moves.append({
                            "hash": tx.get("hash", ""),
                            "chain": chain,
                            "from_address": tx.get("from_address", ""),
                            "to_address": tx.get("to_address", ""),
                            "from_label": KNOWN_LABELS.get(from_addr, label if from_addr == address.lower() else None),
                            "to_label": KNOWN_LABELS.get(to_addr),
                            "value_usd": round(value_usd, 0),
                            "value_native": round(value_native, 4),
                            "native_symbol": "ETH" if chain == "eth" else "BNB",
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
