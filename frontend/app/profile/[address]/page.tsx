"use client"
import AnimatedLayout from "@/app/components/AnimatedLayout"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { analyseWallet } from "@/lib/api"

interface Profile {
  address: string
  chain: string
  archetype: string
  archetype_icon: string
  score: number
  win_rate_pct: number
  avg_hold_days: number
  total_trades: number
  risk_level: string
  traits: Record<string, number>
  narrative: string
  predictions: { probability: number; text: string }[]
  recent_activity: { type: string; token: string; amount_usd: number; time: string }[]
  vs_average: Record<string, { you: number; avg: number }>
}

const ICE = "#9945ff"
const ICE2 = "#c084fc"
const BG = "#0a0520"
const BG2 = "rgba(153,69,255,0.04)"
const BORDER = "rgba(153,69,255,0.12)"
const BORDER2 = "rgba(96,165,250,0.22)"
const TEXT = "#e2eaf7"
const MUTED = "rgba(241,245,249,0.4)"
const MUTED2 = "rgba(241,245,249,0.2)"

const LOADING_STEPS = [
  "CONNECTING TO CHAIN...",
  "FETCHING TRANSACTION HISTORY...",
  "EXTRACTING 30+ SIGNALS...",
  "RUNNING AI ANALYSIS...",
  "GENERATING FORECAST...",
]

export default function ProfilePage({ params }: { params: { address: string } }) {
  const address = decodeURIComponent(params.address)
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const stepInterval = setInterval(() => setStep(s => (s + 1) % LOADING_STEPS.length), 900)
    const progInterval = setInterval(() => setProgress(p => Math.min(p + 1.2, 92)), 80)

    analyseWallet(address)
      .then(data => {
        clearInterval(stepInterval)
        clearInterval(progInterval)
        setProgress(100)
        setTimeout(() => {
          if (data.success) setProfile(data.profile)
          else setError(data.error || "Analysis failed")
          setLoading(false)
        }, 400)
      })
      .catch(err => {
        clearInterval(stepInterval)
        clearInterval(progInterval)
        setError(err.message || "Could not connect to API")
        setLoading(false)
      })

    return () => { clearInterval(stepInterval); clearInterval(progInterval) }
  }, [address])

  useEffect(() => {
    if (profile && canvasRef.current) drawRadar(canvasRef.current, profile.traits)
  }, [profile])

  const short = `${address.slice(0, 8)}...${address.slice(-6)}`
  const riskColor = profile?.risk_level === "HIGH" ? "#f87171" : profile?.risk_level === "MEDIUM" ? ICE : "#4ade80"

  if (loading) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2rem", fontFamily: "var(--font-mono)" }}>
      <div style={{ color: ICE2, fontSize: "0.72rem", letterSpacing: "0.1em" }}>{short}</div>
      <div style={{ width: 320, height: 2, background: BORDER, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", background: ICE, width: `${progress}%`, transition: "width 0.1s linear" }} />
      </div>
      <div style={{ color: MUTED, fontSize: "0.7rem", letterSpacing: "0.12em" }}>{LOADING_STEPS[step]}</div>
      <div style={{ color: MUTED2, fontSize: "0.65rem", letterSpacing: "0.08em" }}>winter<span style={{ color: ICE }}>cast</span></div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", fontFamily: "var(--font-mono)" }}>
      <div style={{ color: "#f87171", fontSize: "0.82rem", maxWidth: 400, textAlign: "center", lineHeight: 1.7 }}>{error}</div>
      <button onClick={() => router.push("/")} style={{ background: "none", border: `1px solid ${BORDER2}`, color: MUTED, fontFamily: "var(--font-mono)", fontSize: "0.72rem", padding: "0.6rem 1.5rem", cursor: "pointer", letterSpacing: "0.08em" }}>← Back to search</button>
    </div>
  )

  if (!profile) return null

  return (
    <AnimatedLayout>
    <main style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: "var(--font-mono)" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 100% 50% at 50% 0%, rgba(153,69,255,0.05) 0%, transparent 60%)" }} />

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 2.5rem", background: "rgba(0,0,0,0.92)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${BORDER}` }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: MUTED, fontFamily: "var(--font-mono)", fontSize: "0.72rem", cursor: "pointer", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "0.5rem" }}>← winter<span style={{ color: ICE }}>cast</span></button>
        <div style={{ color: MUTED2, fontSize: "0.65rem", letterSpacing: "0.1em" }}>{short}</div>
        <button onClick={() => navigator.clipboard.writeText(window.location.href)}
          style={{ background: "linear-gradient(135deg,#9945ff,#627eea)", color: "#fff", border: "none", fontFamily: "var(--font-mono)", fontSize: "0.68rem", fontWeight: 700, padding: "0.45rem 1rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Share ↗
        </button>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "7rem 2rem 4rem", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "2rem", background: BG2, border: `1px solid ${BORDER2}`, borderTop: `2px solid ${ICE}`, padding: "2.5rem", marginBottom: "1.5rem", position: "relative", flexWrap: "wrap" }}>
          <div style={{ width: 72, height: 72, background: "rgba(153,69,255,0.1)", border: `1px solid ${BORDER2}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>
            {profile.archetype_icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>{profile.archetype}</div>
            <div style={{ color: MUTED, fontSize: "0.7rem", letterSpacing: "0.06em", marginBottom: "1rem", fontFamily: "var(--font-mono)" }}>{short} · {profile.chain.toUpperCase()}</div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ background: "rgba(153,69,255,0.1)", color: ICE2, fontSize: "0.6rem", padding: "0.25rem 0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{profile.chain.toUpperCase()}</span>
              <span style={{ background: `${riskColor}18`, color: riskColor, fontSize: "0.6rem", padding: "0.25rem 0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{profile.risk_level} RISK</span>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "3.5rem", color: ICE, lineHeight: 1 }}>{profile.score}</div>
            <div style={{ color: MUTED, fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "0.25rem" }}>Wallet Score</div>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: BORDER, border: `1px solid ${BORDER}`, marginBottom: "1.5rem" }}>
          {[
            ["WIN RATE", `${profile.win_rate_pct}%`, "vs 38% avg", profile.win_rate_pct > 60 ? "#4ade80" : TEXT],
            ["AVG HOLD", `${profile.avg_hold_days}d`, "per position", TEXT],
            ["TOTAL TRADES", profile.total_trades.toLocaleString(), "lifetime", TEXT],
            ["RISK LEVEL", profile.risk_level, "portfolio", riskColor],
          ].map(([label, val, sub, color]) => (
            <div key={label as string} style={{ background: BG, padding: "1.5rem" }}>
              <div style={{ color: MUTED, fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>{label}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem", color: color as string, marginBottom: "0.25rem" }}>{val}</div>
              <div style={{ color: MUTED2, fontSize: "0.62rem" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Radar + Traits */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ background: BG2, border: `1px solid ${BORDER}`, padding: "1.75rem" }}>
            <div style={{ color: ICE, fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1.25rem" }}>// Behaviour Radar</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <canvas ref={canvasRef} width={220} height={220} />
            </div>
          </div>
          <div style={{ background: BG2, border: `1px solid ${BORDER}`, padding: "1.75rem" }}>
            <div style={{ color: ICE, fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1.25rem" }}>// Trait Breakdown</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {Object.entries(profile.traits).map(([name, pct]) => (
                <div key={name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", marginBottom: "0.4rem" }}>
                    <span style={{ color: MUTED, letterSpacing: "0.08em" }}>{name}</span>
                    <span style={{ color: TEXT }}>{pct}%</span>
                  </div>
                  <div style={{ height: 2, background: BORDER }}>
                    <div style={{ height: "100%", background: ICE, width: `${pct}%`, transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Narrative */}
        <div style={{ background: BG2, border: `1px solid ${BORDER}`, borderLeft: `2px solid ${ICE}`, padding: "1.75rem", marginBottom: "1.5rem" }}>
          <div style={{ color: ICE, fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>// AI Forecast Narrative</div>
          <p style={{ fontSize: "0.82rem", lineHeight: 1.9, color: TEXT }}
            dangerouslySetInnerHTML={{ __html: profile.narrative.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${ICE2}">$1</strong>`).replace(/\n/g, "<br/>") }}
          />
        </div>

        {/* Predictions */}
        <div style={{ background: `rgba(96,165,250,0.03)`, border: `1px solid rgba(96,165,250,0.18)`, padding: "1.75rem", marginBottom: "1.5rem" }}>
          <div style={{ color: ICE, fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1.25rem" }}>// Next-Move Predictions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {profile.predictions.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem", background: "rgba(0,0,0,0.3)", border: `1px solid ${BORDER}`, padding: "1rem 1.25rem" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", color: ICE, minWidth: 52, flexShrink: 0 }}>{p.probability}%</div>
                <div style={{ fontSize: "0.75rem", lineHeight: 1.7, color: MUTED }}
                  dangerouslySetInnerHTML={{ __html: p.text.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${TEXT}">$1</strong>`) }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* vs Average */}
        <div style={{ background: BG2, border: `1px solid ${BORDER}`, padding: "1.75rem", marginBottom: "1.5rem" }}>
          <div style={{ color: ICE, fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1.25rem" }}>// vs. Average Wallet</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {Object.entries(profile.vs_average).map(([key, { you, avg }]) => {
              const label = key.replace(/_/g, " ").toUpperCase()
              const max = Math.max(Number(you), Number(avg), 1)
              return (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", marginBottom: "0.5rem" }}>
                    <span style={{ color: MUTED, letterSpacing: "0.08em" }}>{label}</span>
                    <span><span style={{ color: ICE }}>{you}</span><span style={{ color: MUTED2 }}> vs </span><span style={{ color: MUTED }}>{avg} avg</span></span>
                  </div>
                  <div style={{ height: 3, background: BORDER, position: "relative" }}>
                    <div style={{ position: "absolute", height: "100%", background: MUTED2, width: `${(Number(avg) / max) * 100}%` }} />
                    <div style={{ position: "absolute", height: "100%", background: ICE, opacity: 0.7, width: `${(Number(you) / max) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Share */}
        <div style={{ background: "rgba(153,69,255,0.06)", border: `1px solid ${BORDER2}`, padding: "1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", marginBottom: "0.25rem" }}>Share your Wintercast</div>
            <div style={{ color: MUTED, fontSize: "0.72rem" }}>{profile.archetype_icon} {profile.archetype} · Score {profile.score} · Win Rate {profile.win_rate_pct}% — wintercast.io</div>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copied!") }}
            style={{ background: "linear-gradient(135deg,#9945ff,#627eea)", color: "#fff", border: "none", fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 700, padding: "0.75rem 1.75rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            Copy Share Link
          </button>
        </div>

      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } @media (max-width: 700px) { div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; } div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; } }`}</style>
    </main>
    </AnimatedLayout>
  )
}

function drawRadar(canvas: HTMLCanvasElement, traits: Record<string, number>) {
  const ctx = canvas.getContext("2d")!
  const W = canvas.width, H = canvas.height
  const cx = W / 2, cy = H / 2, R = 82
  const labels = Object.keys(traits)
  const values = Object.values(traits).map(v => v / 100)
  const N = labels.length

  ctx.clearRect(0, 0, W, H)

  for (let r = 1; r <= 4; r++) {
    ctx.beginPath()
    for (let i = 0; i < N; i++) {
      const angle = (i / N) * Math.PI * 2 - Math.PI / 2
      const x = cx + (R * r / 4) * Math.cos(angle)
      const y = cy + (R * r / 4) * Math.sin(angle)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.strokeStyle = "rgba(153,69,255,0.1)"
    ctx.lineWidth = 1
    ctx.stroke()
  }

  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2 - Math.PI / 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle))
    ctx.strokeStyle = "rgba(153,69,255,0.1)"
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = "rgba(147,197,253,0.5)"
    ctx.font = "7px Space Mono, monospace"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(labels[i], cx + (R + 18) * Math.cos(angle), cy + (R + 18) * Math.sin(angle))
  }

  ctx.beginPath()
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2 - Math.PI / 2
    const x = cx + R * values[i] * Math.cos(angle)
    const y = cy + R * values[i] * Math.sin(angle)
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = "rgba(153,69,255,0.12)"
  ctx.fill()
  ctx.strokeStyle = "#9945ff"
  ctx.lineWidth = 1.5
  ctx.stroke()

  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2 - Math.PI / 2
    ctx.beginPath()
    ctx.arc(cx + R * values[i] * Math.cos(angle), cy + R * values[i] * Math.sin(angle), 3, 0, Math.PI * 2)
    ctx.fillStyle = "#9945ff"
    ctx.fill()
  }
}
