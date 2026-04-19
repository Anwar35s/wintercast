from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from services.ai_profiler import generate_profile
from services.evm_fetcher import fetch_evm_wallet
from services.solana_fetcher import fetch_solana_wallet
from services.feature_extractor import extract_features
from services.chain_detector import detect_chain
from pydantic import BaseModel
import anthropic, os, asyncio

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

class BattleRequest(BaseModel):
    address1: str
    address2: str

@router.post("/battle")
@limiter.limit("5/minute")
async def wallet_battle(req: BattleRequest, request: Request):
    try:
        async def get_profile(address):
            chain = detect_chain(address)
            if chain == "solana":
                raw = await fetch_solana_wallet(address)
            else:
                raw = await fetch_evm_wallet(address)
            features = extract_features(raw, chain)
            profile = await generate_profile(features, address, chain)
            return profile, features, chain

        (p1, f1, c1), (p2, f2, c2) = await asyncio.gather(
            get_profile(req.address1),
            get_profile(req.address2)
        )

        winner = p1 if p1.score >= p2.score else p2

        prompt = f"""You are a crypto trading analyst judging a wallet battle. Write a 2-3 sentence verdict declaring the winner and explaining why, based on the stats below. Be decisive and entertaining.

Fighter 1: {p1.archetype} {p1.archetype_icon}
- Score: {p1.score}/100, Win rate: {p1.win_rate_pct}%, Risk: {p1.risk_level}

Fighter 2: {p2.archetype} {p2.archetype_icon}  
- Score: {p2.score}/100, Win rate: {p2.win_rate_pct}%, Risk: {p2.risk_level}

Winner: Fighter {"1" if winner.address == req.address1 else "2"}

Write the verdict."""

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=200,
            messages=[{"role":"user","content":prompt}]
        )

        def profile_dict(p, address, chain):
            return {
                "address": address,
                "archetype": p.archetype,
                "archetype_icon": p.archetype_icon,
                "score": p.score,
                "win_rate_pct": p.win_rate_pct,
                "risk_level": p.risk_level,
                "chain": chain,
            }

        return {
            "success": True,
            "wallet1": profile_dict(p1, req.address1, c1),
            "wallet2": profile_dict(p2, req.address2, c2),
            "winner": profile_dict(winner, req.address1 if winner == p1 else req.address2, c1 if winner == p1 else c2),
            "verdict": message.content[0].text,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}</p>
