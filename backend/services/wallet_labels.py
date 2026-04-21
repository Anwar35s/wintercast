"""
Wintercast Wallet Label Database
Known wallets labelled by category
This is our core moat — grows over time
"""

# ─── KNOWN WALLET LABELS ──────────────────────────────────────────────────────
KNOWN_LABELS: dict = {
    # ── EXCHANGES ──
    "0x28c6c06298d514db089934071355e5743bf21d60": {"label": "Binance Hot Wallet", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8": {"label": "Binance Cold Wallet", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0xf977814e90da44bfa03b6295a0616a897441acec": {"label": "Binance Hot Wallet 2", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be": {"label": "Binance", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0xd551234ae421e3bcba99a0da6d736074f22192ff": {"label": "Binance", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x564286362092d8e7936f0549571a803b203aaced": {"label": "Binance", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x0681d8db095565fe8a346fa0277bffde9c0edbbf": {"label": "Binance", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0xfe9e8709d3215310075d67e3ed32a380ccf451c8": {"label": "Binance", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67": {"label": "Binance", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0xda9dfa130df4de4673b89022ee50ff26f6ea73cf": {"label": "Kraken", "category": "exchange", "icon": "🦑", "risk": "low"},
    "0x2910543af39aba0cd09dbb2d50200b3e800a63d2": {"label": "Kraken", "category": "exchange", "icon": "🦑", "risk": "low"},
    "0xae2d4617c862309a3d75a0ffb358c7a5009c673f": {"label": "Kraken", "category": "exchange", "icon": "🦑", "risk": "low"},
    "0x43984d578803891dfa9706bdeee6078d80cfc79e": {"label": "Kraken", "category": "exchange", "icon": "🦑", "risk": "low"},
    "0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43": {"label": "Coinbase", "category": "exchange", "icon": "🔵", "risk": "low"},
    "0x71660c4005ba85c37ccec55d0c4493e66fe775d3": {"label": "Coinbase", "category": "exchange", "icon": "🔵", "risk": "low"},
    "0x503828976d22510aad0201ac7ec88293211d23da": {"label": "Coinbase", "category": "exchange", "icon": "🔵", "risk": "low"},
    "0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740": {"label": "Coinbase", "category": "exchange", "icon": "🔵", "risk": "low"},
    "0x3cd751e6b0078be393132286c442345e5dc49699": {"label": "Coinbase", "category": "exchange", "icon": "🔵", "risk": "low"},
    "0xb5d85cbf7cb3ee0d56b3bb207d5fc4b82f43f511": {"label": "Coinbase", "category": "exchange", "icon": "🔵", "risk": "low"},
    "0xeb2629a2734e272bcc07bda959863f316f4bd4cf": {"label": "Coinbase", "category": "exchange", "icon": "🔵", "risk": "low"},
    "0x0d0707963952f2fba59dd06f2b425ace40b492fe": {"label": "Gate.io", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x7793cd85c11a924478d358d49b05b37e91b5810f": {"label": "Gate.io", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c": {"label": "Gate.io", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x0b10a082bfaa2a6d9a4a43ded549a57ef08ef1b0": {"label": "OKX", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x6cc5f688a315f3dc28a7781717a9a798a59fda7b": {"label": "OKX", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x236f9f97e0e62388479bf9e5ba4889e46b0273c3": {"label": "OKX", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0xa7efae728d2936e78bda97dc267687568dd593f3": {"label": "OKX", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x4976a4a02f38326660d17bf34b431dc6e2eb2327": {"label": "Bybit", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0xf89d7b9c864f589bbf53a82105107622b35eaa40": {"label": "Bybit", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x1db92e2eebc8e0c075a02bea49a2935bcd2dfcf4": {"label": "Huobi", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x6748f50f686bfbca6fe8ad62b22228b87f31ff2b": {"label": "Huobi", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0xadb2b42f6bd96f5c65920b9ac88619dce4166f94": {"label": "Huobi", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0xe93381fb4c4f14bda253907b18fad305d799241a": {"label": "Huobi", "category": "exchange", "icon": "🏦", "risk": "low"},

    # ── KNOWN PEOPLE ──
    "0xd8da6bf26964af9d7eed9e03e53415d37aa96045": {"label": "Vitalik Buterin", "category": "influencer", "icon": "🧠", "risk": "low"},
    "0xab5801a7d398351b8be11c439e05c5b3259aec9b": {"label": "Vitalik Buterin", "category": "influencer", "icon": "🧠", "risk": "low"},
    "0x220866b1a2219f40e72f5c628b65d54268ca3a9d": {"label": "Hayden Adams (Uniswap)", "category": "influencer", "icon": "🦄", "risk": "low"},

    # ── DEFI PROTOCOLS ──
    "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": {"label": "Uniswap V2 Router", "category": "protocol", "icon": "🦄", "risk": "low"},
    "0xe592427a0aece92de3edee1f18e0157c05861564": {"label": "Uniswap V3 Router", "category": "protocol", "icon": "🦄", "risk": "low"},
    "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": {"label": "Uniswap V3 Router 2", "category": "protocol", "icon": "🦄", "risk": "low"},
    "0xdef1c0ded9bec7f1a1670819833240f027b25eff": {"label": "0x Exchange", "category": "protocol", "icon": "⚡", "risk": "low"},
    "0x1111111254fb6c44bac0bed2854e76f90643097d": {"label": "1inch Router", "category": "protocol", "icon": "🔄", "risk": "low"},
    "0x1111111254eeb25477b68fb85ed929f73a960582": {"label": "1inch Router V5", "category": "protocol", "icon": "🔄", "risk": "low"},
    "0xba12222222228d8ba445958a75a0704d566bf2c8": {"label": "Balancer Vault", "category": "protocol", "icon": "⚖️", "risk": "low"},
    "0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b": {"label": "Compound Controller", "category": "protocol", "icon": "🏛️", "risk": "low"},
    "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9": {"label": "Aave V2", "category": "protocol", "icon": "👻", "risk": "low"},
    "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2": {"label": "Aave V3", "category": "protocol", "icon": "👻", "risk": "low"},
    "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419": {"label": "Chainlink ETH/USD", "category": "protocol", "icon": "🔗", "risk": "low"},
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": {"label": "WETH Contract", "category": "token", "icon": "💎", "risk": "low"},

    # ── BRIDGES ──
    "0x99c9fc46f92e8a1c0dec1b1747d010903e884be1": {"label": "Optimism Bridge", "category": "bridge", "icon": "🌉", "risk": "low"},
    "0x8eb8a3b98659cce290402893d0123abb75e3ab28": {"label": "Avalanche Bridge", "category": "bridge", "icon": "🌉", "risk": "low"},
    "0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf": {"label": "Polygon Bridge", "category": "bridge", "icon": "🌉", "risk": "low"},
    "0x4dbd4fc535ac27206064b68ffcf827b0a60bab3f": {"label": "Arbitrum Bridge", "category": "bridge", "icon": "🌉", "risk": "low"},

    # ── WHALES ──
    "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503": {"label": "Binance Whale", "category": "whale", "icon": "🐋", "risk": "medium"},
    "0xf646d9b7d20bfb3ad184ec78c5f4d6e36c8f8b5a": {"label": "Unknown Whale", "category": "whale", "icon": "🐋", "risk": "medium"},

    # ── MEV BOTS ──
    "0x98c3d3183c4b8a650614ad179a1a98be0a8d6b8e": {"label": "MEV Bot", "category": "mev", "icon": "🤖", "risk": "high"},
    "0x000000000035b5e5ad9019092c665357240f594e": {"label": "MEV Bot", "category": "mev", "icon": "🤖", "risk": "high"},
    "0x0000000000007f150bd6f54c40a34d7c3d5e9f56": {"label": "MEV Bot", "category": "mev", "icon": "🤖", "risk": "high"},
}

# Dynamic labels added at runtime from analysis
DYNAMIC_LABELS: dict = {}

def get_label(address: str) -> dict | None:
    addr = address.lower().strip()
    # Check known labels first
    if addr in KNOWN_LABELS:
        return KNOWN_LABELS[addr]
    # Check dynamic labels
    if addr in DYNAMIC_LABELS:
        return DYNAMIC_LABELS[addr]
    return None

def add_label(address: str, label: str, category: str, icon: str = "🏷️", risk: str = "unknown"):
    """Add a new label dynamically"""
    addr = address.lower().strip()
    DYNAMIC_LABELS[addr] = {
        "label": label,
        "category": category,
        "icon": icon,
        "risk": risk,
        "source": "auto"
    }

def auto_label_from_profile(address: str, profile: dict) -> dict | None:
    """Auto-generate a label from a wallet profile"""
    addr = address.lower().strip()
    
    # Already labelled
    if addr in KNOWN_LABELS or addr in DYNAMIC_LABELS:
        return get_label(address)
    
    archetype = profile.get("archetype", "")
    score = profile.get("score", 0)
    win_rate = profile.get("win_rate_pct", 0)
    
    # Auto-label based on archetype + score
    if archetype == "The Bot":
        label = {"label": "Trading Bot", "category": "mev", "icon": "🤖", "risk": "high", "source": "auto"}
    elif archetype == "The Whale" and score > 80:
        label = {"label": "Smart Whale", "category": "whale", "icon": "🐋", "risk": "low", "source": "auto"}
    elif archetype == "Smart Money" and win_rate > 70:
        label = {"label": "Smart Money", "category": "smart_money", "icon": "🧠", "risk": "low", "source": "auto"}
    elif archetype == "The Degen":
        label = {"label": "Degen Trader", "category": "degen", "icon": "🎰", "risk": "high", "source": "auto"}
    else:
        return None
    
    DYNAMIC_LABELS[addr] = label
    return label

def get_all_labels() -> dict:
    return {**KNOWN_LABELS, **DYNAMIC_LABELS}

def search_labels(query: str) -> list:
    query = query.lower()
    results = []
    for addr, info in {**KNOWN_LABELS, **DYNAMIC_LABELS}.items():
        if query in info["label"].lower() or query in info["category"].lower():
            results.append({"address": addr, **info})
    return results[:20]

# Import and merge extended labels
try:
    from services.wallet_labels_extended import EXTENDED_LABELS
    KNOWN_LABELS.update(EXTENDED_LABELS)
except:
    pass
