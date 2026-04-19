import httpx
import os

MORALIS_KEY = os.environ.get("MORALIS_API_KEY")
BASE_URL = "https://deep-index.moralis.io/api/v2.2"

async def fetch_evm_wallet(address: str) -> dict:
    headers = {"X-API-Key": MORALIS_KEY}
    
    async with httpx.AsyncClient(timeout=30) as client:
        # Fetch up to 500 transactions (5 pages of 100)
        all_txs = []
        total_tx_count = 0
        cursor = None
        for i in range(5):
            params = {"chain": "eth", "limit": 100}
            if cursor:
                params["cursor"] = cursor
            r = await client.get(
                f"{BASE_URL}/{address}",
                headers=headers,
                params=params
            )
            data = r.json()
            if i == 0:
                total_tx_count = data.get("total") or 0
            results = data.get("result", [])
            all_txs.extend(results)
            cursor = data.get("cursor")
            if not cursor or len(results) < 100:
                break

        # Fetch token transfers (up to 200)
        all_transfers = []
        cursor = None
        for _ in range(2):
            params = {"chain": "eth", "limit": 100}
            if cursor:
                params["cursor"] = cursor
            r = await client.get(
                f"{BASE_URL}/{address}/erc20/transfers",
                headers=headers,
                params=params
            )
            data = r.json()
            results = data.get("result", [])
            all_transfers.extend(results)
            cursor = data.get("cursor")
            if not cursor or len(results) < 100:
                break

        # Fetch token balances
        balance_r = await client.get(
            f"{BASE_URL}/{address}/erc20",
            headers=headers,
            params={"chain": "eth"}
        )
        balance_data = balance_r.json()

    return {
        "transactions": all_txs,
        "token_transfers": all_transfers,
        "token_balances": balance_data if isinstance(balance_data, list) else [],
        "address": address,
        "chain": "evm",
        "total_tx_count": total_tx_count
    }
