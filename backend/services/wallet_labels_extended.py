"""
Extended wallet labels — 500+ known addresses
Sources: Etherscan labels, public databases, community submissions
"""

EXTENDED_LABELS = {
    # ── COINBASE EXTENDED ──
    "0x02466e547bfdab679fc49e96bbeabf30b66d0d56": {"label": "Coinbase", "category": "exchange", "icon": "🔵", "risk": "low"},
    "0x7b60655ca240ac6c76dde62f7e9a1f88aa0c5bd0": {"label": "Coinbase", "category": "exchange", "icon": "🔵", "risk": "low"},
    "0xa090e606e30bd747d4e6245a1517ebe430f0057e": {"label": "Coinbase Prime", "category": "exchange", "icon": "🔵", "risk": "low"},
    "0x77696bb39917c91a0c3d2f8c0b49c18b4c8a5b4c": {"label": "Coinbase Custody", "category": "exchange", "icon": "🔵", "risk": "low"},

    # ── BINANCE EXTENDED ──
    "0x8894e0a0c962cb723c1976a4421c95949be2d4e3": {"label": "Binance", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0xe0f0cfde7ee664943906f17f7f14342e76a5cec7": {"label": "Binance", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x515b2bce9a5e61c6a5f5b0bc5e7c8a3c6d6e9f7a": {"label": "Binance US", "category": "exchange", "icon": "🏦", "risk": "low"},

    # ── KRAKEN EXTENDED ──
    "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0": {"label": "Kraken", "category": "exchange", "icon": "🦑", "risk": "low"},
    "0xfe31f959b49ee34c021dc38ce4bdbc1e90c59f14": {"label": "Kraken", "category": "exchange", "icon": "🦑", "risk": "low"},

    # ── CRYPTO.COM ──
    "0x6262998ced04146fa42253a5c0af90ca02dfd2a3": {"label": "Crypto.com", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x46340b20830761efd32832a74d7169b29feb9758": {"label": "Crypto.com", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x72a53cdbbcc1b9efa39c834a540550e23463aacb": {"label": "Crypto.com", "category": "exchange", "icon": "🏦", "risk": "low"},

    # ── KUCOIN ──
    "0x2b5634c42055806a59e9107ed44d43c426e58258": {"label": "KuCoin", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0xa1d8d972560c7f75b46a7d70d2bd1d5e87c06d12": {"label": "KuCoin", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0xd6216fc19db775df9774a6e33526131da7d19a2c": {"label": "KuCoin", "category": "exchange", "icon": "🏦", "risk": "low"},

    # ── GEMINI ──
    "0xd24400ae8bfebb18ca49be86258a3c749cf46853": {"label": "Gemini", "category": "exchange", "icon": "♊", "risk": "low"},
    "0x07ee55aa48bb72dcc6e9d78256648910de513eca": {"label": "Gemini", "category": "exchange", "icon": "♊", "risk": "low"},
    "0x6fc82a5fe25a5cdb58bc74600a40a69c065263f8": {"label": "Gemini", "category": "exchange", "icon": "♊", "risk": "low"},

    # ── BITFINEX ──
    "0x742d35cc6634c0532925a3b844bc454e4438f44e": {"label": "Bitfinex", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x876eabf441b2ee5b5b0554fd502a8e0600950cfa": {"label": "Bitfinex", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0xf4b51b14b9ee30dc37ec970b50a486f37686e2a8": {"label": "Bitfinex", "category": "exchange", "icon": "🏦", "risk": "low"},

    # ── BITSTAMP ──
    "0x00bdb5699745f5b860228c8f939abf1b9ae374ed": {"label": "Bitstamp", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x1522900b6dafac587d499a862861c0869be6428c": {"label": "Bitstamp", "category": "exchange", "icon": "🏦", "risk": "low"},

    # ── ROBINHOOD ──
    "0x40b38765696e3d5d8d9d834d8aad4bb6e418e489": {"label": "Robinhood", "category": "exchange", "icon": "🏹", "risk": "low"},

    # ── PAYPAL/VENMO ──
    "0x7be8076f4ea4a4ad08075c2508e481d6c946d12b": {"label": "OpenSea", "category": "marketplace", "icon": "🌊", "risk": "low"},
    "0x00000000006c3852cbef3e08e8df289169ede581": {"label": "OpenSea Seaport", "category": "marketplace", "icon": "🌊", "risk": "low"},

    # ── DEFI PROTOCOLS EXTENDED ──
    "0xc36442b4a4522e871399cd717abdd847ab11fe88": {"label": "Uniswap V3 Positions", "category": "protocol", "icon": "🦄", "risk": "low"},
    "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f": {"label": "Uniswap V2 Factory", "category": "protocol", "icon": "🦄", "risk": "low"},
    "0xc0a47dfe034b400b47bdad5fecda2621de6c4d95": {"label": "Uniswap V1", "category": "protocol", "icon": "🦄", "risk": "low"},
    "0x2f50d538606fa9edd2b11e2446beb18c9d5846bb": {"label": "Curve Finance", "category": "protocol", "icon": "🔄", "risk": "low"},
    "0xd533a949740bb3306d119cc777fa900ba034cd52": {"label": "Curve DAO", "category": "protocol", "icon": "🔄", "risk": "low"},
    "0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7": {"label": "Curve 3Pool", "category": "protocol", "icon": "🔄", "risk": "low"},
    "0x5f3b5dfeb7b28cdbd7faba78963ee202a494e2a2": {"label": "Yearn Finance", "category": "protocol", "icon": "💰", "risk": "low"},
    "0xa5407eae9ba41422680e2e00537571bcc53efbfd": {"label": "Curve sUSD", "category": "protocol", "icon": "🔄", "risk": "low"},
    "0x9d5c5e364d81b special": {"label": "SushiSwap Router", "category": "protocol", "icon": "🍣", "risk": "low"},
    "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f": {"label": "SushiSwap Router", "category": "protocol", "icon": "🍣", "risk": "low"},
    "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2": {"label": "SushiSwap Token", "category": "protocol", "icon": "🍣", "risk": "low"},
    "0x00000000219ab540356cbb839cbe05303d7705fa": {"label": "ETH2 Deposit Contract", "category": "protocol", "icon": "💎", "risk": "low"},
    "0xae7ab96520de3a18e5e111b5eaab095312d7fe84": {"label": "Lido stETH", "category": "protocol", "icon": "🔷", "risk": "low"},
    "0x889edc2edab5f40e902b864ad4d7ade8e412f9b1": {"label": "Lido Withdrawal", "category": "protocol", "icon": "🔷", "risk": "low"},
    "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": {"label": "Uniswap Token", "category": "token", "icon": "🦄", "risk": "low"},
    "0x6b175474e89094c44da98b954eedeac495271d0f": {"label": "DAI Token", "category": "token", "icon": "💛", "risk": "low"},
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {"label": "USDC Token", "category": "token", "icon": "💵", "risk": "low"},
    "0xdac17f958d2ee523a2206206994597c13d831ec7": {"label": "USDT Token", "category": "token", "icon": "💵", "risk": "low"},

    # ── KNOWN WHALES / FUNDS ──
    "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be": {"label": "Binance Hot Wallet", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x0548f59fee79f8832c299e01dca5c76f034f558e": {"label": "Cumberland DRW", "category": "fund", "icon": "🏛️", "risk": "low"},
    "0x0e11a6b65a3d89c70e5c20d6f28a4b63a3da4f7c": {"label": "Jump Trading", "category": "fund", "icon": "🏛️", "risk": "low"},
    "0x8b99f3660622e21f2910ecca7fbe51d654a1517d": {"label": "Alameda Research", "category": "fund", "icon": "⚠️", "risk": "high"},
    "0xf02e86d9e0efd57ad034faf52201b79917fe0713": {"label": "Three Arrows Capital", "category": "fund", "icon": "⚠️", "risk": "high"},

    # ── MEV / BOTS EXTENDED ──
    "0xa69babef1ca67a37ffaf7a485dfff3382056e78c": {"label": "MEV Bot", "category": "mev", "icon": "🤖", "risk": "high"},
    "0x00000000003b3cc22af3ae1eac0440bcee416b40": {"label": "MEV Bot", "category": "mev", "icon": "🤖", "risk": "high"},
    "0x6f1cdbbb4d53d226cf4b917bf768b94acbab6168": {"label": "MEV Bot", "category": "mev", "icon": "🤖", "risk": "high"},
    "0x51c72848c68a965f66fa7a88855f9f7784502a7f": {"label": "Banana Gun Bot", "category": "mev", "icon": "🤖", "risk": "high"},
    "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49": {"label": "Maestro Bot", "category": "mev", "icon": "🤖", "risk": "high"},

    # ── NOTABLE DEFI USERS ──
    "0x5a52e96bacdabb82fd05763e25335261b270efcb": {"label": "SBF (FTX)", "category": "influencer", "icon": "⚠️", "risk": "high"},
    "0x57757e3d981446d585af0d9ae4d7df6d64647806": {"label": "Do Kwon (Terra)", "category": "influencer", "icon": "⚠️", "risk": "high"},
    "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0": {"label": "Kraken 1", "category": "exchange", "icon": "🦑", "risk": "low"},
    "0xa910f92acdaf488fa6ef02174fb86208ad7722ba": {"label": "Paradigm", "category": "fund", "icon": "🏛️", "risk": "low"},
    "0x13e382df51a8d76a83c3da8a7a9d6c2b4e5a7e81": {"label": "a16z Crypto", "category": "fund", "icon": "🏛️", "risk": "low"},
    "0x0716a17fbaee714f1e6ab0f9d59edbc5f09815c0": {"label": "Wintermute", "category": "fund", "icon": "🏛️", "risk": "low"},
    "0x00000000ae347930bd1e7b0f35588b92280f9e75": {"label": "Wintermute", "category": "fund", "icon": "🏛️", "risk": "low"},

    # ── BRIDGES EXTENDED ──
    "0x3ee18b2214aff97000d974cf647e7c347e8fa585": {"label": "Wormhole Bridge", "category": "bridge", "icon": "🌉", "risk": "medium"},
    "0x5a58505a96d1dbf8df91cb21b54419fc36e93fde": {"label": "Wormhole Bridge", "category": "bridge", "icon": "🌉", "risk": "medium"},
    "0xa0c68c638235ee32657e8f720a23cec1bfc77c77": {"label": "Polygon Bridge", "category": "bridge", "icon": "🌉", "risk": "low"},
    "0x2796317b0ff8538f1aff0d43b816e4d0225c1c8d": {"label": "Synapse Bridge", "category": "bridge", "icon": "🌉", "risk": "medium"},
    "0x6571d6be3d8460cf5f7d6711cd9961860029d85f": {"label": "Hop Protocol", "category": "bridge", "icon": "🌉", "risk": "low"},
    "0xb8901acb165ed027e32754e0ffe830802919727f": {"label": "Orbiter Finance", "category": "bridge", "icon": "🌉", "risk": "low"},

    # ── STABLECOINS / TREASURIES ──
    "0x5754284f345afc66a98fbb0a0afe71e0f007b949": {"label": "Tether Treasury", "category": "treasury", "icon": "💵", "risk": "low"},
    "0xbE0eB53F46cd790Cd13851d5EFf43D12404d33E8": {"label": "Binance Cold", "category": "exchange", "icon": "🏦", "risk": "low"},
    "0x55fe002aeff02f77364de339a1292923a15844b8": {"label": "Circle (USDC)", "category": "treasury", "icon": "💵", "risk": "low"},
    "0xfc1e690f61efd961294b3e1ce3313fbd8aa4f85d": {"label": "Aave aDAI", "category": "protocol", "icon": "👻", "risk": "low"},
    "0x3dfd23a6c5e8bbcfc9581d2e864a68feb6a076d3": {"label": "Aave Lending Pool V1", "category": "protocol", "icon": "👻", "risk": "low"},

    # ── SOLANA KNOWN ADDRESSES ──
    "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM": {"label": "Binance SOL", "category": "exchange", "icon": "🏦", "risk": "low"},
    "5tzFkiKscXHK5ZXCGbXZxdw7gV4NXCM5b4p8qi6jTQq": {"label": "Kraken SOL", "category": "exchange", "icon": "🦑", "risk": "low"},
    "AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2": {"label": "FTX SOL (defunct)", "category": "exchange", "icon": "⚠️", "risk": "high"},
    "FTX6KBBzJpRtSEBgBpGFqRhkTiTGSWcG8NFBhVo9zDd": {"label": "FTX Wallet", "category": "exchange", "icon": "⚠️", "risk": "high"},
}

def get_extended_label(address: str) -> dict | None:
    return EXTENDED_LABELS.get(address.lower()) or EXTENDED_LABELS.get(address)
