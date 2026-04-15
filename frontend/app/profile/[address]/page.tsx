"use client"
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

export default function ProfilePage({ params }: { params: { address: string } }) {
  const address = decodeURIComponent(params.address)
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingText, setLoadingText] = useState("SCANNING ON-CHAIN BEHAVIOUR...")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const loadingSteps = [
    "SCANNING ON-CHAIN BEHAVIOUR...",
    "FETCHING TRANSACTION HISTORY...",
    "EXTRACTING 30+ SIGNALS...",
    "RUNNING AI ANALYSIS...",
    "GENERATING PROFILE...",
  ]

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % loadingSteps.length
      setLoadingText(loadingSteps[i])
    }, 800)

    analyseWallet(address)
      .then(data => {
        clearInterval(interval)
        if (data.success) setProfile(data.profile)
        else setError(data.error || "Analysis failed")
      })
      .catch(err => {
        clearInterval(interval)
        setError(err.message || "Could not connect to API")
      })
      .finally(() => setLoading(false))

    return () => clearInterval(interval)
  }, [address])

  useEffect(() => {
    if (profile && canvasRef.current) drawRadar(canvasRef.current, profile.traits)
  }, [profile])

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <div className="text-[#f0a500] text-xs tracking-[0.12em]">
        {address.slice(0, 8)}...{address.slice(-6)}
      </div>
      <div className="w-72 h-[2px] bg-white/10">
        <div className="h-full bg-[#f0a500] animate-[load_2s_ease_forwards]" />
      </div>
      <div className="text-[#7a7870] text-xs tracking-[0.12em]">{loadingText}</div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-red-400 text-sm">{error}</div>
      <button onClick={() => router.push("/")}
        className="text-[#7a7870] text-xs tracking-widest hover:text-[#f0a500] transition-colors">
        ← BACK TO SEARCH
      </button>
    </div>
  )

  if (!profile) return null

  const short = `${address.slice(0, 8)}...${address.slice(-6)}`
  const riskColor = profile.risk_level === "HIGH" ? "#ef4444" : profile.risk_level === "MEDIUM" ? "#f0a500" : "#22c55e"

  return (
    <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
      {/* Back */}
      <button onClick={() => router.push("/")}
        className="flex items-center gap-2 text-[#7a7870] text-xs tracking-widest hover:text-[#f0a500] transition-colors mb-10 bg-transparent border-none cursor-pointer font-mono">
        ← BACK TO SEARCH
      </button>

      {/* Header card */}
      <div className="flex flex-col md:flex-row md:items-start gap-6 bg-[#0d1117] border border-white/14 p-8 mb-3 relative">
        <div className="w-20 h-20 bg-[#f0a500]/10 border border-[#f0a500]/30 flex items-center justify-center text-3xl flex-shrink-0">
          {profile.archetype_icon}
        </div>
        <div className="flex-1">
          <div className="font-display font-extrabold text-3xl tracking-tight mb-1">{profile.archetype}</div>
          <div className="text-[#7a7870] text-xs tracking-widest font-mono mb-4">{short}</div>
          <div className="flex gap-2 flex-wrap">
            <div className="bg-[#111820] border border-white/14 text-[#7a7870] text-[10px] px-3 py-1 tracking-widest">
              {profile.chain.toUpperCase()}
            </div>
            <div className="bg-[#111820] border border-white/14 text-[10px] px-3 py-1 tracking-widest" style={{ color: riskColor }}>
              {profile.risk_level} RISK
            </div>
          </div>
        </div>
        <div className="text-center md:absolute md:top-8 md:right-8">
          <div className="font-display font-extrabold text-5xl text-[#f0a500] leading-none">{profile.score}</div>
          <div className="text-[#7a7870] text-[10px] tracking-[0.12em] mt-1">WALLET SCORE</div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/7 border border-white/7 mb-3">
        {[
          ["WIN RATE",    `${profile.win_rate_pct}%`,     "top 4% of wallets",   profile.win_rate_pct > 60 ? "#22c55e" : "#e8e6e0"],
          ["AVG HOLD",    `${profile.avg_hold_days}d`,    "patient trader",      "#e8e6e0"],
          ["TOTAL TRADES",`${profile.total_trades.toLocaleString()}`, "lifetime",  "#e8e6e0"],
          ["RISK LEVEL",  profile.risk_level,             "portfolio analysis",  riskColor],
        ].map(([label, val, sub, color]) => (
          <div key={label} className="bg-[#0d1117] p-6">
            <div className="text-[#7a7870] text-[10px] tracking-widest mb-2">{label}</div>
            <div className="font-display font-bold text-2xl mb-1" style={{ color: color as string }}>{val}</div>
            <div className="text-[#7a7870] text-[10px]">{sub}</div>
          </div>
        ))}
      </div>

      {/* Radar + Traits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="bg-[#0d1117] border border-white/7 p-6">
          <div className="text-[#f0a500] text-[10px] tracking-widest mb-5">// BEHAVIOUR RADAR</div>
          <div className="flex justify-center">
            <canvas ref={canvasRef} width={220} height={220} />
          </div>
        </div>
        <div className="bg-[#0d1117] border border-white/7 p-6">
          <div className="text-[#f0a500] text-[10px] tracking-widest mb-5">// TRAIT BREAKDOWN</div>
          <div className="flex flex-col gap-4">
            {Object.entries(profile.traits).map(([name, pct]) => (
              <div key={name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#7a7870] tracking-widest">{name}</span>
                  <span className="text-[#e8e6e0]">{pct}%</span>
                </div>
                <div className="h-[3px] bg-white/10">
                  <div className="h-full bg-[#f0a500] transition-all duration-1000" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Narrative */}
      <div className="bg-[#0d1117] border border-white/7 border-l-2 border-l-[#f0a500] p-7 mb-3">
        <div className="text-[#f0a500] text-[10px] tracking-widest mb-4">// AI-GENERATED PROFILE NARRATIVE</div>
        <p className="text-sm leading-8 text-[#e8e6e0]"
          dangerouslySetInnerHTML={{ __html: profile.narrative.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#ffbe3d]">$1</strong>') }}
        />
      </div>

      {/* Predictions */}
      <div className="bg-[#0d1117] border border-[#f0a500]/20 p-7 mb-3">
        <div className="text-[#f0a500] text-[10px] tracking-widest mb-5">// NEXT-MOVE PREDICTIONS (AI)</div>
        <div className="flex flex-col gap-3">
          {profile.predictions.map((p, i) => (
            <div key={i} className="flex items-start gap-4 bg-black/20 border border-white/7 p-4">
              <div className="font-display font-extrabold text-xl text-[#f0a500] min-w-[52px] flex-shrink-0">
                {p.probability}%
              </div>
              <div className="text-xs leading-7 text-[#7a7870]"
                dangerouslySetInnerHTML={{ __html: p.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#e8e6e0]">$1</strong>') }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* vs Average */}
      <div className="bg-[#0d1117] border border-white/7 p-6 mb-3">
        <div className="text-[#f0a500] text-[10px] tracking-widest mb-5">// VS. AVERAGE WALLET</div>
        <div className="flex flex-col gap-5">
          {Object.entries(profile.vs_average).map(([key, { you, avg }]) => {
            const label = key.replace(/_/g, " ").toUpperCase()
            const youPct = Math.min((you / Math.max(you, avg) * 100), 100)
            const avgPct = Math.min((avg / Math.max(you, avg) * 100), 100)
            return (
              <div key={key}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[#7a7870] tracking-widest">{label}</span>
                  <span>
                    <span className="text-[#f0a500]">{you}{typeof you === "number" && you < 10 ? "" : "%"}</span>
                    <span className="text-[#4a4840]"> vs </span>
                    <span className="text-[#7a7870]">{avg} avg</span>
                  </span>
                </div>
                <div className="h-[3px] bg-white/10 relative">
                  <div className="absolute h-full bg-white/20" style={{ width: `${avgPct}%` }} />
                  <div className="absolute h-full bg-[#f0a500]/70" style={{ width: `${youPct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Share */}
      <div className="bg-[#080b0f] border border-white/14 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-display font-bold mb-1">Share your WalletDNA</div>
          <div className="text-[#7a7870] text-xs">
            {profile.archetype_icon} {profile.archetype} · Score {profile.score} · Win Rate {profile.win_rate_pct}% — generated by WalletDNA
          </div>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          className="bg-[#f0a500] text-black font-mono text-xs font-bold px-6 py-3 tracking-widest hover:opacity-85 transition-opacity whitespace-nowrap"
        >
          COPY SHARE LINK
        </button>
      </div>
    </main>
  )
}

function drawRadar(canvas: HTMLCanvasElement, traits: Record<string, number>) {
  const ctx = canvas.getContext("2d")!
  const W = canvas.width, H = canvas.height
  const cx = W / 2, cy = H / 2, R = 80
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
    ctx.strokeStyle = "rgba(255,255,255,0.06)"
    ctx.lineWidth = 1
    ctx.stroke()
  }

  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2 - Math.PI / 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle))
    ctx.strokeStyle = "rgba(255,255,255,0.06)"
    ctx.stroke()
    ctx.fillStyle = "#7a7870"
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
  ctx.fillStyle = "rgba(240,165,0,0.15)"
  ctx.fill()
  ctx.strokeStyle = "#f0a500"
  ctx.lineWidth = 1.5
  ctx.stroke()

  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2 - Math.PI / 2
    const x = cx + R * values[i] * Math.cos(angle)
    const y = cy + R * values[i] * Math.sin(angle)
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fillStyle = "#f0a500"
    ctx.fill()
  }
}
