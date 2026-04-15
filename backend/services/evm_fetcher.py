import httpx
import os
from dotenv import load_dotenv

load_dotenv()

MORALIS_KEY = os.getenv("MORALIS_API_KEY")
BASE_URL = "https://deep-index.moralis.io/api/v2.2"
HEADERS = {"X-API-Key": MORALIS_KEY}


async def fetch_evm_wallet(address: str) -> dict:
    """
    Fetches transaction history, token balances, and DeFi data
    for an EVM wallet using Moralis API.
    """
    async with httpx.AsyncClient(timeout=20) as client:
        # Fetch transaction history
        tx_res = await client.get(
            f"{BASE_URL}/{address}",
            headers=HEADERS,
            params={"chain": "eth", "limit": 100}
        )
        tx_data = tx_res.json()

        # Fetch ERC20 token transfers
        token_res = await client.get(
            f"{BASE_URL}/{address}/erc20/transfers",
            headers=HEADERS,
            params={"chain": "eth", "limit": 100}
        )
        token_data = token_res.json()

        # Fetch current token balances
        balance_res = await client.get(
            f"{BASE_URL}/{address}/erc20",
            headers=HEADERS,
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
