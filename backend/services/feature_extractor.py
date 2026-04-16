from datetime import datetime, timezone
from models.wallet import WalletFeatures

RUG_TOKENS = {"SQUID","LUNA","UST","TITAN","IRON","SAFEMOON","BITCONNECT","ONECOIN","PLUSTOKEN"}
DEFI_CONTRACTS = {
    "0x7a250d5630b4cf539739df2c5dacb4c659f2488d","0xe592427a0aece92de3edee1f18e0157c05861564",
    "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45","0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2",
    "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9","0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f",
    "0x1111111254eeb25477b68fb85ed929f73a960582","0xdef1c0ded9bec7f1a1670819833240f027b25eff",
    "0x881d40237659c251811cec9c364ef91dc08d300c","0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
}
SOL_PRICE_USD = 150
ETH_PRICE_USD = 2500


def extract_evm_features(raw_data: dict) -> WalletFeatures:
    txs = raw_data.get("transactions", [])
    transfers = raw_data.get("token_transfers", [])
    pnl = raw_data.get("pnl", {})
    defi = raw_data.get("defi", {})
    nft_transfers = raw_data.get("nft_transfers", [])
    balances = raw_data.get("token_balances", [])
    address = raw_data["address"]
    total_txs = len(txs)

    if not txs:
        return _empty_features(address, "evm")

    dates = [_parse_date(t.get("block_timestamp","")) for t in txs]
    dates = [d for d in dates if d]
    age_days = (datetime.now(timezone.utc) - min(dates)).days if dates else 0
    weeks = max(age_days / 7, 1)
    freq_per_week = round(total_txs / weeks, 2)
    avg_hold = _estimate_hold_time(transfers, dates)

    win_rate = 0.5
    if pnl and pnl.get("total_count_of_trades", 0) > 0:
        profitable = pnl.get("total_count_of_profitable_trades", 0)
        total_trades = pnl.get("total_count_of_trades", 1)
        win_rate = round(profitable / max(total_trades, 1), 2)
    else:
        buys = [t for t in transfers if t.get("to_address","").lower() == address.lower()]
        sells = [t for t in transfers if t.get("from_address","").lower() == address.lower()]
        total = len(buys) + len(sells)
        if total > 0:
            win_rate = round(min(0.3 + (len(sells)/max(total,1)) * 0.65, 0.92), 2)

    risk_score = 0.5
    if balances:
        total_usd = sum(float(b.get("usd_value",0) or 0) for b in balances)
        if total_usd > 0:
            top = max(balances, key=lambda b: float(b.get("usd_value",0) or 0))
            concentration = float(top.get("usd_value",0) or 0) / total_usd
            risk_score = round(min(1 - concentration*0.5 + len(balances)/100, 1.0), 2)
    else:
        unique_tokens = len(set(t.get("token_symbol","") for t in transfers))
        risk_score = round(min(unique_tokens / 25, 1.0), 2)

    defi_score = 0.0
    if defi and defi.get("active_protocols", 0) > 0:
        defi_score = round(min(defi.get("active_protocols",0) / 10, 1.0), 2)
    else:
        defi_count = sum(1 for t in txs if t.get("to_address","").lower() in DEFI_CONTRACTS)
        defi_score = round(min(defi_count / max(len(txs),1) * 5, 1.0), 2)

    rug_count = sum(1 for t in transfers if t.get("token_symbol","").upper() in RUG_TOKENS)

    largest_usd, avg_trade_usd = 0.0, 0.0
    if pnl and pnl.get("total_trade_volume_usd"):
        vol = float(pnl.get("total_trade_volume_usd",0) or 0)
        cnt = pnl.get("total_count_of_trades",1) or 1
        avg_trade_usd = round(vol/cnt, 2)
        largest_usd = float(pnl.get("max_trade_size_usd",0) or 0)
    else:
        values = []
        for t in txs:
            try:
                val = float(t.get("value",0)) / 1e18 * ETH_PRICE_USD
                if val > 0: values.append(val)
            except Exception: pass
        largest_usd = max(values) if values else 0
        avg_trade_usd = sum(values)/len(values) if values else 0

    unique_tokens = len(set(t.get("token_symbol","") for t in transfers))
    narrative_timing = round(min((unique_tokens + len(nft_transfers)*2) / 30, 1.0), 2)

    return WalletFeatures(
        address=address, chain="evm",
        wallet_age_days=age_days, total_transactions=total_txs,
        win_rate=win_rate, avg_hold_days=avg_hold,
        trade_frequency_per_week=freq_per_week,
        portfolio_risk_score=min(risk_score, 1.0),
        defi_activity_score=min(defi_score, 1.0),
        rug_pull_count=rug_count,
        largest_trade_usd=round(largest_usd, 2),
        avg_trade_size_usd=round(avg_trade_usd, 2),
        narrative_timing_score=narrative_timing
    )


def extract_solana_features(raw_data: dict) -> WalletFeatures:
    txs = raw_data.get("transactions", [])
    swaps = raw_data.get("swaps", [])
    nft_sales = raw_data.get("nft_sales", [])
    balances = raw_data.get("token_balances", [])
    sol_balance = raw_data.get("sol_balance", 0.0)
    address = raw_data["address"]
    total_txs = len(txs)

    if not txs:
        return _empty_features(address, "solana")

    # Real wallet age from timestamps
    timestamps = [t.get("timestamp", 0) for t in txs if t.get("timestamp")]
    age_days = 1
    if timestamps:
        age_days = max(int((datetime.now(timezone.utc).timestamp() - min(timestamps)) / 86400), 1)

    weeks = max(age_days / 7, 1)
    freq_per_week = round(total_txs / weeks, 2)

    # Extract SOL amounts from all transaction types
    sol_amounts = []
    incoming = 0
    outgoing = 0

    for tx in txs:
        desc = tx.get("description", "")
        tx_type = tx.get("type", "")

        # Parse SOL amounts from description
        # Format: "address transferred X.XX SOL to address"
        if "transferred" in desc and "SOL" in desc:
            try:
                parts = desc.split("transferred")[1].split("SOL")[0].strip()
                amount = float(parts.split()[0])
                sol_amounts.append(amount * SOL_PRICE_USD)
                # Determine direction
                if desc.startswith(address[:10]):
                    outgoing += 1
                else:
                    incoming += 1
            except Exception:
                pass

        # Parse native transfers
        native_transfers = tx.get("nativeTransfers", [])
        for nt in native_transfers:
            amount_sol = nt.get("amount", 0) / 1e9
            if amount_sol > 0.001:
                sol_amounts.append(amount_sol * SOL_PRICE_USD)
                if nt.get("fromUserAccount", "") == address:
                    outgoing += 1
                else:
                    incoming += 1

        # Parse token transfers
        token_transfers = tx.get("tokenTransfers", [])
        for tt in token_transfers:
            token_amount = tt.get("tokenAmount", 0)
            if token_amount > 0:
                sol_amounts.append(token_amount * 0.001)  # rough estimate

    # Win rate from in/out ratio
    win_rate = 0.5
    total_directional = incoming + outgoing
    if total_directional > 10:
        # More incoming than outgoing = net positive = higher win rate
        win_rate = round(min(0.3 + (incoming / max(total_directional, 1)) * 0.6, 0.92), 2)

    # Average hold time from timestamps
    avg_hold = 0.0
    if len(timestamps) >= 2:
        sorted_ts = sorted(timestamps)
        gaps = [(sorted_ts[i+1] - sorted_ts[i]) / 86400 for i in range(len(sorted_ts)-1)]
        gaps = [g for g in gaps if 0 < g < 365]
        avg_hold = round(sum(gaps) / len(gaps), 1) if gaps else 0.0

    # Trade sizes
    largest_usd = max(sol_amounts) if sol_amounts else 0
    avg_trade_usd = sum(sol_amounts) / len(sol_amounts) if sol_amounts else 0

    # DeFi: check for swap/defi types
    defi_types = {"SWAP", "ADD_LIQUIDITY", "REMOVE_LIQUIDITY", "STAKE", "UNSTAKE", "BORROW", "LEND"}
    defi_count = sum(1 for t in txs if t.get("type", "") in defi_types)
    defi_score = round(min(defi_count / max(total_txs, 1) * 3, 1.0), 2)

    # Risk score from token diversity
    unique_programs = len(set(t.get("source", "") for t in txs if t.get("source")))
    risk_score = round(min(unique_programs / 15, 1.0), 2)

    # Narrative timing
    narrative_timing = round(min(freq_per_week / 30, 1.0), 2)

    # NFT activity
    nft_count = sum(1 for t in txs if t.get("type", "") in {"NFT_SALE", "NFT_MINT", "NFT_LISTING"})

    return WalletFeatures(
        address=address, chain="solana",
        wallet_age_days=age_days, total_transactions=total_txs,
        win_rate=win_rate, avg_hold_days=avg_hold,
        trade_frequency_per_week=freq_per_week,
        portfolio_risk_score=risk_score,
        defi_activity_score=defi_score,
        rug_pull_count=0,
        largest_trade_usd=round(largest_usd, 2),
        avg_trade_size_usd=round(avg_trade_usd, 2),
        narrative_timing_score=narrative_timing
    )


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
    if not ts: return None
    try: return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except Exception: return None

def _estimate_hold_time(transfers, tx_dates) -> float:
    transfer_dates = [_parse_date(t.get("block_timestamp","")) for t in transfers]
    all_dates = sorted([d for d in tx_dates + transfer_dates if d])
    if len(all_dates) < 2: return 0.0
    gaps = [(all_dates[i+1]-all_dates[i]).total_seconds()/86400 for i in range(len(all_dates)-1)]
    gaps = [g for g in gaps if g < 365]
    return round(sum(gaps)/len(gaps), 1) if gaps else 0.0
