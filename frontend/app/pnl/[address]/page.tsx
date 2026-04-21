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
const API_URL = "https://wintercast-production.up.railway.app"

export default function PnLPage({ params }: { params: { address: string } }) {
  const address = decodeURIComponent(params.address)
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const short = `${address.slice(0,8)}...${address.slice(-6)}`

  useEffect(() => {
    fetch(`${API_URL}/api/pnl/${encodeURIComponent(address)}`)
      .then(r=>r.json())
      .then(d=>{ if(d.success) setData(d.pnl); else setError(d.error||"Failed"); setLoading(false) })
      .catch(()=>{ setError("Failed to load PnL data"); setLoading(false) })
  }, [address])

  const formatUSD = (n: number) => {
    const abs = Math.abs(n)
    const str = abs>=1_000_000?`$${(abs/1_000_000).toFixed(2)}M`:abs>=1_000?`$${(abs/1_000).toFixed(1)}K`:`$${abs.toFixed(2)}`
    return n < 0 ? `-${str}` : `+${str}`
  }

  if (loading) return (
    <div style={{ minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-mono)",color:ICE,fontSize:"0.72rem",letterSpacing:"0.15em",animation:"pulse 2s infinite" }}>
      LOADING PnL DATA...
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  )

  return (
    <AnimatedLayout>
    <main style={{ background:BG,minHeight:"100vh",color:TEXT,fontFamily:"var(--font-mono)" }}>
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 1.5rem",background:"rgba(0,0,0,0.95)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${BORDER}` }}>
        <button onClick={()=>router.push(`/profile/${encodeURIComponent(address)}`)} style={{ background:"none",border:"none",color:MUTED,fontFamily:"var(--font-mono)",fontSize:"0.72rem",cursor:"pointer",letterSpacing:"0.08em" }}>← Profile</button>
        <div style={{ color:MUTED,fontSize:"0.68rem",letterSpacing:"0.1em" }}>PnL HISTORY</div>
        <div style={{ color:MUTED,fontSize:"0.65rem" }}>{short}</div>
      </nav>

      <div style={{ maxWidth:900,margin:"0 auto",padding:"5rem 1.5rem 4rem" }}>
        <div style={{ color:ICE,fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem" }}>// Profit & Loss</div>
        <h1 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(1.8rem,4vw,2.5rem)",letterSpacing:"-0.02em",marginBottom:"2rem" }}>{short}</h1>

        {error ? (
          <div style={{ color:"#f87171" }}>{error}</div>
        ) : data ? (
          <>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:1,background:BORDER,border:`1px solid ${BORDER}`,marginBottom:"2rem" }}>
              {[
                ["TOTAL PnL", data.total_pnl_usd||0],
                ["WIN RATE", `${data.win_rate_pct||0}%`],
                ["TOTAL TRADES", data.total_trades||0],
                ["BEST TRADE", data.best_trade_usd||0],
              ].map(([l,v],i)=>(
                <div key={l} style={{ background:BG,padding:"1.25rem" }}>
                  <div style={{ color:MUTED,fontSize:"0.58rem",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"0.25rem" }}>{l}</div>
                  <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.3rem",
                    color: i===0?(typeof v==="number"&&v>=0?"#4ade80":"#f87171"):ICE }}>
                    {typeof v === "number" && (i===0||i===3) ? formatUSD(v) : v}
                  </div>
                </div>
              ))}
            </div>

            {data.tokens?.length > 0 && (
              <>
                <div style={{ color:ICE,fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1rem" }}>// Token Performance</div>
                <div style={{ display:"flex",flexDirection:"column",gap:1,background:BORDER,border:`1px solid ${BORDER}` }}>
                  {data.tokens.map((t: any, i: number)=>(
                    <div key={i} style={{ background:BG,padding:"1rem 1.25rem",display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap" }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.9rem",marginBottom:"0.2rem" }}>{t.symbol}</div>
                        <div style={{ color:MUTED,fontSize:"0.65rem" }}>{t.count_of_trades} trades · avg buy ${t.avg_buy_price_usd?.toFixed(4)||0}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.1rem",color:t.total_pnl_usd>=0?"#4ade80":"#f87171" }}>
                          {formatUSD(t.total_pnl_usd||0)}
                        </div>
                        <div style={{ color:MUTED,fontSize:"0.62rem" }}>{t.realized_profit_percentage?.toFixed(1)||0}% ROI</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : null}
      </div>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </main>
    </AnimatedLayout>
  )
}
