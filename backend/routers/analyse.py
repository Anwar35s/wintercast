from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from models.wallet import AnalyseRequest, AnalyseResponse
from services.chain_detector import detect_chain
from services.evm_fetcher import fetch_evm_wallet
from services.solana_fetcher import fetch_solana_wallet
from services.feature_extractor import extract_evm_features, extract_solana_features
from services.ai_profiler import generate_profile
from services.security import validate_api_key, get_client_ip, log_security_event
import re, os, httpx

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

EVM_PATTERN = re.compile(r'^0x[a-fA-F0-9]{40}$')
SOL_PATTERN = re.compile(r'^[1-9A-HJ-NP-Za-km-z]{32,44}$')

def validate_address(address: str) -> str:
    address = address.strip()
    if len(address) > 100:
        raise HTTPException(status_code=400, detail="Invalid address")
    if not EVM_PATTERN.match(address) and not SOL_PATTERN.match(address):
        raise HTTPException(status_code=400, detail="Invalid wallet address format")
    return address

@router.post("/analyse", response_model=AnalyseResponse)
@limiter.limit("10/minute")
async def analyse_wallet(request: Request, req: AnalyseRequest):
    ip = get_client_ip(request)
    api_key = request.headers.get("X-API-Key")
    if not validate_api_key(api_key, ip):
        log_security_event("UNAUTHORISED_API_CALL", ip)
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    try:
        address = validate_address(req.address)
        chain = detect_chain(address)
        if chain == "evm":
            raw_data = await fetch_evm_wallet(address)
            features = extract_evm_features(raw_data)
        else:
            raw_data = await fetch_solana_wallet(address)
            features = extract_solana_features(raw_data)
        profile = await generate_profile(features)
        return AnalyseResponse(success=True, profile=profile)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/debug/moralis/{address}")
async def debug_moralis(address: str):
    MORALIS_KEY = os.environ.get("MORALIS_API_KEY")
    if not MORALIS_KEY:
        raise HTTPException(status_code=500, detail="MORALIS_API_KEY not set")
    async with httpx.AsyncClient(timeout=20) as client:
        results = {}
        for chain in ["eth", "base", "polygon", "bsc"]:
            r = await client.get(
                f"https://deep-index.moralis.io/api/v2.2/{address}",
                headers={"X-API-Key": MORALIS_KEY},
                params={"chain": chain, "limit": 10}
            )
            data = r.json()
            results[chain] = {
                "status": r.status_code,
                "total": data.get("total", 0),
                "count": len(data.get("result", [])),
                "error": data.get("message") if r.status_code != 200 else None,
            }
        token_r = await client.get(
            f"https://deep-index.moralis.io/api/v2.2/{address}/erc20/transfers",
            headers={"X-API-Key": MORALIS_KEY},
            params={"chain": "eth", "limit": 10}
        )
        token_data = token_r.json()
        return {
            "address": address,
            "transactions_by_chain": results,
            "token_transfers": {
                "status": token_r.status_code,
                "total": token_data.get("total", 0),
                "count": len(token_data.get("result", [])),
            }
        }
