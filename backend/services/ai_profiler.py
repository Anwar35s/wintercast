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
    if f.avg_trade_size_usd > 500_000:
        return "whale"
    if f.trade_frequency_per_week > 100:
        return "bot"
    if f.win_rate > 0.68 and f.narrative_timing_score > 0.75:
        return "smart"
    if f.avg_hold_days > 90 and f.portfolio_risk_score < 0.4:
        return "diamond"
    if f.portfolio_risk_score > 0.75 and f.win_rate < 0.45:
        return "degen"
    if f.narrative_timing_score > 0.8 and f.avg_hold_days < 7:
        return "sniper"
    if f.trade_frequency_per_week > 10 and f.avg_hold_days < 14:
        return "flipper"
    return "retail"

def calculate_score(f: WalletFeatures) -> int:
    score = (
        f.win_rate * 40 +
        min(f.defi_activity_score * 20, 20) +
        min(f.narrative_timing_score * 20, 20) +
        (1 - f.portfolio_risk_score) * 10 +
        min(f.wallet_age_days / 365 * 10, 10)
    )
    return max(1, min(int(score), 100))

async def generate_profile(features: WalletFeatures) -> WalletProfile:
    archetype_key = classify_archetype(features)
    archetype = ARCHETYPES[archetype_key]
    score = calculate_score(features)
    risk_level = "HIGH" if features.portfolio_risk_score > 0.65 else "MEDIUM" if features.portfolio_risk_score > 0.35 else "LOW"

    prompt = f"""You are Wintercast, an AI that generates behavioural profiles for crypto wallets.
The cold truth about every wallet — revealed.

Wallet data:
- Address: {features.address}
- Chain: {features.chain}
- Archetype: {archetype['name']}
- Wallet age: {features.wallet_age_days} days
- Total transactions: {features.total_transactions}
- Win rate: {round(features.win_rate * 100)}%
- Average hold time: {features.avg_hold_days} days
- Trade frequency: {features.trade_frequency_per_week}/week
- Risk score: {round(features.portfolio_risk_score * 100)}%
- DeFi activity: {round(features.defi_activity_score * 100)}%
- Rug pull count: {features.rug_pull_count}
- Largest trade: ${features.largest_trade_usd:,.0f}
- Average trade size: ${features.avg_trade_size_usd:,.0f}

Return ONLY valid JSON, no markdown:
{{
  "narrative": "2-3 paragraph cold precise personality profile. Reference actual numbers. Use **bold** for key phrases.",
  "predictions": [
    {{"probability": 78, "text": "Specific prediction about likely next action"}},
    {{"probability": 55, "text": "Second prediction"}},
    {{"probability": 38, "text": "Third prediction"}}
  ]
}}"""

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text
    raw = raw.replace("```json", "").replace("```", "").strip()
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
            "rug_count":  {"you": features.rug_pull_count,          "avg": 3.2},
        }
    )
