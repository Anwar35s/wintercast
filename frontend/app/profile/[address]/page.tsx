"use client"
const API = process.env.NEXT_PUBLIC_API_URL || "https://wintercast-production.up.railway.app"
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
const BG = "transparent"
const BG2 = "rgba(153,69,255,0.06)"
const BORDER = "rgba(153,69,255,0.15)"
const BORDER2 = "rgba(153,69,255,0.25)"
const TEXT = "#f1f5f9"
const MUTED = "rgba(226,234,247,0.4)"
const MUTED2 = "rgba(226,234,247,0.2)"

const CHAIN_COLORS: Record<string, string> = {
  eth: "#627eea",
  base: "#0052ff", 
  polygon: "#8247e5",
  arbitrum: "#28a0f0",
  bsc: "#f0b90b",
  optimism: "#ff0420",
  solana: "#9945ff",
  evm: "#627eea",
}


const LOADING_STEPS = [
  "CONNECTING TO CHAIN...",
  "FETCHING TRANSACTION HISTORY...",
  "EXTRACTING 30+ SIGNALS...",
  "RUNNING AI ANALYSIS...",
  "GENERATING FORECAST...",
]

function formatHoldTime(days: number): string {
  if (days === 0) return "< 1d"
  if (days < 1) return `${Math.round(days * 24)}h`
  if (days < 30) return `${Math.round(days)}d`
  if (days < 365) return `${Math.round(days / 30)}mo`
  return `${Math.round(days / 365)}yr`
}


function ScoreChart({ history }: { history: any }) {
  if (!history?.history || history.history.length < 2) return null
  const points = history.history
  const scores = points.map((p:any) => p.score)
  const max = Math.max(...scores), min = Math.min(...scores)
  const range = max - min || 1
  const w = 300, h = 60
  const pts = points.map((p:any, i:number) => {
    const x = (i / (points.length - 1)) * w
    const y = h - ((p.score - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')
  const color = history.change > 0 ? "#4ade80" : history.change < 0 ? "#f87171" : "#9945ff"
  return (
    <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,padding:"1rem 1.25rem",marginTop:"1rem"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
        <span style={{color:"rgba(255,255,255,0.4)",fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase"}}>Score History</span>
        <span style={{color,fontSize:"0.75rem",fontWeight:700}}>
          {history.change > 0 ? `↑ +${history.change}` : history.change < 0 ? `↓ ${history.change}` : "→ stable"}
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{height:50,display:"block"}}>
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#sg)"/>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2"/>
      </svg>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:"0.25rem"}}>
        <span style={{color:"rgba(255,255,255,0.2)",fontSize:"0.58rem"}}>{points[0]?.date}</span>
        <span style={{color:"rgba(255,255,255,0.2)",fontSize:"0.58rem"}}>{points[points.length-1]?.date}</span>
      </div>
    </div>
  )
}

export default function ProfilePage({ params }: { params: { address: string } }) {
  const address = decodeURIComponent(params.address)
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<any>(null)
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
  const [ensName, setEnsName] = useState<string | null>(null)
  useEffect(() => {
    if (!address) return
    fetch(`${API}/api/history/${address}`).then(r=>r.json()).then(d=>setHistory(d)).catch(()=>{})
  }, [address])
  const riskColor = profile?.risk_level === "HIGH" ? "#f87171" : profile?.risk_level === "MEDIUM" ? ICE : "#4ade80"
  const chainAccent = profile ? (CHAIN_COLORS[profile.chain] || ICE) : ICE

  useEffect(() => {
    if (profile && profile.chain === "evm") {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ens/v2/${address}`)
        .then(r => r.json())
        .then(d => { if (d.ens) setEnsName(d.ens) })
        .catch(() => {})
    }
  }, [profile, address])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Loading screen
  if (loading) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2rem", fontFamily: "var(--font-mono)", padding: "2rem" }}>
      <div style={{ fontSize: "2rem" }}>🧊</div>
      <div style={{ color: ICE2, fontSize: "0.72rem", letterSpacing: "0.1em", maxWidth: 300, textAlign: "center", wordBreak: "break-all" }}>{short}</div>
      <div style={{ width: "min(320px, 90vw)", height: 2, background: BORDER, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", background: chainAccent, width: `${progress}%`, transition: "width 0.1s linear" }} />
      </div>
      <div style={{ color: MUTED, fontSize: "0.7rem", letterSpacing: "0.12em", textAlign: "center" }}>{LOADING_STEPS[step]}</div>
      <div style={{ color: MUTED2, fontSize: "0.65rem", letterSpacing: "0.08em" }}>winter<span style={{ color: ICE }}>cast</span></div>
    </div>
  )

  // Error screen
  if (error) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", fontFamily: "var(--font-mono)", padding: "2rem", textAlign: "center" }}>
      <div style={{ fontSize: "3rem" }}>❄️</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem" }}>Analysis Failed</div>
      <div style={{ color: MUTED, fontSize: "0.8rem", maxWidth: 400, lineHeight: 1.7 }}>
        {error.includes("Invalid wallet") ? "That doesn't look like a valid wallet address. Please check and try again." :
         error.includes("connect") ? "Could not connect to the analysis engine. Please try again in a moment." :
         "Something went wrong. Please try again."}
      </div>
      <button onClick={() => router.push("/")}
        style={{ background: ICE, color: BG, border: "none", fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 700, padding: "0.75rem 1.75rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Try Another Wallet
      </button>
    </div>
  )

  // Empty wallet screen
  if (profile && profile.total_trades === 0) return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "var(--font-mono)" }}>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 2.5rem", background: "rgba(5,8,16,0.9)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${BORDER}` }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: MUTED, fontFamily: "var(--font-mono)", fontSize: "0.72rem", cursor: "pointer", letterSpacing: "0.08em" }}>← winter<span style={{ color: ICE }}>cast</span></button>
        <div style={{ color: MUTED2, fontSize: "0.65rem", letterSpacing: "0.1em" }}>{short}</div>
        <div style={{ width: 80 }} />
      </nav>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "8rem 2rem 4rem", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>👻</div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", marginBottom: "1rem" }}>Ghost Wallet</div>
        <div style={{ color: MUTED, fontSize: "0.85rem", lineHeight: 1.8, marginBottom: "2rem" }}>
          This wallet has no transaction history on Ethereum. It may be a cold storage address, a freshly created wallet, or active on a different chain.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
          {["Try on Base", "Try on Polygon", "Try on Solana", "Try another wallet"].map((t, i) => (
            <button key={t} onClick={() => i === 3 ? router.push("/") : null}
              style={{ background: BG2, border: `1px solid ${BORDER}`, color: MUTED, fontFamily: "var(--font-mono)", fontSize: "0.72rem", padding: "0.75rem", cursor: "pointer", letterSpacing: "0.06em" }}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={() => router.push("/")}
          style={{ background: ICE, color: BG, border: "none", fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 700, padding: "0.75rem 2rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Analyse Another Wallet
        </button>
      </div>
    </div>
  )

  if (!profile) return null

  return (
    <AnimatedLayout>
    <main style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: "var(--font-mono)" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 100% 50% at 50% 0%, rgba(96,165,250,0.05) 0%, transparent 60%)" }} />

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 1.5rem", background: "rgba(5,8,16,0.9)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${BORDER}` }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: MUTED, fontFamily: "var(--font-mono)", fontSize: "0.72rem", cursor: "pointer", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "0.5rem" }}>← winter<span style={{ color: ICE }}>cast</span></button>
        <div style={{ color: MUTED2, fontSize: "0.65rem", letterSpacing: "0.1em", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "30vw" }}>{short}</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => router.push(`/portfolio/${encodeURIComponent(address)}`)}
            style={{ background: BG2, color: ICE, border: `1px solid ${BORDER}`, fontFamily: "var(--font-mono)", fontSize: "0.68rem", fontWeight: 700, padding: "0.45rem 1rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            Portfolio 💼
          </button>
          <button onClick={handleShare}
            style={{ background: copied ? "#4ade80" : ICE, color: BG, border: "none", fontFamily: "var(--font-mono)", fontSize: "0.68rem", fontWeight: 700, padding: "0.45rem 1rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", transition: "background 0.3s", whiteSpace: "nowrap" }}>
            {copied ? "Copied ✓" : "Share ↗"}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "5rem 1rem 4rem", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", background: BG2, border: `1px solid ${BORDER2}`, borderTop: `2px solid ${chainAccent}`, padding: "1.75rem", marginBottom: "1rem", position: "relative", flexWrap: "wrap" }}>
          <div style={{ width: 64, height: 64, background: "rgba(153,69,255,0.1)", border: `1px solid ${BORDER2}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", flexShrink: 0 }}>
            {profile.archetype_icon}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.5rem, 4vw, 2rem)", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>{profile.archetype}</div>
            <div style={{ color: MUTED, fontSize: "0.68rem", letterSpacing: "0.06em", marginBottom: "0.75rem", wordBreak: "break-all" }}>
            {ensName ? <span style={{ color: ICE2 }}>{ensName} · </span> : null}{short} · {profile.chain.toUpperCase()}
          </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ background: "rgba(153,69,255,0.1)", color: ICE2, fontSize: "0.58rem", padding: "0.2rem 0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{profile.chain.toUpperCase()}</span>
              <span style={{ background: `${riskColor}18`, color: riskColor, fontSize: "0.58rem", padding: "0.2rem 0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{profile.risk_level} RISK</span>
            </div>
          </div>
          <div style={{ textAlign: "center", minWidth: 80 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "3rem", color: ICE, lineHeight: 1 }}>{profile.score}</div>
            <ScoreChart history={history} />
            <div style={{ color: MUTED, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "0.25rem" }}>Score</div>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, background: BORDER, border: `1px solid ${BORDER}`, marginBottom: "1rem" }}>
          {[
            ["WIN RATE", `${profile.win_rate_pct}%`, `vs 38% avg`, profile.win_rate_pct > 60 ? "#4ade80" : TEXT],
            ["AVG HOLD", formatHoldTime(profile.avg_hold_days), "per position", TEXT],
            ["TOTAL TRADES", profile.total_trades.toLocaleString(), "on-chain", TEXT],
            ["RISK LEVEL", profile.risk_level, "portfolio", riskColor],
          ].map(([label, val, sub, color]) => (
            <div key={label as string} style={{ background: BG, padding: "1.25rem" }}>
              <div style={{ color: MUTED, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>{label}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.4rem", color: color as string, marginBottom: "0.2rem" }}>{val}</div>
              <div style={{ color: MUTED2, fontSize: "0.6rem" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Radar + Traits */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ background: BG2, border: `1px solid ${BORDER}`, padding: "1.5rem" }}>
            <div style={{ color: ICE, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>// Behaviour Radar</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <canvas ref={canvasRef} width={220} height={220} />
            </div>
          </div>
          <div style={{ background: BG2, border: `1px solid ${BORDER}`, padding: "1.5rem" }}>
            <div style={{ color: ICE, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>// Trait Breakdown</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {Object.entries(profile.traits).map(([name, pct]) => (
                <div key={name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", marginBottom: "0.35rem" }}>
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
        <div style={{ background: BG2, border: `1px solid ${BORDER}`, borderLeft: `2px solid ${ICE}`, padding: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ color: ICE, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.85rem" }}>// AI Forecast Narrative</div>
          <p style={{ fontSize: "0.82rem", lineHeight: 1.9, color: TEXT }}
            dangerouslySetInnerHTML={{ __html: profile.narrative.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${ICE2}">$1</strong>`).replace(/\n/g, "<br/>") }}
          />
        </div>

        {/* Predictions */}
        <div style={{ background: `rgba(96,165,250,0.03)`, border: `1px solid rgba(96,165,250,0.18)`, padding: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ color: ICE, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>// Next-Move Predictions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {profile.predictions.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "1rem", background: "rgba(0,0,0,0.3)", border: `1px solid ${BORDER}`, padding: "1rem" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: ICE, minWidth: 48, flexShrink: 0 }}>{p.probability}%</div>
                <div style={{ fontSize: "0.75rem", lineHeight: 1.7, color: MUTED }}
                  dangerouslySetInnerHTML={{ __html: p.text.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${TEXT}">$1</strong>`) }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* vs Average */}
        <div style={{ background: BG2, border: `1px solid ${BORDER}`, padding: "1.5rem", marginBottom: "1rem" }}>
          <div style={{ color: ICE, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>// vs. Average Wallet</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {Object.entries(profile.vs_average).map(([key, { you, avg }]) => {
              const label = key.replace(/_/g, " ").toUpperCase()
              const max = Math.max(Number(you), Number(avg), 1)
              return (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", marginBottom: "0.4rem" }}>
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
        <div style={{ background: "rgba(153,69,255,0.06)", border: `1px solid ${BORDER2}`, padding: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.25rem" }}>Share your Wintercast</div>
            <div style={{ color: MUTED, fontSize: "0.7rem" }}>{profile.archetype_icon} {profile.archetype} · Score {profile.score} · wintercast.io</div>
          </div>
          <button onClick={handleShare}
            style={{ background: copied ? "#4ade80" : ICE, color: BG, border: "none", fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 700, padding: "0.75rem 1.5rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", transition: "background 0.3s", whiteSpace: "nowrap" }}>
            {copied ? "Copied ✓" : "Copy Share Link"}
          </button>
        </div>

      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } @media (max-width: 500px) { nav { padding: 1rem !important; } }`}</style>
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
