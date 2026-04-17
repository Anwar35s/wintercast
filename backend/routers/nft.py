from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
import httpx, os

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()
MORALIS_KEY = os.environ.get("MORALIS_API_KEY")

@router.get("/nft/{address}")
@limiter.limit("10/minute")
async def get_nft(address: str, request: Request):
    headers = {"X-API-Key": MORALIS_KEY}
    async with httpx.AsyncClient(timeout=20) as client:
        try:
            r = await client.get(
                f"https://deep-index.moralis.io/api/v2.2/{address}/nft",
                headers=headers,
                params={"chain":"eth","limit":50,"exclude_spam":"true"}
            )
            if r.status_code != 200:
                return {"success":False,"error":"Failed to fetch NFT data"}

            nfts = r.json().get("result", [])
            collections = {}
            for nft in nfts:
                name = nft.get("name") or nft.get("token_address","Unknown")[:10]
                if name not in collections:
                    collections[name] = {"name":name,"count":0,"floor_price_usd":0,"token_address":nft.get("token_address","")}
                collections[name]["count"] += 1

            coll_list = sorted(collections.values(), key=lambda x: x["count"], reverse=True)
            return {
                "success": True,
                "total_nfts": len(nfts),
                "collections": coll_list[:20],
                "estimated_value_usd": 0,
                "floor_value_usd": 0,
            }
        except Exception as e:
            return {"success":False,"error":str(e)}
