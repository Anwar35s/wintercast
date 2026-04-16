import httpx
import os

ETHERSCAN_KEY = os.environ.get("ETHERSCAN_API_KEY")
HELIUS_KEY = os.environ.get("HELIUS_API_KEY")
WHALE_THRESHOLD_USD = 50_000
ETH_PRICE = 2500
SOL_PRICE = 150

KNOWN_LABELS = {
    "0x28c6c06298d514db089934071355e5743bf21d60": "Binance Hot Wallet",
    "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8": "Binance Cold Wallet",
    "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503": "Binance 8",
    "0xf977814e90da44bfa03b6295a0616a897441acec": "Binance 20",
    "0xda9dfa130df4de4673b89022ee50ff26f6ea73cf": "Kraken",
    "0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13": "Kraken 2",
    "0xd8da6bf26964af9d7eed9e03e53415d37aa96045": "Vitalik.eth",
    "0x21a31ee1afc51d94c2efccaa2092ad1028285549": "Binance 15",
    "0xdfd5293d8e347dfe59e90efd55b2956a1343963d": "Binance 16",
}

WHALE_ADDRESSES = [
    "0x28C6c06298d514Db089934071355E5743bf21d60",
    "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
    "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
    "0xF977814e90dA44bFA03b6295A0616a897441acEc",
    "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
]

SOL_WHALE_ADDRESSES = [
    "5RbCuWSgCLLGHiqQ7yfvBYrmxDZghZnfybFzQzXJk2hU",
    "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    "DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1",
]

async def fetch_eth_moves(address: str, chain: str = "eth") -> list:
    moves = []
    base_url = "https://api.etherscan.io/api" if chain == "eth" else "https://api.basescan.org/api"
    
    async with httpx.AsyncClient(timeout=15) as client:
        # Native ETH transfers
        r = await client.get(base_url, params={
            "module": "account",
            "action": "txlist",
            "address": address,
            "startblock": 0,
            "endblock": 99999999,
            "page": 1,
            "offset": 10,
            "sort": "desc",
            "apikey": ETHERSCAN_KEY
        })
        if r.status_code == 200:
            data = r.json()
            for tx in data.get("result", []):
                try:
                    if not isinstance(tx, dict):
                        continue
                    value_eth = int(tx.get("value", 0)) / 1e18
                    value_usd = value_eth * ETH_PRICE
                    if value_usd < WHALE_THRESHOLD_USD:
                        continue
                    from_addr = tx.get("from", "").lower()
                    to_addr = tx.get("to", "").lower()
                    ts = int(tx.get("timeStamp", 0))
                    from datetime import datetime, timezone
                    timestamp = datetime.fromtimestamp(ts, tz=timezone.utc).isoformat() if ts else ""
                    moves.append({
                        "hash": tx.get("hash", ""),
                        "chain": chain,
                        "from_address": tx.get("from", ""),
                        "to_address": tx.get("to", ""),
                        "from_label": KNOWN_LABELS.get(from_addr),
                        "to_label": KNOWN_LABELS.get(to_addr),
                        "value_usd": round(value_usd, 0),
                        "value_native": round(value_eth, 4),
                        "native_symbol": "ETH",
                        "timestamp": timestamp,
                    })
                except Exception:
                    continue

        # ERC20 token transfers (stablecoins)
        r2 = await client.get(base_url, params={
            "module": "account",
            "action": "tokentx",
            "address": address,
            "page": 1,
            "offset": 10,
            "sort": "desc",
            "apikey": ETHERSCAN_KEY
        })
        if r2.status_code == 200:
            for tx in r2.json().get("result", []):
                try:
                    if not isinstance(tx, dict):
                        continue
                    symbol = tx.get("tokenSymbol", "")
                    decimals = int(tx.get("tokenDecimal", 18) or 18)
                    amount = int(tx.get("value", 0)) / (10 ** decimals)
                    if symbol in ["USDT", "USDC", "DAI", "BUSD", "USDE"]:
                        value_usd = amount
                    elif symbol in ["WETH", "cbETH", "stETH"]:
                        value_usd = amount * ETH_PRICE
                    elif symbol == "WBTC":
                        value_usd = amount * 60000
                    else:
                        continue
                    if value_usd < WHALE_THRESHOLD_USD:
                        continue
                    from_addr = tx.get("from", "").lower()
                    to_addr = tx.get("to", "").lower()
                    ts = int(tx.get("timeStamp", 0))
                    from datetime import datetime, timezone
                    timestamp = datetime.fromtimestamp(ts, tz=timezone.utc).isoformat() if ts else ""
                    moves.append({
                        "hash": tx.get("hash", ""),
                        "chain": chain,
                        "from_address": tx.get("from", ""),
                        "to_address": tx.get("to", ""),
                        "from_label": KNOWN_LABELS.get(from_addr),
                        "to_label": KNOWN_LABELS.get(to_addr),
                        "value_usd": round(value_usd, 0),
                        "value_native": round(amount, 2),
                        "native_symbol": symbol,
                        "timestamp": timestamp,
                    })
                except Exception:
                    continue
    return moves


async def fetch_recent_whale_moves() -> list:
    all_moves = []
    async with httpx.AsyncClient(timeout=30) as client:
        for address in WHALE_ADDRESSES:
            try:
                eth_moves = await fetch_eth_moves(address, "eth")
                all_moves.extend(eth_moves)
                base_moves = await fetch_eth_moves(address, "base")
                all_moves.extend(base_moves)
            except Exception:
                continue

    seen = set()
    unique = []
    for m in all_moves:
        if m["hash"] not in seen and m["hash"]:
            seen.add(m["hash"])
            unique.append(m)

    unique.sort(key=lambda x: x["value_usd"], reverse=True)
    return unique[:20]


async def fetch_solana_whale_moves() -> list:
    if not HELIUS_KEY:
        return []
    moves = []
    async with httpx.AsyncClient(timeout=15) as client:
        for address in SOL_WHALE_ADDRESSES:
            try:
                r = await client.get(
                    f"https://api.helius.xyz/v0/addresses/{address}/transactions",
                    params={"api-key": HELIUS_KEY, "limit": 10}
                )
                if r.status_code != 200:
                    continue
                txs = r.json() if isinstance(r.json(), list) else []
                for tx in txs:
                    native_transfers = tx.get("nativeTransfers", [])
                    for nt in native_transfers:
                        amount_sol = nt.get("amount", 0) / 1e9
                        value_usd = amount_sol * SOL_PRICE
                        if value_usd < WHALE_THRESHOLD_USD:
                            continue
                        from datetime import datetime, timezone
                        ts = tx.get("timestamp", 0)
                        timestamp = datetime.fromtimestamp(ts, tz=timezone.utc).isoformat() if ts else ""
                        moves.append({
                            "hash": tx.get("signature", ""),
                            "chain": "solana",
                            "from_address": nt.get("fromUserAccount", ""),
                            "to_address": nt.get("toUserAccount", ""),
                            "from_label": None,
                            "to_label": None,
                            "value_usd": round(value_usd, 0),
                            "value_native": round(amount_sol, 4),
                            "native_symbol": "SOL",
                            "timestamp": timestamp,
                        })
            except Exception:
                continue
    moves.sort(key=lambda x: x["value_usd"], reverse=True)
    return moves[:10]
