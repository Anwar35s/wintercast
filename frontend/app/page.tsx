"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

const ARCHETYPES = [
  { icon: "🐋", name: "The Whale",       desc: "Massive holdings, slow deliberate moves, market-moving trades.", badge: "TOP 0.1%" },
  { icon: "🤖", name: "The Bot",         desc: "Millisecond timing, high-frequency patterns. Human? Unlikely.",  badge: "MEV SUSPECTED" },
  { icon: "🎰", name: "The Degen",       desc: "Meme coins, leverage, high loss rate. Lives for the thrill.",    badge: "HIGH RISK" },
  { icon: "🧠", name: "Smart Money",     desc: "Consistently profitable, early entries before pumps.",           badge: "ALPHA SIGNAL" },
  { icon: "💎", name: "Diamond Hands",   desc: "Buys and rarely sells. Long hold times, ignores volatility.",    badge: "LONG TERM" },
  { icon: "🎯", name: "The Sniper",      desc: "Gets in early on new launches. Fast flip, big ROI.",             badge: "LAUNCH EXPERT" },
  { icon: "🔄", name: "The Flipper",     desc: "Short hold times, high volume, trades narratives fast.",         badge: "MOMENTUM" },
  { icon: "🐟", name: "Retail Follower", desc: "Buys tops, small amounts, follows trends late.",                 badge: "COMMON" },
]

export default function Home() {
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleAnalyse = async () => {
    const addr = address.trim()
    if (!addr) return
    setLoading(true)
    setError("")
    try {
      router.push(`/profile/${encodeURIComponent(addr)}`)
    } catch {
      setError("Invalid address. Please try again.")
      setLoading(false)
    }
  }

  return (
    <main>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5 bg-[#080b0f]/85 backdrop-blur border-b border-white/7">
        <div className="font-display font-extrabold text-xl tracking-tight">
          Wallet<span className="text-[#f0a500]">DNA</span>
        </div>
        <div className="hidden md:flex gap-8 text-[#7a7870] text-xs tracking-widest">
          <a href="#archetypes" className="hover:text-white transition-colors">ARCHETYPES</a>
          <a href="#how" className="hover:text-white transition-colors">HOW IT WORKS</a>
        </div>
        <button
          onClick={handleAnalyse}
          className="bg-[#f0a500] text-black text-xs font-bold px-5 py-2 tracking-widest hover:opacity-85 transition-opacity"
        >
          ANALYSE WALLET
        </button>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-100"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%)"
          }}
        />
        <div className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(240,165,0,0.06) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        />

        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 border border-[#f0a500]/30 bg-[#f0a500]/10 text-[#ffbe3d] px-4 py-1.5 text-xs tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f0a500] animate-pulse" />
            LIVE ON ETH + SOLANA
          </div>

          <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-[1.05] tracking-tight mb-6">
            Your wallet tells<br />a story. <span className="text-[#f0a500]">Read it.</span>
          </h1>
          <p className="text-[#7a7870] text-sm leading-8 max-w-lg mb-10 tracking-wide">
            Enter any wallet address. WalletDNA analyses 30+ on-chain signals and generates a complete behavioural profile — archetype, win rate, predictions, and a shareable card.
          </p>

          <div className="relative w-full max-w-xl mb-3">
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAnalyse()}
              placeholder="0x... or Solana address"
              className="w-full bg-[#0d1117] border border-white/14 text-[#e8e6e0] font-mono text-sm py-4 pl-5 pr-36 outline-none focus:border-[#f0a500] transition-colors placeholder:text-[#4a4840] tracking-wide"
            />
            <button
              onClick={handleAnalyse}
              disabled={loading}
              className="absolute right-0 top-0 bottom-0 bg-[#f0a500] text-black font-mono text-xs font-bold px-6 tracking-widest hover:opacity-85 disabled:opacity-60 transition-opacity"
            >
              {loading ? "..." : "ANALYSE →"}
            </button>
          </div>

          {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

          <p className="text-[#4a4840] text-xs tracking-widest">
            No account needed. Try:{" "}
            <span className="text-[#7a7870] cursor-pointer underline underline-offset-4 hover:text-[#f0a500]"
              onClick={() => { setAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"); }}>
              vitalik.eth
            </span>
          </p>

          <div className="flex gap-12 mt-16 pt-8 border-t border-white/7">
            {[["2.4M+","WALLETS ANALYSED"],["30+","SIGNALS TRACKED"],["8","ARCHETYPES"],["EVM+SOL","CHAINS"]].map(([n,l]) => (
              <div key={l} className="text-center">
                <div className="font-display font-extrabold text-2xl text-[#f0a500]">{n}</div>
                <div className="text-[#7a7870] text-xs tracking-widest mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Archetypes */}
      <section id="archetypes" className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-[#f0a500] text-xs tracking-[0.15em] mb-3">// ARCHETYPES</div>
        <h2 className="font-display font-extrabold text-4xl tracking-tight mb-3">Which type are you?</h2>
        <p className="text-[#7a7870] text-sm leading-8 mb-10 max-w-lg">Every wallet falls into one of 8 behavioural patterns. Our AI identifies exactly which one — and how extreme.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/7 border border-white/7">
          {ARCHETYPES.map(a => (
            <div key={a.name} className="bg-[#0d1117] p-7 hover:bg-[#111820] transition-colors group cursor-pointer relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#f0a500] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              <div className="text-2xl mb-4">{a.icon}</div>
              <div className="font-display font-bold text-sm mb-2">{a.name}</div>
              <div className="text-[#7a7870] text-xs leading-6">{a.desc}</div>
              <div className="inline-block mt-3 bg-[#f0a500]/10 text-[#ffbe3d] text-[10px] px-2 py-1 tracking-widest">{a.badge}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-[#f0a500] text-xs tracking-[0.15em] mb-3">// HOW IT WORKS</div>
        <h2 className="font-display font-extrabold text-4xl tracking-tight mb-3">From address to intelligence</h2>
        <p className="text-[#7a7870] text-sm leading-8 mb-10 max-w-lg">Paste any wallet. In seconds, our pipeline fetches, analyses, and profiles the complete on-chain history.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/7 border border-white/7">
          {[
            ["STEP 01","Paste any address","EVM (0x...) or Solana. We auto-detect the chain and query all transaction history via Moralis & Helius APIs."],
            ["STEP 02","AI analyses 30+ signals","Win rate, hold time, trade frequency, risk exposure, timing patterns, DeFi activity and more."],
            ["STEP 03","Get your full profile","Archetype, score, AI-written narrative, next-move predictions and a shareable card — in under 10 seconds."],
          ].map(([num,title,desc]) => (
            <div key={num} className="bg-[#0d1117] p-10">
              <div className="text-[#f0a500] text-xs tracking-[0.15em] mb-6">{num}</div>
              <div className="font-display font-bold text-lg mb-3">{title}</div>
              <div className="text-[#7a7870] text-xs leading-7">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="mx-4 mb-20">
        <div className="max-w-5xl mx-auto bg-[#0d1117] border border-white/14 border-t-2 border-t-[#f0a500] p-20 text-center">
          <h2 className="font-display font-extrabold text-4xl tracking-tight mb-3">Know every wallet.<br/>Know the market.</h2>
          <p className="text-[#7a7870] text-sm mb-8">Free to use. No account required. Just paste and analyse.</p>
          <button
            onClick={() => { setAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"); window.scrollTo({top:0,behavior:"smooth"}); }}
            className="bg-[#f0a500] text-black font-mono text-sm font-bold px-10 py-4 tracking-widest hover:opacity-85 transition-opacity"
          >
            TRY DEMO PROFILE →
          </button>
        </div>
      </div>

      <footer className="max-w-5xl mx-auto px-4 py-8 border-t border-white/7 flex justify-between items-center">
        <div className="font-display font-extrabold">Wallet<span className="text-[#f0a500]">DNA</span></div>
        <div className="text-[#7a7870] text-xs tracking-widest">© 2025 WalletDNA</div>
      </footer>
    </main>
  )
}
