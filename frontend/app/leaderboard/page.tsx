"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const ICE = "#60a5fa"
const BG = "#050810"
const BG2 = "rgba(96,165,250,0.04)"
const BORDER = "rgba(96,165,250,0.12)"
const TEXT = "#e2eaf7"
const MUTED = "rgba(226,234,247,0.4)"
const API_URL = "https://wintercast-production.up.railway.app"

const MEDALS = ["🥇","🥈","🥉"]

export default function LeaderboardPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/leaderboard`)
      .then(r=>r.json())
      .then(d=>{ setData(d); setLoading(false) })
      .catch(()=>setLoading(false))
  }, [])

  const short = (addr: string) => `${addr.slice(0,8)}...${addr.slice(-6)}`
  const riskColor = (r: string) => r==="HIGH"?"#f87171":r==="MEDIUM"?ICE:"#4ade80"

  return (
    <main style={{ background:BG,minHeight:"100vh",color:TEXT,fontFamily:"var(--font-mono)" }}>
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 120% 60% at 50% -10%, rgba(96,165,250,0.07) 0%, transparent 70%)" }} />
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 1.5rem",background:"rgba(5,8,16,0.95)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${BORDER}` }}>
        <button onClick={()=>router.push("/")} style={{ background:"none",border:"none",color:MUTED,fontFamily:"var(--font-mono)",fontSize:"0.72rem",cursor:"pointer",letterSpacing:"0.08em" }}>← winter<span style={{ color:ICE }}>cast</span></button>
        <div style={{ color:MUTED,fontSize:"0.68rem",letterSpacing:"0.1em" }}>LEADERBOARD</div>
        <div style={{ width:80 }} />
      </nav>

      <div style={{ maxWidth:900,margin:"0 auto",padding:"5rem 1.5rem 4rem",position:"relative",zIndex:1 }}>
        <div style={{ color:ICE,fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem" }}>// Leaderboard</div>
        <h1 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(2rem,4vw,3rem)",letterSpacing:"-0.02em",marginBottom:"0.5rem" }}>Top wallets.</h1>
        <p style={{ color:MUTED,fontSize:"0.8rem",marginBottom:"3rem" }}>
          {data?.total_analysed ? `${data.total_analysed} wallets analysed today. Top ${data.leaderboard?.length || 0} ranked by Wintercast score.` : "Recently analysed wallets ranked by score."}
        </p>

        {loading ? (
          <div style={{ color:ICE,fontSize:"0.72rem",letterSpacing:"0.15em",animation:"pulse 2s infinite" }}>LOADING LEADERBOARD...</div>
        ) : data?.leaderboard?.length > 0 ? (
          <div style={{ display:"flex",flexDirection:"column",gap:1,background:BORDER,border:`1px solid ${BORDER}` }}>
            {/* Header */}
            <div style={{ background:"rgba(96,165,250,0.06)",padding:"0.75rem 1.25rem",display:"grid",gridTemplateColumns:"40px 1fr auto auto auto",gap:"1rem",alignItems:"center" }}>
              {["RANK","WALLET","CHAIN","RISK","SCORE"].map(h=>(
                <div key={h} style={{ color:MUTED,fontSize:"0.58rem",letterSpacing:"0.12em",textTransform:"uppercase" }}>{h}</div>
              ))}
            </div>
            {data.leaderboard.map((w: any, i: number)=>(
              <div key={w.address} onClick={()=>router.push(`/profile/${encodeURIComponent(w.address)}`)}
                style={{ background:i<3?"rgba(96,165,250,0.03)":BG,padding:"1rem 1.25rem",display:"grid",gridTemplateColumns:"40px 1fr auto auto auto",gap:"1rem",alignItems:"center",cursor:"pointer",transition:"background 0.2s" }}
                onMouseEnter={e=>(e.currentTarget.style.background="rgba(96,165,250,0.06)")}
                onMouseLeave={e=>(e.currentTarget.style.background=i<3?"rgba(96,165,250,0.03)":BG)}>
                <div style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1rem",color:i<3?"#f59e0b":MUTED }}>
                  {i<3?MEDALS[i]:`#${i+1}`}
                </div>
                <div>
                  <div style={{ display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.2rem" }}>
                    <span style={{ fontSize:"1rem" }}>{w.archetype_icon}</span>
                    <span style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.88rem" }}>{w.archetype}</span>
                  </div>
                  <div style={{ color:MUTED,fontSize:"0.62rem" }}>{short(w.address)}</div>
                </div>
                <div style={{ color:MUTED,fontSize:"0.65rem",textTransform:"uppercase" }}>{w.chain}</div>
                <div style={{ color:riskColor(w.risk_level),fontSize:"0.65rem",textTransform:"uppercase" }}>{w.risk_level}</div>
                <div style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.4rem",color:ICE }}>{w.score}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background:BG2,border:`1px solid ${BORDER}`,padding:"3rem",textAlign:"center" }}>
            <div style={{ fontSize:"2rem",marginBottom:"1rem" }}>🧊</div>
            <div style={{ color:MUTED,fontSize:"0.82rem",marginBottom:"1.5rem" }}>No wallets analysed yet today. Be the first!</div>
            <button onClick={()=>router.push("/")} style={{ background:ICE,color:BG,border:"none",fontFamily:"var(--font-mono)",fontSize:"0.72rem",fontWeight:700,padding:"0.75rem 1.5rem",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase" }}>
              Analyse a Wallet →
            </button>
          </div>
        )}
      </div>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </main>
  )
}
