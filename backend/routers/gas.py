from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
import httpx, os

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

ETHERSCAN_KEY = os.environ.get("ETHERSCAN_API_KEY")
HELIUS_KEY = os.environ.get("HELIUS_API_KEY")
ETH_PRICE = 2500
SOL_PRICE = 150

@router.get("/gas")
@limiter.limit("30/minute")
async def get_gas(request: Request):
    eth_gas = {}
    sol_gas = {}

    async with httpx.AsyncClient(timeout=10) as client:
        # ETH gas from Etherscan
        try:
            r = await client.get("https://api.etherscan.io/v2/api", params={
                "chainid": 1, "module": "gastracker",
                "action": "gasoracle", "apikey": ETHERSCAN_KEY
            })
            if r.status_code == 200 and r.json().get("status") == "1":
                d = r.json()["result"]
                slow = int(d.get("SafeGasPrice", 10))
                standard = int(d.get("ProposeGasPrice", 15))
                fast = int(d.get("FastGasPrice", 20))
                base = int(d.get("suggestBaseFee", 10) or 10)
                eth_gas = {
                    "slow": slow,
                    "standard": standard,
                    "fast": fast,
                    "instant": fast + 5,
                    "base_fee": base,
                    "priority_fee": max(standard - base, 1),
                }
        except Exception:
            eth_gas = {"slow": 10, "standard": 15, "fast": 25, "instant": 35, "base_fee": 8, "priority_fee": 2}

        # ETH price
        eth_price = ETH_PRICE
        sol_price = SOL_PRICE
        try:
            r = await client.get("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT")
            if r.status_code == 200:
                eth_price = float(r.json()["price"])
            r = await client.get("https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT")
            if r.status_code == 200:
                sol_price = float(r.json()["price"])
        except Exception:
            pass

        # Solana TPS and fees via Helius
        try:
            r = await client.post(
                f"https://mainnet.helius-rpc.com/?api-key={HELIUS_KEY}",
                json={"jsonrpc":"2.0","id":1,"method":"getRecentPerformanceSamples","params":[1]}
            )
            if r.status_code == 200:
                samples = r.json().get("result", [])
                if samples:
                    s = samples[0]
                    tps = round(s.get("numTransactions", 0) / max(s.get("samplePeriodSecs", 60), 1), 0)
                    sol_gas = {"avg_fee": 5000, "min_fee": 5000, "tps": int(tps)}
        except Exception:
            sol_gas = {"avg_fee": 5000, "min_fee": 5000, "tps": 2000}

    # Calculate transfer costs in USD
    eth_transfer_gwei = eth_gas.get("standard", 15) * 21000
    eth_transfer_eth = eth_transfer_gwei / 1e9
    eth_transfer_usd = eth_transfer_eth * eth_price

    sol_transfer_lamports = sol_gas.get("avg_fee", 5000)
    sol_transfer_sol = sol_transfer_lamports / 1e9
    sol_transfer_usd = sol_transfer_sol * sol_price

    return {
        "success": True,
        "gas": {
            "eth": eth_gas,
            "solana": sol_gas,
            "eth_price": round(eth_price, 2),
            "sol_price": round(sol_price, 2),
            "eth_transfer_cost_usd": round(eth_transfer_usd, 4),
            "sol_transfer_cost_usd": round(sol_transfer_usd, 6),
        }
    }
