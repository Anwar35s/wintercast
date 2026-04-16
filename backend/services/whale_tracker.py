import httpx
import os
from datetime import datetime, timezone

MORALIS_KEY = os.environ.get("MORALIS_API_KEY")
WHALE_THRESHOLD_USD = 50_000
ETH_PRICE = 2500

KNOWN_WHALES = [
    ("0x28C6c06298d514Db089934071355E5743bf21d60", "Binance Hot Wallet"),
    ("0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8", "Binance Cold Wallet"),
    ("0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503", "Binance 8"),
    ("0xF977814e90dA44bFA03b6295A0616a897441acEc", "Binance 20"),
    ("0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf", "Kraken"),
    ("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", "Vitalik.eth"),
]

KNOWN_LABELS = {w[0].lower(): w[1] for w in KNOWN_WHALES}

async def fetch_recent_whale_moves() -> list:
    moves = []
    headers = {"X-API-Key": MORALIS_KEY}

    async with httpx.AsyncClient(timeout=20) as client:
        for address, label in KNOWN_WHALES:
            try:
                # Use token transfers endpoint instead
                r = await client.get(
                    f"https://deep-index.moralis.io/api/v2.2/{address}/erc20/transfers",
                    headers=headers,
                    params={"chain": "eth", "limit": 5}
                )
                if r.status_code == 200:
                    for tx in r.json().get("result", []):
                        try:
                            decimals = int(tx.get("token_decimals", 18) or 18)
                            amount = float(tx.get("value", 0)) / (10 ** decimals)
                            symbol = tx.get("token_symbol", "")
                            # Estimate USD for USDT/USDC/DAI stablecoins
                            usd_value = 0
                            if symbol in ["USDT", "USDC", "DAI", "BUSD"]:
                                usd_value = amount
                            elif symbol == "WETH":
                                usd_value = amount * ETH_PRICE
                            elif symbol == "WBTC":
                                usd_value = amount * 60000
                            else:
                                continue

                            if usd_value < WHALE_THRESHOLD_USD:
                                continue

                            from_addr = tx.get("from_address", "").lower()
                            to_addr = tx.get("to_address", "").lower()

                            moves.append({
                                "hash": tx.get("transaction_hash", ""),
                                "chain": "eth",
                                "from_address": tx.get("from_address", ""),
                                "to_address": tx.get("to_address", ""),
                                "from_label": KNOWN_LABELS.get(from_addr, label if from_addr == address.lower() else None),
                                "to_label": KNOWN_LABELS.get(to_addr),
                                "value_usd": round(usd_value, 0),
                                "value_native": round(amount, 2),
                                "native_symbol": symbol,
                                "timestamp": tx.get("block_timestamp", ""),
                            })
                        except Exception:
                            continue

                # Also check native ETH transfers
                r2 = await client.get(
                    f"https://deep-index.moralis.io/api/v2.2/{address}",
                    headers=headers,
                    params={"chain": "eth", "limit": 5}
                )
                if r2.status_code == 200:
                    for tx in r2.json().get("result", []):
                        try:
                            value_eth = float(tx.get("value", 0)) / 1e18
                            value_usd = value_eth * ETH_PRICE
                            if value_usd < WHALE_THRESHOLD_USD:
                                continue
                            from_addr = tx.get("from_address", "").lower()
                            to_addr = tx.get("to_address", "").lower()
                            moves.append({
                                "hash": tx.get("hash", ""),
                                "chain": "eth",
                                "from_address": tx.get("from_address", ""),
                                "to_address": tx.get("to_address", ""),
                                "from_label": KNOWN_LABELS.get(from_addr, label if from_addr == address.lower() else None),
                                "to_label": KNOWN_LABELS.get(to_addr),
                                "value_usd": round(value_usd, 0),
                                "value_native": round(value_eth, 4),
                                "native_symbol": "ETH",
                                "timestamp": tx.get("block_timestamp", ""),
                            })
                        except Exception:
                            continue

            except Exception:
                continue

    # Remove duplicates by hash
    seen = set()
    unique_moves = []
    for m in moves:
        if m["hash"] not in seen:
            seen.add(m["hash"])
            unique_moves.append(m)

    unique_moves.sort(key=lambda x: x["value_usd"], reverse=True)
    return unique_moves[:20]

async def fetch_solana_whale_moves() -> list:
    return []
