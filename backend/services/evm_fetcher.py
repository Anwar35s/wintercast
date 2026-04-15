import httpx
import os

MORALIS_KEY = os.environ.get("MORALIS_API_KEY")
BASE_URL = "https://deep-index.moralis.io/api/v2.2"

async def fetch_evm_wallet(address: str) -> dict:
    headers = {"X-API-Key": MORALIS_KEY}
    async with httpx.AsyncClient(timeout=20) as client:
        tx_res = await client.get(
            f"{BASE_URL}/{address}",
            headers=headers,
            params={"chain": "eth", "limit": 100}
        )
        tx_data = tx_res.json()

        token_res = await client.get(
            f"{BASE_URL}/{address}/erc20/transfers",
            headers=headers,
            params={"chain": "eth", "limit": 100}
        )
        token_data = token_res.json()

        balance_res = await client.get(
            f"{BASE_URL}/{address}/erc20",
            headers=headers,
            params={"chain": "eth"}
        )
        balance_data = balance_res.json()

    return {
        "transactions": tx_data.get("result", []),
        "token_transfers": token_data.get("result", []),
        "token_balances": balance_data if isinstance(balance_data, list) else [],
        "address": address,
        "chain": "evm"
    }
