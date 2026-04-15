import httpx

async def resolve_ens(address: str) -> str | None:
    """Resolve an EVM address to its ENS name if it has one."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(
                f"https://api.ensideas.com/ens/resolve/{address}"
            )
            if r.status_code == 200:
                data = r.json()
                return data.get("name")
    except Exception:
        pass
    return None
