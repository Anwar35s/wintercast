from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from models.wallet import AnalyseRequest, AnalyseResponse
from services.chain_detector import detect_chain
from services.evm_fetcher import fetch_evm_wallet
from services.solana_fetcher import fetch_solana_wallet
from services.feature_extractor import extract_evm_features, extract_solana_features
from services.ai_profiler import generate_profile
import re

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

EVM_PATTERN = re.compile(r'^0x[a-fA-F0-9]{40}$')
SOL_PATTERN = re.compile(r'^[1-9A-HJ-NP-Za-km-z]{32,44}$')

def validate_address(address: str) -> str:
    address = address.strip()
    if len(address) > 100:
        raise HTTPException(status_code=400, detail="Invalid address length")
    if not EVM_PATTERN.match(address) and not SOL_PATTERN.match(address):
        raise HTTPException(status_code=400, detail="Invalid wallet address format")
    return address

@router.post("/analyse", response_model=AnalyseResponse)
@limiter.limit("10/minute")
async def analyse_wallet(request: Request, req: AnalyseRequest):
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
