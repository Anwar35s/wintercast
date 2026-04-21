"use client"
import AnimatedLayout from "@/app/components/AnimatedLayout"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const ICE = "#9945ff"
const BG = "#0a0520"
const BG2 = "rgba(153,69,255,0.04)"
const BORDER = "rgba(153,69,255,0.12)"
const TEXT = "#e2eaf7"
const MUTED = "rgba(241,245,249,0.4)"
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://wintercast-production.up.railway.app"

const CHAIN_COLORS: Record<string, string> = {
  eth: "#627eea",
  base: "#0052ff",
  bsc: "#f0b90b",
  polygon: "#8247e5",
  solana: "#9945ff",
  arbitrum: "#28a0f0",
}

const CHAIN_NAMES: Record<string, string> = {
  eth: "ETH", base: "BASE", bsc: "BSC",
  polygon: "MATIC", solana: "SOL", arbitrum: "ARB",
}

interface WhaleMove {
  hash: string
  chain: string
  from_address: string
  to_address: string
  from_label: string | null
  to_label: string | null
  value_usd: number
  value_native: number
  native_symbol: string
  timestamp: string
}

function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

function shortAddr(addr: string): string {
  if (!addr) return "Unknown"
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function timeAgo(timestamp: string): string {
  if (!timestamp) return "just now"
  try {
    const ts = isNaN(Number(timestamp)) 
      ? new Date(timestamp).getTime() 
      : Number(timestamp) * 1000
    const diff = Date.now() - ts
    if (diff < 60000) return `${Math.floor(diff/1000)}s ago`
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`
    return `${Math.floor(diff/86400000)}d ago`
  } catch { return "recently" }
}

export default function WhalesPage() {
  const router = useRouter()
  const [moves, setMoves] = useState<WhaleMove[]>([])
  const [loading, setLoading] = useState(true)
  const [nextRefresh, setNextRefresh] = useState(60)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [stats, setStats] = useState<any>(null)

  const fetchWhales = async () => {
    try {
      const r = await fetch(`${API_URL}/api/whales`)
      const data = await r.json()
      setMoves(data.moves || [])
      setNextRefresh(data.next_refresh || 60)
      setLastUpdate(new Date())
    } catch { }
    setLoading(false)
  }

  const fetchStats = async () => {
    try {
      const r = await fetch(`${API_URL}/api/whales/stats`)
      setStats(await r.json())
    } catch { }
  }

  useEffect(() => {
    fetchWhales()
    fetchStats()
    const interval = setInterval(() => {
      fetchWhales()
      fetchStats()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (nextRefresh <= 0) return
    const t = setInterval(() => setNextRefresh(n => Math.max(0, n - 1)), 1000)
    return () => clearInterval(t)
  }, [nextRefresh])

  const shareOnX = (move: WhaleMove) => {
    const text = `🐋 ${formatUSD(move.value_usd)} just moved on ${CHAIN_NAMES[move.chain] || move.chain}\n\nFrom: ${move.from_label || shortAddr(move.from_address)}\nTo: ${move.to_label || shortAddr(move.to_address)}\n\nSee their Wintercast profile 👇\nwintercast.io/profile/${move.from_address}\n\n#crypto #onchain #wintercast`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank")
  }

  return (
    <AnimatedLayout>
    <main style={{ background: "rgba(0,0,0,0.85)", minHeight: "100vh", color: TEXT, fontFamily: "var(--font-mono)" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 120% 60% at 50% -10%, rgba(153,69,255,0.06) 0%, transparent 70%)" }} />

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 2rem", background: "rgba(0,0,0,0.92)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${BORDER}` }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: MUTED, fontFamily: "var(--font-mono)", fontSize: "0.72rem", cursor: "pointer", letterSpacing: "0.08em" }}>← winter<span style={{ color: ICE }}>cast</span></button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "pulse 2s infinite" }} />
          <span style={{ color: MUTED, fontSize: "0.68rem", letterSpacing: "0.1em" }}>LIVE WHALE FEED</span>
        </div>
        <div style={{ color: MUTED, fontSize: "0.65rem", letterSpacing: "0.08em" }}>
          Refreshes in {nextRefresh}s
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "5rem 1.5rem 4rem", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ color: ICE, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>// Whale Feed</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
            Follow the big money.
          </h1>
          <p style={{ color: MUTED, fontSize: "0.8rem" }}>Real-time moves over $100K across ETH, Base, BSC and Solana.</p>
        </div>

        {/* Stats bar */}
        {stats && stats.move_count > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: BORDER, border: `1px solid ${BORDER}`, marginBottom: "1.5rem" }}>
            {[
              ["TOTAL VOLUME", formatUSD(stats.total_volume_usd)],
              ["MOVES TRACKED", stats.move_count],
              ["LARGEST MOVE", formatUSD(stats.largest_move_usd)],
            ].map(([l, v]) => (
              <div key={l} style={{ background: BG, padding: "1rem 1.25rem" }}>
                <div style={{ color: MUTED, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.25rem" }}>{l}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.3rem", color: ICE }}>{v}</div>
              </div>
            ))}
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ background: BG2, border: `1px solid ${BORDER}`, padding: "1.25rem", height: 80, animation: "pulse 2s infinite" }} />
            ))}
          </div>
        ) : moves.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: MUTED }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌊</div>
            <div style={{ fontSize: "0.85rem" }}>No whale moves detected yet. Check back shortly.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: BORDER, border: `1px solid ${BORDER}` }}>
            {moves.map((move, i) => (
              <div key={move.hash || i} style={{ background: BG, padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(153,69,255,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = BG)}>

                {/* Chain badge */}
                <div style={{ background: `${CHAIN_COLORS[move.chain] || ICE}20`, color: CHAIN_COLORS[move.chain] || ICE, border: `1px solid ${CHAIN_COLORS[move.chain] || ICE}40`, fontSize: "0.6rem", padding: "0.2rem 0.6rem", letterSpacing: "0.1em", flexShrink: 0 }}>
                  {CHAIN_NAMES[move.chain] || move.chain.toUpperCase()}
                </div>

                {/* Amount */}
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.3rem", color: TEXT, minWidth: 100, flexShrink: 0 }}>
                  {formatUSD(move.value_usd)}
                </div>

                {/* From → To */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: "0.72rem", color: MUTED, marginBottom: "0.2rem" }}>
                    <span style={{ color: TEXT, cursor: "pointer" }}
                      onClick={() => router.push(`/profile/${encodeURIComponent(move.from_address)}`)}>
                      {move.from_label || shortAddr(move.from_address)}
                    </span>
                    <span style={{ color: MUTED, margin: "0 0.5rem" }}>→</span>
                    <span style={{ color: TEXT, cursor: "pointer" }}
                      onClick={() => router.push(`/profile/${encodeURIComponent(move.to_address)}`)}>
                      {move.to_label || shortAddr(move.to_address)}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.62rem", color: MUTED }}>
                    {move.value_native} {move.native_symbol} · {timeAgo(move.timestamp)}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <button onClick={() => router.push(`/profile/${encodeURIComponent(move.from_address)}`)}
                    style={{ background: BG2, border: `1px solid ${BORDER}`, color: ICE, fontFamily: "var(--font-mono)", fontSize: "0.62rem", padding: "0.4rem 0.75rem", cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Profile
                  </button>
                  <button onClick={() => shareOnX(move)}
                    style={{ background: "rgba(29,161,242,0.1)", border: "1px solid rgba(29,161,242,0.2)", color: "#1da1f2", fontFamily: "var(--font-mono)", fontSize: "0.62rem", padding: "0.4rem 0.75rem", cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {lastUpdate && (
          <div style={{ textAlign: "center", marginTop: "1.5rem", color: MUTED, fontSize: "0.65rem", letterSpacing: "0.08em" }}>
            Last updated: {lastUpdate.toLocaleTimeString()} · Auto-refreshes every 60s
          </div>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </main>
    </AnimatedLayout>
  )
}
