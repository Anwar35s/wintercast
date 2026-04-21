"use client"
import AnimatedLayout from "@/app/components/AnimatedLayout"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const ICE = "#9945ff"
const BG = "transparent"
const BG2 = "rgba(153,69,255,0.04)"
const BORDER = "rgba(153,69,255,0.12)"
const TEXT = "#e2eaf7"
const MUTED = "rgba(241,245,249,0.4)"
const API_URL = "https://wintercast-production.up.railway.app"

interface Token {
  symbol: string
  name: string
  balance: number
  usd_value: number
  price_usd: number
  chain: string
  logo?: string
  percent_of_portfolio: number
  token_address: string
}

interface Portfolio {
  address: string
  total_usd: number
  tokens: Token[]
  chain_breakdown: Record<string, number>
  top_holding_pct: number
}

function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n/1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n/1_000).toFixed(1)}K`
  return `$${n.toFixed(2)}`
}

const CHAIN_COLORS: Record<string,string> = {
  eth: "#627eea", base: "#0052ff", polygon: "#8247e5",
  arbitrum: "#28a0f0", bsc: "#f0b90b", optimism: "#ff0420"
}

export default function PortfolioPage({ params }: { params: { address: string } }) {
  const address = decodeURIComponent(params.address)
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const short = `${address.slice(0,8)}...${address.slice(-6)}`

  useEffect(() => {
    fetch(`${API_URL}/api/portfolio/${encodeURIComponent(address)}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setPortfolio(data.portfolio)
        else setError(data.error || "Failed to load portfolio")
        setLoading(false)
      })
      .catch(() => { setError("Failed to load portfolio"); setLoading(false) })
  }, [address])

  if (loading) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: ICE, fontSize: "0.72rem", letterSpacing: "0.15em", marginBottom: "1rem", animation: "pulse 2s infinite" }}>LOADING PORTFOLIO...</div>
        <div style={{ color: MUTED, fontSize: "0.65rem" }}>Fetching holdings across all chains</div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  )

  return (
    <AnimatedLayout>
    <main style={{ background: "rgba(0,0,0,0.85)", minHeight: "100vh", color: TEXT, fontFamily: "var(--font-mono)" }}>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 2rem", background: "rgba(0,0,0,0.92)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${BORDER}` }}>
        <button onClick={() => router.push(`/profile/${encodeURIComponent(address)}`)} style={{ background: "none", border: "none", color: MUTED, fontFamily: "var(--font-mono)", fontSize: "0.72rem", cursor: "pointer", letterSpacing: "0.08em" }}>← Profile</button>
        <div style={{ color: MUTED, fontSize: "0.68rem", letterSpacing: "0.1em" }}>PORTFOLIO X-RAY</div>
        <div style={{ color: MUTED, fontSize: "0.65rem" }}>{short}</div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "5rem 1.5rem 4rem" }}>
        <div style={{ color: ICE, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>// Portfolio X-Ray</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 2.5rem)", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>{short}</h1>

        {error ? (
          <div style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "2rem" }}>{error}</div>
        ) : portfolio ? (
          <>
            {/* Total value */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: BORDER, border: `1px solid ${BORDER}`, margin: "2rem 0" }}>
              {[
                ["TOTAL VALUE", formatUSD(portfolio.total_usd)],
                ["TOKENS HELD", portfolio.tokens.length.toString()],
                ["TOP HOLDING", `${portfolio.top_holding_pct.toFixed(1)}%`],
              ].map(([l,v]) => (
                <div key={l} style={{ background: BG, padding: "1.25rem" }}>
                  <div style={{ color: MUTED, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.25rem" }}>{l}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem", color: ICE }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Chain breakdown */}
            {Object.keys(portfolio.chain_breakdown).length > 1 && (
              <div style={{ marginBottom: "2rem" }}>
                <div style={{ color: ICE, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>// Chain Breakdown</div>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {Object.entries(portfolio.chain_breakdown).sort(([,a],[,b]) => b-a).map(([chain, usd]) => (
                    <div key={chain} style={{ background: BG2, border: `1px solid ${CHAIN_COLORS[chain] || ICE}30`, padding: "0.5rem 1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: CHAIN_COLORS[chain] || ICE }} />
                      <span style={{ color: CHAIN_COLORS[chain] || ICE, fontSize: "0.65rem", textTransform: "uppercase" }}>{chain}</span>
                      <span style={{ color: TEXT, fontSize: "0.72rem", fontFamily: "var(--font-display)", fontWeight: 700 }}>{formatUSD(usd as number)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Token list */}
            <div style={{ color: ICE, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>// Holdings</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: BORDER, border: `1px solid ${BORDER}` }}>
              {portfolio.tokens.map((token, i) => (
                <div key={token.token_address || i} style={{ background: BG, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(153,69,255,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.background = BG)}>
                  {/* Rank */}
                  <div style={{ color: MUTED, fontSize: "0.65rem", minWidth: 24, textAlign: "right" }}>#{i+1}</div>
                  {/* Token info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem" }}>{token.symbol}</span>
                      <span style={{ color: MUTED, fontSize: "0.65rem" }}>{token.name}</span>
                      <span style={{ background: `${CHAIN_COLORS[token.chain] || ICE}20`, color: CHAIN_COLORS[token.chain] || ICE, fontSize: "0.55rem", padding: "0.1rem 0.4rem", letterSpacing: "0.08em" }}>{token.chain.toUpperCase()}</span>
                    </div>
                    <div style={{ color: MUTED, fontSize: "0.65rem" }}>{token.balance.toLocaleString(undefined, {maximumFractionDigits: 4})} tokens @ {formatUSD(token.price_usd)}</div>
                  </div>
                  {/* Bar */}
                  <div style={{ width: 80, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <div style={{ height: 3, background: BORDER }}>
                      <div style={{ height: "100%", background: ICE, width: `${Math.min(token.percent_of_portfolio, 100)}%` }} />
                    </div>
                    <div style={{ color: MUTED, fontSize: "0.58rem", textAlign: "right" }}>{token.percent_of_portfolio.toFixed(1)}%</div>
                  </div>
                  {/* USD value */}
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: TEXT, minWidth: 80, textAlign: "right" }}>
                    {formatUSD(token.usd_value)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
              <button onClick={() => router.push(`/profile/${encodeURIComponent(address)}`)}
                style={{ background: BG2, border: `1px solid ${BORDER}`, color: ICE, fontFamily: "var(--font-mono)", fontSize: "0.72rem", padding: "0.75rem 1.5rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                ← Full Profile
              </button>
              <button onClick={() => router.push(`/compare`)}
                style={{ background: BG2, border: `1px solid ${BORDER}`, color: ICE, fontFamily: "var(--font-mono)", fontSize: "0.72rem", padding: "0.75rem 1.5rem", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Compare Wallets →
              </button>
            </div>
          </>
        ) : null}
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </main>
    </AnimatedLayout>
  )
}
