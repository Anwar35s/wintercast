import httpx
import os

HELIUS_KEY = os.environ.get("HELIUS_API_KEY")
BASE_URL = "https://api.helius.xyz/v0"

async def fetch_solana_wallet(address: str) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        tx_res = await client.get(
            f"{BASE_URL}/addresses/{address}/transactions",
            params={"api-key": HELIUS_KEY, "limit": 100}
        )
        tx_data = tx_res.json() if tx_res.status_code == 200 else []

        balance_res = await client.post(
            f"https://mainnet.helius-rpc.com/?api-key={HELIUS_KEY}",
            json={
                "jsonrpc": "2.0",
                "id": 1,
                "method": "getTokenAccountsByOwner",
                "params": [
                    address,
                    {"programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"},
                    {"encoding": "jsonParsed"}
                ]
            }
        )
        balance_data = balance_res.json()

    return {
        "transactions": tx_data if isinstance(tx_data, list) else [],
        "token_balances": balance_data.get("result", {}).get("value", []),
        "address": address,
        "chain": "solana"
    }
