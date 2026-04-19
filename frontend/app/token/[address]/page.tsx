"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const ICE = "#9945ff"
const BG = "#0a0520"
const BG2 = "rgba(153,69,255,0.04)"
const BORDER = "rgba(153,69,255,0.12)"
const TEXT = "#e2eaf7"
const MUTED = "rgba(241,245,249,0.4)"
const API_URL = "https://wintercast-production.up.railway.app"

export default function TokenPage({ params }: { params: { address: string } }) {
  const address = decodeURIComponent(params.address)
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const short = `${address.slice(0,8)}...${address.slice(-6)}`

  useEffect(() => {
    fetch(`${API_URL}/api/token/${encodeURIComponent(address)}`)
      .then(r=>r.json())
      .then(d=>{ if(d.success) setData(d.token); else setError(d.error||"Failed"); setLoading(false) })
      .catch(()=>{ setError("Failed to load token data"); setLoading(false) })
  }, [address])

  const formatUSD = (n: number) => n>=1_000_000_000?`$${(n/1_000_000_000).toFixed(2)}B`:n>=1_000_000?`$${(n/1_000_000).toFixed(2)}M`:n>=1_000?`$${(n/1_000).toFixed(1)}K`:`$${n?.toFixed(2)||0}`

  if (loading) return (
    <div style={{ minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-mono)",color:ICE,fontSize:"0.72rem",letterSpacing:"0.15em",animation:"pulse 2s infinite" }}>
      ANALYSING TOKEN...
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  )

  return (
    <main style={{ background:BG,minHeight:"100vh",color:TEXT,fontFamily:"var(--font-mono)" }}>
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1.1rem 2rem",background:"rgba(10,5,32,0.9)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${BORDER}` }}>
        <button onClick={()=>router.push("/")} style={{ background:"none",border:"none",color:MUTED,fontFamily:"var(--font-mono)",fontSize:"0.72rem",cursor:"pointer",letterSpacing:"0.08em" }}>← winter<span style={{ color:ICE }}>cast</span></button>
        <div style={{ color:MUTED,fontSize:"0.68rem",letterSpacing:"0.1em" }}>TOKEN DEEP DIVE</div>
        <div style={{ color:MUTED,fontSize:"0.65rem" }}>{short}</div>
      </nav>

      <div style={{ maxWidth:900,margin:"0 auto",padding:"5rem 1.5rem 4rem" }}>
        {error ? (
          <div style={{ color:"#f87171",marginTop:"2rem" }}>{error}</div>
        ) : data ? (
          <>
            <div style={{ display:"flex",alignItems:"center",gap:"1.5rem",marginBottom:"2rem" }}>
              <div>
                <div style={{ color:ICE,fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.25rem" }}>// Token Analysis</div>
                <h1 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"2.5rem",letterSpacing:"-0.02em" }}>{data.symbol} <span style={{ color:MUTED,fontSize:"1rem",fontWeight:400 }}>{data.name}</span></h1>
              </div>
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:BORDER,border:`1px solid ${BORDER}`,marginBottom:"2rem" }}>
              {[
                ["PRICE",`$${data.price_usd?.toFixed(6)||0}`],
                ["MARKET CAP",formatUSD(data.market_cap||0)],
                ["24H VOLUME",formatUSD(data.volume_24h||0)],
                ["HOLDERS",data.holder_count?.toLocaleString()||"N/A"],
              ].map(([l,v])=>(
                <div key={l} style={{ background:BG,padding:"1.25rem" }}>
                  <div style={{ color:MUTED,fontSize:"0.58rem",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"0.25rem" }}>{l}</div>
                  <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.2rem",color:ICE }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Risk score */}
            <div style={{ background:BG2,border:`1px solid ${BORDER}`,padding:"1.5rem",marginBottom:"1.5rem" }}>
              <div style={{ color:ICE,fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1rem" }}>// Risk Assessment</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1rem" }}>
                {[
                  ["Liquidity Risk", data.liquidity_risk||"MEDIUM", data.liquidity_risk==="HIGH"?"#f87171":data.liquidity_risk==="LOW"?"#4ade80":ICE],
                  ["Concentration", data.concentration_risk||"MEDIUM", data.concentration_risk==="HIGH"?"#f87171":data.concentration_risk==="LOW"?"#4ade80":ICE],
                  ["Age", data.age_days?`${data.age_days}d old`:"Unknown", MUTED],
                ].map(([l,v,c])=>(
                  <div key={l as string}>
                    <div style={{ color:MUTED,fontSize:"0.6rem",letterSpacing:"0.08em",marginBottom:"0.25rem" }}>{l}</div>
                    <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1rem",color:c as string }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top holders */}
            {data.top_holders?.length > 0 && (
              <div>
                <div style={{ color:ICE,fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1rem" }}>// Top Holders</div>
                <div style={{ display:"flex",flexDirection:"column",gap:1,background:BORDER,border:`1px solid ${BORDER}` }}>
                  {data.top_holders.slice(0,10).map((h: any,i: number)=>(
                    <div key={i} style={{ background:BG,padding:"0.85rem 1.25rem",display:"flex",alignItems:"center",gap:"1rem",cursor:"pointer",transition:"background 0.2s" }}
                      onClick={()=>router.push(`/profile/${encodeURIComponent(h.address)}`)}
                      onMouseEnter={e=>(e.currentTarget.style.background="rgba(153,69,255,0.04)")}
                      onMouseLeave={e=>(e.currentTarget.style.background=BG)}>
                      <div style={{ color:MUTED,fontSize:"0.65rem",minWidth:24 }}>#{i+1}</div>
                      <div style={{ flex:1,fontSize:"0.75rem",color:TEXT,fontFamily:"var(--font-mono)" }}>
                        {h.address.slice(0,8)}...{h.address.slice(-6)}
                      </div>
                      <div style={{ width:120,height:3,background:BORDER }}>
                        <div style={{ height:"100%",background:ICE,width:`${h.percentage}%` }} />
                      </div>
                      <div style={{ color:TEXT,fontSize:"0.75rem",minWidth:50,textAlign:"right" }}>{h.percentage?.toFixed(2)}%</div>
                      <div style={{ color:ICE,fontSize:"0.62rem",letterSpacing:"0.06em",textTransform:"uppercase" }}>Profile →</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </main>
  )
}
