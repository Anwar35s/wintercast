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
  const router = useRouter()

  const handleAnalyse = () => {
    const addr = address.trim()
    if (!addr) return
    setLoading(true)
    router.push(`/profile/${encodeURIComponent(addr)}`)
  }

  return (
    <main style={{ background: "#0a0520", minHeight: "100vh", color: "#e2eaf7", fontFamily: "var(--font-mono)" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 120% 60% at 50% -10%, rgba(153,69,255,0.15) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 80% 80%, rgba(98,126,234,0.12) 0%, transparent 50%)" }} />

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 2.5rem", background: "rgba(5,8,16,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(96,165,250,0.1)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>
          winter<span style={{ color: "#60a5fa" }}>cast</span>
        </div>
        <div style={{ display: "flex", gap: "2rem" }}>
          {[["archetypes","Archetypes"],["how-it-works","How it works"]].map(([id,l]) => (
            <a key={id} href={`#${id}`} style={{ color: "rgba(226,234,247,0.4)", textDecoration: "none", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{l}</a>
          ))}
        </div>
        <button onClick={handleAnalyse} style={{ background: "#60a5fa", color: "#050810", border: "none", fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 700, padding: "0.5rem 1.25rem", letterSpacing: "0.08em", cursor: "pointer", textTransform: "uppercase" }}>
          Analyse Wallet
        </button>
      </nav>

      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "8rem 2rem 4rem", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(96,165,250,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.04) 1px, transparent 1px)", backgroundSize: "50px 50px", maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 10%, transparent 100%)" }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", border: "1px solid rgba(96,165,250,0.25)", background: "rgba(96,165,250,0.08)", color: "#93c5fd", padding: "0.35rem 1rem", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "2rem" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa", display: "inline-block" }} />
            The cold truth about every wallet
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 7vw, 5.5rem)", fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.03em", marginBottom: "1.5rem", color: "#e2eaf7" }}>
            Every wallet<br />tells a story.<br /><span style={{ color: "#60a5fa" }}>We read it.</span>
          </h1>

          <p style={{ color: "rgba(226,234,247,0.45)", fontSize: "0.88rem", lineHeight: 1.9, maxWidth: 480, marginBottom: "3rem" }}>
            Paste any EVM or Solana address. Wintercast analyses 30+ on-chain signals and delivers a complete behavioural forecast — archetype, score, AI narrative, and next-move predictions.
          </p>

          <div style={{ position: "relative", width: "100%", maxWidth: 580, marginBottom: "0.75rem" }}>
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAnalyse()}
              placeholder="0x... or Solana address"
              style={{ width: "100%", background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.2)", color: "#e2eaf7", fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "1.1rem 1.5rem", paddingRight: "140px", outline: "none", letterSpacing: "0.03em" }}
            />
            <button onClick={handleAnalyse} disabled={loading}
              style={{ position: "absolute", right: 0, top: 0, bottom: 0, background: "#60a5fa", color: "#050810", border: "none", fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 700, padding: "0 1.5rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {loading ? "..." : "Analyse →"}
            </button>
          </div>

          <p style={{ color: "rgba(226,234,247,0.25)", fontSize: "0.68rem", letterSpacing: "0.08em" }}>
            No account needed · Try:{" "}
            <span style={{ color: "rgba(96,165,250,0.7)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}
              onClick={() => setAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")}>
              vitalik.eth
            </span>
          </p>

          <div style={{ display: "flex", gap: "3rem", marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid rgba(96,165,250,0.1)" }}>
            {[["2.4M+","Wallets Analysed"],["30+","Signals Tracked"],["8","Archetypes"],["EVM+SOL","Chains"]].map(([n,l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.8rem", color: "#60a5fa" }}>{n}</div>
                <div style={{ color: "rgba(226,234,247,0.35)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "0.25rem" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="archetypes" style={{ maxWidth: 1100, margin: "0 auto", padding: "6rem 2rem", position: "relative", zIndex: 1 }}>
        <div style={{ color: "#60a5fa", fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>// Archetypes</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.8rem)", letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>Which type are you?</h2>
        <p style={{ color: "rgba(226,234,247,0.4)", fontSize: "0.82rem", lineHeight: 1.8, maxWidth: 480, marginBottom: "3rem" }}>Every wallet falls into one of 8 behavioural patterns. Our AI identifies exactly which one.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 1, background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.08)" }}>
          {ARCHETYPES.map(a => (
            <div key={a.name} style={{ background: "rgba(10,5,32,0.9)", padding: "2rem", cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(96,165,250,0.05)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(10,5,32,0.9)" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{a.icon}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.5rem" }}>{a.name}</div>
              <div style={{ color: "rgba(226,234,247,0.4)", fontSize: "0.72rem", lineHeight: 1.7 }}>{a.desc}</div>
              <div style={{ display: "inline-block", marginTop: "1rem", background: "rgba(96,165,250,0.1)", color: "#93c5fd", fontSize: "0.6rem", padding: "0.25rem 0.6rem", letterSpacing: "0.1em" }}>{a.badge}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" style={{ maxWidth: 1100, margin: "0 auto", padding: "6rem 2rem", position: "relative", zIndex: 1 }}>
        <div style={{ color: "#60a5fa", fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>// How it works</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.8rem)", letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>From address to forecast</h2>
        <p style={{ color: "rgba(226,234,247,0.4)", fontSize: "0.82rem", lineHeight: 1.8, maxWidth: 480, marginBottom: "3rem" }}>Paste any wallet. In seconds, Wintercast reads the chain and delivers the cold truth.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.08)" }}>
          {[
            ["01","Paste any address","EVM or Solana. We auto-detect the chain and pull the full transaction history via Moralis & Helius."],
            ["02","AI reads 30+ signals","Win rate, hold time, risk exposure, DeFi activity, timing patterns — all analysed in seconds."],
            ["03","Get your forecast","Archetype, score, AI narrative, next-move predictions and a shareable card. Cold. Precise. Yours."],
          ].map(([n,t,d]) => (
            <div key={n} style={{ background: "rgba(10,5,32,0.9)", padding: "2.5rem 2rem" }}>
              <div style={{ color: "#60a5fa", fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1.5rem" }}>Step {n}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.75rem" }}>{t}</div>
              <div style={{ color: "rgba(226,234,247,0.4)", fontSize: "0.75rem", lineHeight: 1.8 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin: "0 auto 6rem", padding: "0 2rem", position: "relative", zIndex: 1 }}>
        <div style={{ background: "rgba(96,165,250,0.04)", border: "1px solid rgba(96,165,250,0.15)", borderTop: "2px solid #60a5fa", padding: "5rem 3rem", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 3rem)", letterSpacing: "-0.02em", marginBottom: "1rem" }}>The cold truth<br />about every wallet.</h2>
          <p style={{ color: "rgba(226,234,247,0.4)", fontSize: "0.85rem", marginBottom: "2rem" }}>Free to use. No account required.</p>
          <button onClick={() => { setAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"); window.scrollTo({ top: 0, behavior: "smooth" }) }}
            style={{ background: "#60a5fa", color: "#050810", border: "none", fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 700, padding: "0.9rem 2.5rem", letterSpacing: "0.08em", cursor: "pointer", textTransform: "uppercase" }}>
            Try Demo Profile →
          </button>
        </div>
      </div>

      <footer style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 2rem 4rem", borderTop: "1px solid rgba(96,165,250,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}>winter<span style={{ color: "#60a5fa" }}>cast</span></div>
        <div style={{ color: "rgba(226,234,247,0.25)", fontSize: "0.68rem", letterSpacing: "0.08em" }}>© 2025 Wintercast · wintercast.io</div>
      </footer>

      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } @media (max-width: 700px) { nav > div:nth-child(2) { display: none; } }`}</style>
    </main>
  )
}
