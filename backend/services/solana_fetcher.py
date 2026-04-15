import httpx
import os

HELIUS_KEY = os.environ.get("HELIUS_API_KEY")

async def fetch_solana_wallet(address: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:

        all_txs = []
        before_sig = None
        for _ in range(5):
            params = {"api-key": HELIUS_KEY, "limit": 100}
            if before_sig:
                params["before"] = before_sig
            r = await client.get(
                f"https://api.helius.xyz/v0/addresses/{address}/transactions",
                params=params
            )
            if r.status_code != 200:
                break
            batch = r.json()
            if not batch:
                break
            all_txs.extend(batch)
            if len(batch) < 100:
                break
            before_sig = batch[-1].get("signature")

        balances = []
        try:
            r = await client.post(
                f"https://mainnet.helius-rpc.com/?api-key={HELIUS_KEY}",
                json={"jsonrpc":"2.0","id":1,"method":"getTokenAccountsByOwner","params":[address,{"programId":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"},{"encoding":"jsonParsed"}]}
            )
            if r.status_code == 200:
                balances = r.json().get("result", {}).get("value", [])
        except Exception:
            pass

        sol_balance = 0.0
        try:
            r = await client.post(
                f"https://mainnet.helius-rpc.com/?api-key={HELIUS_KEY}",
                json={"jsonrpc":"2.0","id":1,"method":"getBalance","params":[address]}
            )
            if r.status_code == 200:
                sol_balance = r.json().get("result", {}).get("value", 0) / 1e9
        except Exception:
            pass

        swaps = [t for t in all_txs if t.get("type") == "SWAP"]
        nft_sales = [t for t in all_txs if t.get("type") in ["NFT_SALE", "NFT_MINT"]]

    return {
        "transactions": all_txs,
        "swaps": swaps,
        "nft_sales": nft_sales,
        "token_balances": balances,
        "sol_balance": sol_balance,
        "address": address,
        "chain": "solana"
    }
