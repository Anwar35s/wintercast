# 🧠 WalletDNA — AI-Powered Crypto Wallet Personality Profiler

Paste any EVM or Solana wallet address and get a full AI-generated behavioural profile — archetype, win rate, trait radar, next-move predictions, and a shareable card.

---

## What It Does

1. **Identifies** the wallet's archetype (Whale, Degen, Smart Money, Bot, etc.)
2. **Profiles** its behaviour using 30+ on-chain signals
3. **Predicts** what the wallet will likely do next using Claude AI

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 + Tailwind + TypeScript |
| Backend | Python + FastAPI |
| EVM Data | Moralis API |
| Solana Data | Helius API |
| AI Layer | Anthropic Claude API |
| Deployment | Docker Compose |

---

## Project Structure

```
walletdna/
├── frontend/                   # Next.js app
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   └── profile/[address]/
│   │       └── page.tsx        # Wallet profile result
│   ├── lib/api.ts              # API client
│   └── ...config files
├── backend/                    # FastAPI app
│   ├── main.py                 # Entry point
│   ├── routers/
│   │   └── analyse.py          # POST /api/analyse
│   ├── services/
│   │   ├── chain_detector.py   # EVM vs Solana detection
│   │   ├── evm_fetcher.py      # Moralis API integration
│   │   ├── solana_fetcher.py   # Helius API integration
│   │   ├── feature_extractor.py# 30+ signal extraction
│   │   └── ai_profiler.py      # Claude AI profile generation
│   └── models/wallet.py        # Pydantic data models
└── docker-compose.yml
```

---

## Setup (Without Docker)

### Step 1 — Get your API keys

| Service | Where to get it | Free tier? |
|---|---|---|
| Moralis | https://moralis.io | ✅ Yes |
| Helius | https://helius.xyz | ✅ Yes |
| Anthropic | https://console.anthropic.com | Pay-as-you-go |

### Step 2 — Backend setup

```bash
cd backend

# Copy and fill in your API keys
cp .env.example .env

# Install dependencies
pip install -r requirements.txt

# Run the API
uvicorn main:app --reload --port 8000
```

The API will be running at `http://localhost:8000`.
Test it: `http://localhost:8000/docs` (auto-generated Swagger UI).

### Step 3 — Frontend setup

```bash
cd frontend

# Copy env file
cp .env.example .env

# Install dependencies
npm install

# Run the dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Setup (With Docker)

```bash
# 1. Fill in both .env files first
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Run everything
docker-compose up --build
```

Frontend → http://localhost:3000  
Backend → http://localhost:8000

---

## API Reference

### `POST /api/analyse`

Analyses a wallet address and returns a full personality profile.

**Request:**
```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
}
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "chain": "evm",
    "archetype": "Smart Money",
    "archetype_icon": "🧠",
    "score": 87,
    "win_rate_pct": 73,
    "avg_hold_days": 47.0,
    "total_trades": 1247,
    "risk_level": "MEDIUM",
    "traits": {
      "PROFITABILITY": 87,
      "PATIENCE": 74,
      "RISK APPETITE": 42,
      "DeFi ACTIVITY": 91,
      "TRADE FREQUENCY": 38,
      "NARRATIVE TIMING": 82
    },
    "narrative": "AI-generated profile text...",
    "predictions": [
      { "probability": 78, "text": "Likely to open a new DeFi position within 14 days..." }
    ],
    "vs_average": {
      "win_rate": { "you": 73, "avg": 38 }
    }
  }
}
```

---

## The 8 Archetypes

| Archetype | Key signals |
|---|---|
| 🐋 The Whale | Avg trade > $500k, market-moving |
| 🤖 The Bot | >100 trades/week, millisecond timing |
| 🧠 Smart Money | Win rate >68%, early narrative timing |
| 💎 Diamond Hands | Hold time >90 days, low risk |
| 🎰 The Degen | Risk score >75%, win rate <45% |
| 🎯 The Sniper | Early narrative timing, hold <7 days |
| 🔄 The Flipper | >10 trades/week, hold <14 days |
| 🐟 Retail Follower | Everything else |

---

## Roadmap

- [x] EVM wallet support (Ethereum)
- [x] Solana wallet support
- [x] Claude AI narrative generation
- [x] Archetype classification
- [x] Shareable profile URL
- [ ] Wallet comparison (side-by-side)
- [ ] Leaderboard (top Smart Money wallets)
- [ ] Email alerts (notify when tracked wallet moves)
- [ ] Auth + Stripe (freemium model)
- [ ] Twitter/X bot

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit and push
4. Open a pull request

---

Built with ❤️ using Next.js, FastAPI, and Claude AI.
