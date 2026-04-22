import time, json, os

HISTORY_FILE = "/tmp/score_history.json"

def _load():
    try:
        if os.path.exists(HISTORY_FILE):
            return json.load(open(HISTORY_FILE))
    except:
        pass
    return {}

def _save(data):
    try:
        json.dump(data, open(HISTORY_FILE, "w"))
    except:
        pass

def record_score(address: str, score: int, archetype: str, win_rate: float, risk_level: str):
    data = _load()
    addr = address.lower().strip()
    if addr not in data:
        data[addr] = []
    data[addr].append({
        "score": score,
        "archetype": archetype,
        "win_rate": float(win_rate),
        "risk_level": risk_level,
        "timestamp": int(time.time()),
        "date": time.strftime("%Y-%m-%d"),
    })
    data[addr] = data[addr][-30:]
    _save(data)

def get_history(address: str) -> list:
    data = _load()
    return data.get(address.lower().strip(), [])

def get_score_change(address: str) -> dict:
    history = get_history(address)
    if len(history) < 2:
        return {"change": 0, "direction": "stable", "data_points": len(history), "history": history}
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
