from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from services.ai_profiler import generate_profile
from services.evm_fetcher import fetch_evm_wallet
from services.solana_fetcher import fetch_solana_wallet
from services.feature_extractor import extract_features
from services.chain_detector import detect_chain
import anthropic, os

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

@router.get("/roast/{address}")
@limiter.limit("5/minute")
async def roast_wallet(address: str, request: Request):
    try:
        chain = detect_chain(address)
        if chain == "solana":
            raw = await fetch_solana_wallet(address)
        else:
            raw = await fetch_evm_wallet(address)
        features = extract_features(raw, chain)
        profile = await generate_profile(features, address, chain)

        prompt = f"""You are a brutally honest, savage crypto trading analyst. Roast this wallet in 3-4 sentences. Be funny, harsh, and specific about their bad trading decisions. Don't hold back.

Wallet stats:
- Archetype: {profile.archetype} {profile.archetype_icon}
- Score: {profile.score}/100
- Win rate: {profile.win_rate_pct}%
- Risk level: {profile.risk_level}
- Total transactions: {features.total_transactions}
- Hold time: {features.avg_hold_time_days} days average
- Chain: {chain}

Write a savage roast. Be specific, funny and brutal. No emojis. Pure text."""

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            messages=[{"role":"user","content":prompt}]
        )
        roast_text = message.content[0].text

        return {
            "success": True,
            "roast": roast_text,
            "profile": {
                "archetype": profile.archetype,
                "archetype_icon": profile.archetype_icon,
                "score": profile.score,
                "win_rate_pct": profile.win_rate_pct,
                "risk_level": profile.risk_level,
                "chain": chain,
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
