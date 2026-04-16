from datetime import datetime, timezone
from models.wallet import WalletFeatures


def extract_evm_features(raw_data: dict) -> WalletFeatures:
    txs = raw_data.get("transactions", [])
    transfers = raw_data.get("token_transfers", [])
    address = raw_data["address"]
    total_txs = len(txs)

    if not txs:
        return _empty_features(address, "evm")

    # Wallet age
    dates = [_parse_date(t.get("block_timestamp", "")) for t in txs]
    dates = [d for d in dates if d]
    age_days = 0
    if dates:
        age_days = (datetime.now(timezone.utc) - min(dates)).days

    # Trade frequency
    weeks = max(age_days / 7, 1)
    freq_per_week = round(total_txs / weeks, 2)

    # Hold time — average days between consecutive transfers
    avg_hold = _estimate_hold_time(transfers, dates)

    # Win rate
    buys = [t for t in transfers if t.get("to_address", "").lower() == address.lower()]
    sells = [t for t in transfers if t.get("from_address", "").lower() == address.lower()]
    win_rate = _estimate_win_rate(buys, sells)

    # Risk score — diversity of tokens
    risk_score = _estimate_risk(transfers)

    # DeFi activity
    defi_score = _estimate_defi(txs)

    # Trade sizes
    values = []
    for t in txs:
        try:
            val = float(t.get("value", 0)) / 1e18
            if val > 0:
                values.append(val)
        except (ValueError, TypeError):
            pass

    eth_price = 2500
    largest = max(values) if values else 0
    avg_trade = sum(values) / len(values) if values else 0

    # Narrative timing — how early wallet enters new tokens
    unique_tokens = len(set(t.get("token_symbol", "") for t in transfers))
    narrative_timing = min(unique_tokens / 20, 1.0)

    return WalletFeatures(
        address=address,
        chain="evm",
        wallet_age_days=age_days,
        total_transactions=total_txs,
        win_rate=win_rate,
        avg_hold_days=avg_hold,
        trade_frequency_per_week=freq_per_week,
        portfolio_risk_score=risk_score,
        defi_activity_score=defi_score,
        rug_pull_count=0,
        largest_trade_usd=round(largest * eth_price, 2),
        avg_trade_size_usd=round(avg_trade * eth_price, 2),
        narrative_timing_score=narrative_timing
    )


def extract_solana_features(raw_data: dict) -> WalletFeatures:
    txs = raw_data.get("transactions", [])
    address = raw_data["address"]
    total_txs = len(txs)

    if not txs:
        return _empty_features(address, "solana")

    age_days = 365
    freq_per_week = round(total_txs / max(age_days / 7, 1), 2)

    return WalletFeatures(
        address=address,
        chain="solana",
        wallet_age_days=age_days,
        total_transactions=total_txs,
        win_rate=0.5,
        avg_hold_days=7.0,
        trade_frequency_per_week=freq_per_week,
        portfolio_risk_score=0.5,
        defi_activity_score=0.4,
        rug_pull_count=0,
        largest_trade_usd=0,
        avg_trade_size_usd=0,
        narrative_timing_score=0.5
    )


# ── helpers ───────────────────────────────────────────────────────────────────

def _empty_features(address, chain):
    return WalletFeatures(
        address=address, chain=chain, wallet_age_days=0,
        total_transactions=0, win_rate=0.5, avg_hold_days=0,
        trade_frequency_per_week=0, portfolio_risk_score=0.5,
        defi_activity_score=0, rug_pull_count=0,
        largest_trade_usd=0, avg_trade_size_usd=0,
        narrative_timing_score=0.5
    )

def _parse_date(ts: str):
    if not ts:
        return None
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except Exception:
        return None

def _estimate_hold_time(transfers, tx_dates) -> float:
    """Estimate average hold time in days."""
    transfer_dates = [_parse_date(t.get("block_timestamp", "")) for t in transfers]
    transfer_dates = [d for d in transfer_dates if d]
    all_dates = sorted(tx_dates + transfer_dates)
    if len(all_dates) < 2:
        return 0.0
    # Average gap between consecutive transactions in days
    gaps = [(all_dates[i+1] - all_dates[i]).total_seconds() / 86400
            for i in range(len(all_dates)-1)]
    avg = sum(gaps) / len(gaps) if gaps else 0.0
    return round(avg, 1)

def _estimate_win_rate(buys, sells) -> float:
    total = len(buys) + len(sells)
    if total == 0:
        return 0.5
    # Rough estimate: more sells than buys = taking profits = higher win rate
    sell_ratio = len(sells) / max(total, 1)
    return round(min(0.3 + sell_ratio * 0.7, 0.95), 2)

def _estimate_risk(transfers) -> float:
    if not transfers:
        return 0.5
    unique_tokens = len(set(t.get("token_symbol", "") for t in transfers))
    # More unique tokens = higher risk appetite
    return round(min(unique_tokens / 25, 1.0), 2)

def _estimate_defi(txs) -> float:
    defi_contracts = {
        "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",  # Uniswap v2
        "0xe592427a0aece92de3edee1f18e0157c05861564",  # Uniswap v3
        "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2",  # Aave v3
        "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",  # Uniswap Universal
        "0x1111111254eeb25477b68fb85ed929f73a960582",  # 1inch
        "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f",  # Sushiswap
        "0xdef1c0ded9bec7f1a1670819833240f027b25eff",  # 0x
    }
    if not txs:
        return 0.0
    defi_count = sum(
        1 for t in txs
        if t.get("to_address", "").lower() in defi_contracts
    )
    return round(min(defi_count / max(len(txs), 1) * 5, 1.0), 2)
