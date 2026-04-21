"""
Historical wallet scores — stores scores with timestamps
So we can show a chart of how a wallet's score changes over time
"""
import time
from collections import defaultdict

# In-memory store: {address: [{score, archetype, timestamp}]}
SCORE_HISTORY: dict = defaultdict(list)
MAX_HISTORY = 30  # Keep last 30 data points per wallet

def record_score(address: str, score: int, archetype: str, win_rate: float, risk_level: str):
    addr = address.lower().strip()
    entry = {
        "score": score,
        "archetype": archetype,
        "win_rate": win_rate,
        "risk_level": risk_level,
        "timestamp": int(time.time()),
        "date": time.strftime("%Y-%m-%d"),
    }
    SCORE_HISTORY[addr].append(entry)
    # Keep only last MAX_HISTORY entries
    if len(SCORE_HISTORY[addr]) > MAX_HISTORY:
        SCORE_HISTORY[addr] = SCORE_HISTORY[addr][-MAX_HISTORY:]

def get_history(address: str) -> list:
    addr = address.lower().strip()
    return SCORE_HISTORY.get(addr, [])

def get_score_change(address: str) -> dict:
    history = get_history(address)
    if len(history) < 2:
        return {"change": 0, "direction": "stable", "data_points": len(history)}
    latest = history[-1]["score"]
    previous = history[-2]["score"]
    change = latest - previous
    return {
        "change": change,
        "direction": "up" if change > 0 else "down" if change < 0 else "stable",
        "latest": latest,
        "previous": previous,
        "data_points": len(history),
        "history": history,
    }
