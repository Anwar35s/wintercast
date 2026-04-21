"""
Token price service using CoinGecko free API
Caches prices for 5 minutes to avoid rate limits
"""
import httpx, time, asyncio

CACHE: dict = {}
CACHE_TTL = 300  # 5 minutes

COINGECKO_IDS = {
    "ETH": "ethereum", "BTC": "bitcoin", "SOL": "solana",
    "BNB": "binancecoin", "MATIC": "matic-network", "ARB": "arbitrum",
    "OP": "optimism", "AVAX": "avalanche-2", "LINK": "chainlink",
    "UNI": "uniswap", "AAVE": "aave", "CRV": "curve-dao-token",
    "MKR": "maker", "SNX": "synthetix-network-token", "COMP": "compound-governance-token",
    "SUSHI": "sushi", "1INCH": "1inch", "LDO": "lido-dao",
    "PEPE": "pepe", "SHIB": "shiba-inu", "DOGE": "dogecoin",
    "USDC": "usd-coin", "USDT": "tether", "DAI": "dai",
}

async def get_prices(symbols: list[str] = None) -> dict:
    now = time.time()
    
    # Check cache
    if "prices" in CACHE and now - CACHE["prices"]["timestamp"] < CACHE_TTL:
        return CACHE["prices"]["data"]
    
    if symbols is None:
        symbols = list(COINGECKO_IDS.keys())
    
    ids = [COINGECKO_IDS[s] for s in symbols if s in COINGECKO_IDS]
    ids_str = ",".join(ids)
    
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                f"https://api.coingecko.com/api/v3/simple/price",
                params={"ids": ids_str, "vs_currencies": "usd", "include_24hr_change": "true"}
            )
            if r.status_code == 200:
                data = r.json()
                # Convert back to symbol format
                prices = {}
                for symbol, cg_id in COINGECKO_IDS.items():
                    if cg_id in data:
                        prices[symbol] = {
                            "usd": data[cg_id].get("usd", 0),
                            "change_24h": data[cg_id].get("usd_24h_change", 0),
                        }
                CACHE["prices"] = {"data": prices, "timestamp": now}
                return prices
    except Exception as e:
        print(f"CoinGecko error: {e}")
    
    # Return cached if available even if stale
    return CACHE.get("prices", {}).get("data", {})

async def get_price(symbol: str) -> float:
    prices = await get_prices([symbol])
    return prices.get(symbol, {}).get("usd", 0)

async def convert_to_usd(amount: float, symbol: str) -> float:
    price = await get_price(symbol)
    return amount * price if price else 0
