from pydantic import BaseModel
from typing import Optional, Dict

class WalletFeatures(BaseModel):
    address: str
    chain: str
    wallet_age_days: int
    total_transactions: int
    win_rate: float
    avg_hold_days: float
    trade_frequency_per_week: float
    portfolio_risk_score: float
    defi_activity_score: float
    rug_pull_count: int
    largest_trade_usd: float
    avg_trade_size_usd: float
    narrative_timing_score: float
    chain_activity: Dict[str, int] = {}
    primary_chain: str = "eth"

class WalletProfile(BaseModel):
    address: str
    chain: str
    archetype: str
    archetype_icon: str
    score: int
    win_rate_pct: int
    avg_hold_days: float
    total_trades: int
    risk_level: str
    traits: dict
    narrative: str
    predictions: list
    recent_activity: list
    vs_average: dict
    chain_activity: Dict[str, int] = {}
    primary_chain: str = "eth"

class AnalyseRequest(BaseModel):
    address: str

class AnalyseResponse(BaseModel):
    success: bool
    profile: Optional[WalletProfile] = None
    error: Optional[str] = None
