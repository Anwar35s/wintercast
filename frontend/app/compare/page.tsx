"use client"
import AnimatedLayout from "@/app/components/AnimatedLayout"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { analyseWallet } from "@/lib/api"

const ICE = "#9945ff"
const BG = "#0a0520"
const BG2 = "rgba(153,69,255,0.04)"
const BORDER = "rgba(153,69,255,0.12)"
const TEXT = "#e2eaf7"
const MUTED = "rgba(241,245,249,0.4)"

interface Profile {
  address: string
  archetype: string
  archetype_icon: string
  score: number
  win_rate_pct: number
  avg_hold_days: number
  total_trades: number
  risk_level: string
  chain: string
  traits: Record<string, number>
  narrative: string
}

export default function ComparePage() {
  const router = useRouter()
  const [addr1, setAddr1] = useState("")
  const [addr2, setAddr2] = useState("")
  const [profile1, setProfile1] = useState<Profile | null>(null)
  const [profile2, setProfile2] = useState<Profile | null>(null)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [error, setError] = useState("")

  const analyse = async () => {
    if (!addr1.trim() || !addr2.trim()) { setError("Enter both wallet addresses"); return }
    setError("")
    setLoading1(true)
    setLoading2(true)
    try {
      const [r1, r2] = await Promise.all([analyseWallet(addr1.trim()), analyseWallet(addr2.trim())])
      if (r1.success) setProfile1(r1.profile)
      if (r2.success) setProfile2(r2.profile)
    } catch { setError("Analysis failed. Please try again.") }
    setLoading1(false)
    setLoading2(false)
  }

  const WalletCard = ({ profile, loading }: { profile: Profile | null, loading: boolean }) => {
    const riskColor = profile?.risk_level === "HIGH" ? "#f87171" : profile?.risk_level === "MEDIUM" ? ICE : "#4ade80"
    if (loading) return (
      <div style={{ flex: 1, background: BG2, border: `1px solid ${BORDER}`, padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <div style={{ color: ICE, fontSize: "0.7rem", letterSpacing: "0.1em" }}>ANALYSING...</div>
      </div>
    )
    if (!profile) return (
      <div style={{ flex: 1, background: BG2, border: `1px solid ${BORDER}`, padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <div style={{ color: MUTED, fontSize: "0.7rem", letterSpacing: "0.08em", textAlign: "center" }}>Wallet will appear here</div>
      </div>
    )
    const short = `${profile.address.slice(0,6)}...${profile.address.slice(-4)}`
    return (
      <div style={{ flex: 1, background: BG2, border: `1px solid rgba(153,69,255,0.2)`, borderTop: `2px solid ${ICE}`, padding: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "2rem" }}>{profile.archetype_icon}</span>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.3rem", color: TEXT }}>{profile.archetype}</div>
            <div style={{ color: MUTED, fontSize: "0.62rem" }}>{short} · {profile.chain.toUpperCase()}</div>
          </div>
          <div style={{ marginLeft: "auto", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", color: ICE }}>{profile.score}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {[
            ["Win Rate", `${profile.win_rate_pct}%`, profile.win_rate_pct > 60 ? "#4ade80" : TEXT],
            ["Total Trades", profile.total_trades.toLocaleString(), TEXT],
            ["Risk Level", profile.risk_level, riskColor],
          ].map(([l,v,c]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", padding: "0.6rem 0", borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ color: MUTED }}>{l}</span>
              <span style={{ color: c as string, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "1.25rem" }}>
          {Object.entries(profile.traits).map(([name, pct]) => (
            <div key={name} style={{ marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", marginBottom: "0.25rem" }}>
                <span style={{ color: MUTED }}>{name}</span><span style={{ color: TEXT }}>{pct}%</span>
              </div>
              <div style={{ height: 2, background: BORDER }}>
                <div style={{ height: "100%", background: ICE, width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => router.push(`/profile/${encodeURIComponent(profile.address)}`)}
          style={{ marginTop: "1.25rem", width: "100%", background: "rgba(153,69,255,0.1)", color: ICE, border: `1px solid rgba(153,69,255,0.2)`, fontFamily: "var(--font-mono)", fontSize: "0.68rem", padding: "0.65rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Full Profile →
        </button>
      </div>
    )
  }

  return (
    <AnimatedLayout>
    <main style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: "var(--font-mono)" }}>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 2rem", background: "rgba(0,0,0,0.92)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${BORDER}` }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: MUTED, fontFamily: "var(--font-mono)", fontSize: "0.72rem", cursor: "pointer", letterSpacing: "0.08em" }}>← winter<span style={{ color: ICE }}>cast</span></button>
        <div style={{ color: MUTED, fontSize: "0.68rem", letterSpacing: "0.1em" }}>WALLET COMPARE</div>
        <div style={{ width: 80 }} />
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "6rem 1.5rem 4rem" }}>
        <div style={{ color: ICE, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>// Compare</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 2.5rem)", letterSpacing: "-0.02em", marginBottom: "2rem" }}>Who trades better?</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "1rem", alignItems: "end", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ color: MUTED, fontSize: "0.6rem", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>WALLET 1</div>
            <input value={addr1} onChange={e => setAddr1(e.target.value)} onKeyDown={e => e.key === "Enter" && analyse()}
              placeholder="0x... or Solana address"
              style={{ width: "100%", background: BG2, border: `1px solid rgba(153,69,255,0.2)`, color: TEXT, fontFamily: "var(--font-mono)", fontSize: "0.78rem", padding: "0.9rem 1rem", outline: "none" }} />
          </div>
          <div style={{ color: MUTED, fontSize: "0.85rem", fontFamily: "var(--font-display)", fontWeight: 700, paddingBottom: "0.5rem" }}>VS</div>
          <div>
            <div style={{ color: MUTED, fontSize: "0.6rem", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>WALLET 2</div>
            <input value={addr2} onChange={e => setAddr2(e.target.value)} onKeyDown={e => e.key === "Enter" && analyse()}
              placeholder="0x... or Solana address"
              style={{ width: "100%", background: BG2, border: `1px solid rgba(153,69,255,0.2)`, color: TEXT, fontFamily: "var(--font-mono)", fontSize: "0.78rem", padding: "0.9rem 1rem", outline: "none" }} />
          </div>
        </div>

        {error && <div style={{ color: "#f87171", fontSize: "0.72rem", marginBottom: "1rem" }}>{error}</div>}

        <button onClick={analyse} disabled={loading1 || loading2}
          style={{ background: "linear-gradient(135deg,#9945ff,#627eea)", color: "#fff", border: "none", fontFamily: "var(--font-mono)", fontSize: "0.78rem", fontWeight: 700, padding: "0.85rem 2.5rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "2rem", opacity: loading1 || loading2 ? 0.6 : 1 }}>
          {loading1 || loading2 ? "ANALYSING..." : "COMPARE WALLETS →"}
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <WalletCard profile={profile1} loading={loading1} />
          <WalletCard profile={profile2} loading={loading2} />
        </div>

        {profile1 && profile2 && (
          <div style={{ marginTop: "1.5rem", background: BG2, border: `1px solid ${BORDER}`, padding: "1.5rem" }}>
            <div style={{ color: ICE, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>// Verdict</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem" }}>
              {profile1.score > profile2.score ? (
                <span>{profile1.archetype_icon} <span style={{ color: ICE }}>{profile1.archetype}</span> wins with a score of {profile1.score} vs {profile2.score}</span>
              ) : profile2.score > profile1.score ? (
                <span>{profile2.archetype_icon} <span style={{ color: ICE }}>{profile2.archetype}</span> wins with a score of {profile2.score} vs {profile1.score}</span>
              ) : (
                <span>It's a tie — both score <span style={{ color: ICE }}>{profile1.score}</span></span>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } @media (max-width: 600px) { div[style*="grid-template-columns: 1fr auto 1fr"] { grid-template-columns: 1fr !important; } div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; } }`}</style>
    </main>
    </AnimatedLayout>
  )
}
