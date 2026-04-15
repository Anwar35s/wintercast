import anthropic
import os
import json
from models.wallet import WalletFeatures, WalletProfile

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

ARCHETYPES = {
    "whale":   {"name": "The Whale",       "icon": "🐋"},
    "bot":     {"name": "The Bot",         "icon": "🤖"},
    "degen":   {"name": "The Degen",       "icon": "🎰"},
    "smart":   {"name": "Smart Money",     "icon": "🧠"},
    "diamond": {"name": "Diamond Hands",   "icon": "💎"},
    "sniper":  {"name": "The Sniper",      "icon": "🎯"},
    "flipper": {"name": "The Flipper",     "icon": "🔄"},
    "retail":  {"name": "Retail Follower", "icon": "🐟"},
}


def classify_archetype(f: WalletFeatures) -> str:
    # Bot: very high frequency or MEV patterns
    if f.trade_frequency_per_week > 100 or (f.trade_frequency_per_week > 50 and f.avg_hold_days < 0.1):
        return "bot"
    # Whale: massive trade sizes
    if f.avg_trade_size_usd > 100_000 or f.largest_trade_usd > 1_000_000:
        return "whale"
    # Smart money: high win rate + early timing
    if f.win_rate > 0.65 and f.narrative_timing_score > 0.6 and f.total_transactions > 50:
        return "smart"
    # Diamond hands: long hold time + low risk
    if f.avg_hold_days > 60 and f.portfolio_risk_score < 0.4:
        return "diamond"
    # Degen: high risk + low win rate
    if f.portfolio_risk_score > 0.7 and f.win_rate < 0.45:
        return "degen"
    # Sniper: early timing + very short holds
    if f.narrative_timing_score > 0.7 and f.avg_hold_days < 3:
        return "sniper"
    # Flipper: frequent trading + short holds
    if f.trade_frequency_per_week > 5 and f.avg_hold_days < 10:
        return "flipper"
    return "retail"


def calculate_score(f: WalletFeatures) -> int:
    score = 0
    # Win rate (40 points max)
    score += f.win_rate * 40
    # DeFi sophistication (15 points)
    score += min(f.defi_activity_score * 15, 15)
    # Narrative timing - entering early (15 points)
    score += min(f.narrative_timing_score * 15, 15)
    # Safety - avoiding rugs (10 points)
    rug_penalty = min(f.rug_pull_count * 2, 10)
    score += max(10 - rug_penalty, 0)
    # Experience - wallet age (10 points)
    score += min(f.wallet_age_days / 365 * 10, 10)
    # Consistency - not too wild (10 points)
    risk_balance = abs(f.portfolio_risk_score - 0.5) * 2
    score += max(10 - risk_balance * 10, 0)
    return max(1, min(int(score), 100))


async def generate_profile(features: WalletFeatures) -> WalletProfile:
    archetype_key = classify_archetype(features)
    archetype = ARCHETYPES[archetype_key]
    score = calculate_score(features)
    risk_level = (
        "HIGH" if features.portfolio_risk_score > 0.65
        else "MEDIUM" if features.portfolio_risk_score > 0.35
        else "LOW"
    )

    prompt = f"""You are Wintercast, an AI that generates cold, precise behavioural profiles for crypto wallets.

Wallet analysis data:
- Address: {features.address}
- Chain: {features.chain.upper()}
- Archetype: {archetype['name']}
- Wallet age: {features.wallet_age_days} days
- Total transactions: {features.total_transactions:,}
- Win rate: {round(features.win_rate * 100)}% (% of profitable trades)
- Average hold time: {features.avg_hold_days} days
- Trade frequency: {features.trade_frequency_per_week} trades/week
- Risk score: {round(features.portfolio_risk_score * 100)}%
- DeFi activity: {round(features.defi_activity_score * 100)}%
- Rug pull count: {features.rug_pull_count}
- Largest single trade: ${features.largest_trade_usd:,.0f}
- Average trade size: ${features.avg_trade_size_usd:,.0f}
- Narrative timing score: {round(features.narrative_timing_score * 100)}%

Instructions:
- Be precise and reference the actual numbers
- Use **bold** for key insights
- Be cold, analytical, and direct — like a forensic analyst
- Don't be generic — make observations specific to THIS wallet's data
- If data is sparse, acknowledge it honestly
- The narrative should feel like reading a dossier, not a compliment

Return ONLY valid JSON, no markdown fences:
{{
  "narrative": "2-3 paragraph forensic profile. Cold, precise, referencing actual numbers.",
  "predictions": [
    {{"probability": 75, "text": "Specific, data-driven prediction based on observed patterns"}},
    {{"probability": 55, "text": "Second prediction"}},
    {{"probability": 35, "text": "Third prediction"}}
  ]
}}"""

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1200,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text.replace("```json", "").replace("```", "").strip()
    ai_data = json.loads(raw)

    traits = {
        "PROFITABILITY":    round(features.win_rate * 100),
        "PATIENCE":         min(round(features.avg_hold_days / 180 * 100), 100),
        "RISK APPETITE":    round(features.portfolio_risk_score * 100),
        "DeFi ACTIVITY":    round(features.defi_activity_score * 100),
        "TRADE FREQUENCY":  min(round(features.trade_frequency_per_week / 20 * 100), 100),
        "NARRATIVE TIMING": round(features.narrative_timing_score * 100),
    }

    return WalletProfile(
        address=features.address,
        chain=features.chain,
        archetype=archetype["name"],
        archetype_icon=archetype["icon"],
        score=score,
        win_rate_pct=round(features.win_rate * 100),
        avg_hold_days=features.avg_hold_days,
        total_trades=features.total_transactions,
        risk_level=risk_level,
        traits=traits,
        narrative=ai_data.get("narrative", ""),
        predictions=ai_data.get("predictions", []),
        recent_activity=[],
        vs_average={
            "win_rate":   {"you": round(features.win_rate * 100), "avg": 38},
            "hold_days":  {"you": features.avg_hold_days,          "avg": 4},
            "defi_usage": {"you": round(features.defi_activity_score * 100), "avg": 22},
            "rug_count":  {"you": features.rug_pull_count,          "avg": 3},
        }
    )
