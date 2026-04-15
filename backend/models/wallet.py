from pydantic import BaseModel
from typing import Optional

class WalletFeatures(BaseModel):
    address: str
    chain: str                    # "evm" or "solana"
    wallet_age_days: int
    total_transactions: int
    win_rate: float               # 0.0 - 1.0
    avg_hold_days: float
    trade_frequency_per_week: float
    portfolio_risk_score: float   # 0.0 - 1.0
    defi_activity_score: float    # 0.0 - 1.0
    rug_pull_count: int
    largest_trade_usd: float
    avg_trade_size_usd: float
    narrative_timing_score: float # how early they enter narratives

class WalletProfile(BaseModel):
    address: str
    chain: str
    archetype: str
    archetype_icon: str
    score: int                    # 0 - 100
    win_rate_pct: int
    avg_hold_days: float
    total_trades: int
    risk_level: str               # LOW / MEDIUM / HIGH
    traits: dict
    narrative: str
    predictions: list
    recent_activity: list
    vs_average: dict

class AnalyseRequest(BaseModel):
    address: str

class AnalyseResponse(BaseModel):
    success: bool
    profile: Optional[WalletProfile] = None
    error: Optional[str] = None
