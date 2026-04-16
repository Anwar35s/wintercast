import httpx
import os

MORALIS_KEY = os.environ.get("MORALIS_API_KEY")

async def resolve_ens(address: str) -> str | None:
    """Resolve EVM address to ENS name using Moralis."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(
                f"https://deep-index.moralis.io/api/v2.2/resolve/{address}/reverse",
                headers={"X-API-Key": MORALIS_KEY}
            )
            if r.status_code == 200:
                data = r.json()
                return data.get("name")
    except Exception:
        pass
    return None
