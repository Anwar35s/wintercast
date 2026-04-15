"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { analyseWallet } from "@/lib/api"

interface Profile {
  address: string
  archetype: string
  archetype_icon: string
  score: number
  win_rate_pct: number
  total_trades: number
  risk_level: string
  chain: string
  traits: Record<string, number>
}

export default function CardPage({ params }: { params: { address: string } }) {
  const address = decodeURIComponent(params.address)
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    analyseWallet(address).then(data => {
      if (data.success) setProfile(data.profile)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [address])

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#050810", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", color: "#60a5fa", fontSize: "0.75rem", letterSpacing: "0.1em" }}>
      GENERATING CARD...
    </div>
  )

  if (!profile) return null

  const short = `${address.slice(0, 8)}...${address.slice(-6)}`
  const riskColor = profile.risk_level === "HIGH" ? "#f87171" : profile.risk_level === "MEDIUM" ? "#60a5fa" : "#4ade80"
  const topTraits = Object.entries(profile.traits).sort(([,a],[,b]) => b - a).slice(0, 3)

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/profile/${encodeURIComponent(address)}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050810", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "var(--font-mono)" }}>
      <div style={{ width: "min(480px, 100%)", background: "#080d18", border: "1px solid rgba(96,165,250,0.25)", borderTop: "3px solid #60a5fa", padding: "2rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(96,165,250,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.03) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 300, height: 150, background: "radial-gradient(ellipse, rgba(96,165,250,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
            <div>
              <div style={{ color: "rgba(226,234,247,0.35)", fontSize: "0.58rem", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>WINTERCAST · ON-CHAIN FORECAST</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "2.5rem" }}>{profile.archetype_icon}</span>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", color: "#e2eaf7", letterSpacing: "-0.02em" }}>{profile.archetype}</div>
                  <div style={{ color: "rgba(226,234,247,0.4)", fontSize: "0.6rem", letterSpacing: "0.06em" }}>{short} · {profile.chain.toUpperCase()}</div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "3rem", color: "#60a5fa", lineHeight: 1 }}>{profile.score}</div>
              <div style={{ color: "rgba(226,234,247,0.35)", fontSize: "0.55rem", letterSpacing: "0.12em" }}>WALLET SCORE</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.25rem" }}>
            {[["WIN RATE", `${profile.win_rate_pct}%`, "#e2eaf7"], ["TRADES", profile.total_trades.toLocaleString(), "#e2eaf7"], ["RISK", profile.risk_level, riskColor]].map(([l,v,c]) => (
              <div key={l} style={{ background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.1)", padding: "0.75rem" }}>
                <div style={{ color: "rgba(226,234,247,0.35)", fontSize: "0.55rem", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>{l}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: c }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: "1.25rem" }}>
            {topTraits.map(([name, pct]) => (
              <div key={name} style={{ marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", marginBottom: "0.25rem" }}>
                  <span style={{ color: "rgba(226,234,247,0.4)" }}>{name}</span>
                  <span style={{ color: "#e2eaf7" }}>{pct}%</span>
                </div>
                <div style={{ height: 2, background: "rgba(96,165,250,0.1)" }}>
                  <div style={{ height: "100%", background: "#60a5fa", width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(96,165,250,0.1)", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.9rem", color: "#e2eaf7" }}>winter<span style={{ color: "#60a5fa" }}>cast</span>.io</div>
            <div style={{ color: "rgba(226,234,247,0.25)", fontSize: "0.55rem", letterSpacing: "0.08em" }}>THE COLD TRUTH ABOUT EVERY WALLET</div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={() => router.push(`/profile/${encodeURIComponent(address)}`)}
          style={{ background: "rgba(96,165,250,0.1)", color: "#93c5fd", border: "1px solid rgba(96,165,250,0.2)", fontFamily: "var(--font-mono)", fontSize: "0.72rem", padding: "0.75rem 1.5rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          ← Full Profile
        </button>
        <button onClick={handleShare}
          style={{ background: copied ? "#4ade80" : "#60a5fa", color: "#050810", border: "none", fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 700, padding: "0.75rem 1.5rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", transition: "background 0.3s" }}>
          {copied ? "Copied ✓" : "Copy Share Link ↗"}
        </button>
      </div>
      <div style={{ marginTop: "1rem", color: "rgba(226,234,247,0.25)", fontSize: "0.65rem", letterSpacing: "0.08em", textAlign: "center" }}>
        Screenshot this card and share on X 🧊
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  )
}
