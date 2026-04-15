from fastapi import APIRouter, HTTPException
from models.wallet import AnalyseRequest, AnalyseResponse
from services.chain_detector import detect_chain
from services.evm_fetcher import fetch_evm_wallet
from services.solana_fetcher import fetch_solana_wallet
from services.feature_extractor import extract_evm_features, extract_solana_features
from services.ai_profiler import generate_profile

router = APIRouter()

@router.post("/analyse", response_model=AnalyseResponse)
async def analyse_wallet(req: AnalyseRequest):
    try:
        address = req.address.strip()

        # 1. Detect chain
        chain = detect_chain(address)

        # 2. Fetch raw on-chain data
        if chain == "evm":
            raw_data = await fetch_evm_wallet(address)
            features = extract_evm_features(raw_data)
        else:
            raw_data = await fetch_solana_wallet(address)
            features = extract_solana_features(raw_data)

        # 3. Generate AI profile
        profile = await generate_profile(features)

        return AnalyseResponse(success=True, profile=profile)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
