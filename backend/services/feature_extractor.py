from datetime import datetime, timezone
from models.wallet import WalletFeatures


def extract_evm_features(raw_data: dict) -> WalletFeatures:
    txs = raw_data.get("transactions", [])
    transfers = raw_data.get("token_transfers", [])
    address = raw_data["address"]

    if not txs:
        return _empty_features(address, "evm")

    # Wallet age
    oldest = min(txs, key=lambda t: t.get("block_timestamp", "9999"))
    oldest_date = _parse_date(oldest.get("block_timestamp", ""))
    age_days = (datetime.now(timezone.utc) - oldest_date).days if oldest_date else 0

    # Trade frequency
    weeks = max(age_days / 7, 1)
    freq_per_week = len(txs) / weeks

    # Win rate: estimate based on value in vs value out for token transfers
    buys = [t for t in transfers if _is_buy(t)]
    sells = [t for t in transfers if not _is_buy(t)]
    win_rate = _estimate_win_rate(buys, sells)

    # Average hold time (rough estimate from transfer timing)
    avg_hold = _estimate_hold_time(transfers)

    # Risk score: ratio of unknown/small tokens vs ETH/stablecoins
    risk_score = _estimate_risk(transfers)

    # DeFi activity: % of txs interacting with known DeFi contracts
    defi_score = _estimate_defi(txs)

    # Largest trade
    values = [float(t.get("value", 0)) / 1e18 for t in txs if t.get("value")]
    largest = max(values) if values else 0
    avg_trade = sum(values) / len(values) if values else 0

    return WalletFeatures(
        address=address,
        chain="evm",
        wallet_age_days=age_days,
        total_transactions=len(txs),
        win_rate=win_rate,
        avg_hold_days=avg_hold,
        trade_frequency_per_week=round(freq_per_week, 2),
        portfolio_risk_score=risk_score,
        defi_activity_score=defi_score,
        rug_pull_count=0,  # TODO: cross-ref known rug tokens
        largest_trade_usd=largest * 2500,  # rough ETH price
        avg_trade_size_usd=avg_trade * 2500,
        narrative_timing_score=0.5  # TODO: compare with narrative timelines
    )


def extract_solana_features(raw_data: dict) -> WalletFeatures:
    txs = raw_data.get("transactions", [])
    address = raw_data["address"]

    if not txs:
        return _empty_features(address, "solana")

    age_days = 365  # default until we parse timestamps
    freq_per_week = len(txs) / max(age_days / 7, 1)

    return WalletFeatures(
        address=address,
        chain="solana",
        wallet_age_days=age_days,
        total_transactions=len(txs),
        win_rate=0.5,
        avg_hold_days=7.0,
        trade_frequency_per_week=round(freq_per_week, 2),
        portfolio_risk_score=0.5,
        defi_activity_score=0.4,
        rug_pull_count=0,
        largest_trade_usd=0,
        avg_trade_size_usd=0,
        narrative_timing_score=0.5
    )


# ── helpers ──────────────────────────────────────────────────────────────────

def _empty_features(address, chain):
    return WalletFeatures(
        address=address, chain=chain, wallet_age_days=0,
        total_transactions=0, win_rate=0.5, avg_hold_days=0,
        trade_frequency_per_week=0, portfolio_risk_score=0.5,
        defi_activity_score=0, rug_pull_count=0,
        largest_trade_usd=0, avg_trade_size_usd=0, narrative_timing_score=0.5
    )

def _parse_date(ts: str):
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except Exception:
        return None

def _is_buy(transfer: dict) -> bool:
    return transfer.get("to_address", "").lower() == transfer.get("address", "").lower()

def _estimate_win_rate(buys, sells) -> float:
    if not buys:
        return 0.4
    profitable = min(len(sells), len(buys))
    return round(min(profitable / max(len(buys), 1) * 1.1, 0.95), 2)

def _estimate_hold_time(transfers) -> float:
    if len(transfers) < 2:
        return 30.0
    dates = [_parse_date(t.get("block_timestamp", "")) for t in transfers]
    dates = [d for d in dates if d]
    if len(dates) < 2:
        return 30.0
    span = (max(dates) - min(dates)).days
    return round(span / max(len(dates) - 1, 1), 1)

def _estimate_risk(transfers) -> float:
    if not transfers:
        return 0.5
    # More unique tokens = higher risk
    unique_tokens = len(set(t.get("token_symbol", "") for t in transfers))
    return round(min(unique_tokens / 50, 1.0), 2)

def _estimate_defi(txs) -> float:
    # Known DeFi contract prefixes (Uniswap, Aave, Compound, etc.)
    defi_contracts = {
        "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",  # Uniswap v2
        "0xe592427a0aece92de3edee1f18e0157c05861564",  # Uniswap v3
        "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2",  # Aave v3
    }
    defi_count = sum(
        1 for t in txs
        if t.get("to_address", "").lower() in defi_contracts
    )
    return round(min(defi_count / max(len(txs), 1) * 3, 1.0), 2)
