"use client"
import AnimatedLayout from "@/app/components/AnimatedLayout"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const P = "#9945ff"
const BG = "transparent"
const BG2 = "rgba(153,69,255,0.05)"
const BORDER = "rgba(153,69,255,0.15)"
const TEXT = "#f1f5f9"
const MUTED = "rgba(241,245,249,0.4)"
const API = "https://wintercast-production.up.railway.app"

export default function MarketPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/market`)
      .then(r=>r.json())
      .then(d=>{ setData(d); setLoading(false) })
      .catch(()=>setLoading(false))
    const i = setInterval(()=>fetch(`${API}/api/market`).then(r=>r.json()).then(setData).catch(()=>{}), 60000)
    return ()=>clearInterval(i)
  }, [])

  const getFGColor = (score: number) => {
    if (score >= 75) return "#4ade80"
    if (score >= 55) return "#86efac"
    if (score >= 45) return "#fbbf24"
    if (score >= 25) return "#f87171"
    return "#ef4444"
  }

  const getFGLabel = (score: number) => {
    if (score >= 75) return "Extreme Greed"
    if (score >= 55) return "Greed"
    if (score >= 45) return "Neutral"
    if (score >= 25) return "Fear"
    return "Extreme Fear"
  }

  return (
    <AnimatedLayout>
    <main style={{ background:"transparent",minHeight:"100vh",color:TEXT,fontFamily:"var(--font-mono)" }}>
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 80% 60% at 20% 20%, rgba(153,69,255,0.12) 0%, transparent 60%)" }}/>
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 1.5rem",background:"rgba(0,0,0,0.92)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${BORDER}` }}>
        <button onClick={()=>router.push("/")} style={{ background:"none",border:"none",color:MUTED,fontFamily:"var(--font-mono)",fontSize:"0.72rem",cursor:"pointer",letterSpacing:"0.08em" }}>← winter<span style={{ color:P }}>cast</span></button>
        <div style={{ display:"flex",alignItems:"center",gap:"0.5rem" }}>
          <span style={{ width:7,height:7,borderRadius:"50%",background:"#4ade80",display:"inline-block",animation:"pulse 2s infinite" }}/>
          <span style={{ color:MUTED,fontSize:"0.68rem",letterSpacing:"0.1em" }}>MARKET INTELLIGENCE</span>
        </div>
        <div style={{ width:80 }}/>
      </nav>

      <div style={{ maxWidth:1000,margin:"0 auto",padding:"5rem 1.5rem 4rem",position:"relative",zIndex:1 }}>
        <div style={{ color:"#c084fc",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem" }}>// Market Intelligence</div>
        <h1 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(2rem,4vw,3rem)",letterSpacing:"-0.02em",marginBottom:"3rem" }}>What is smart money doing?</h1>

        {loading ? (
          <div style={{ color:P,fontSize:"0.72rem",letterSpacing:"0.15em",animation:"pulse 2s infinite" }}>LOADING MARKET DATA...</div>
        ) : data ? (
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem" }}>

            {/* Fear & Greed */}
            <div style={{ background:BG2,border:`1px solid ${BORDER}`,borderTop:`2px solid ${P}`,padding:"2rem",borderRadius:6 }}>
              <div style={{ color:"#c084fc",fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1rem" }}>// Fear & Greed Index</div>
              <div style={{ textAlign:"center",padding:"1.5rem 0" }}>
                <div style={{ position:"relative",width:160,height:160,margin:"0 auto 1rem" }}>
                  <svg viewBox="0 0 160 160" style={{ width:"100%",height:"100%",transform:"rotate(-90deg)" }}>
                    <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(153,69,255,0.15)" strokeWidth="12"/>
                    <circle cx="80" cy="80" r="60" fill="none"
                      stroke={getFGColor(data.fear_greed?.score||50)}
                      strokeWidth="12"
                      strokeDasharray={`${(data.fear_greed?.score||50) / 100 * 376.99} 376.99`}
                      strokeLinecap="round"/>
                  </svg>
                  <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
                    <div style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"2.5rem",color:getFGColor(data.fear_greed?.score||50) }}>{data.fear_greed?.score||50}</div>
                    <div style={{ color:MUTED,fontSize:"0.6rem",letterSpacing:"0.08em",textTransform:"uppercase" }}>/ 100</div>
                  </div>
                </div>
                <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.3rem",color:getFGColor(data.fear_greed?.score||50),marginBottom:"0.5rem" }}>
                  {getFGLabel(data.fear_greed?.score||50)}
                </div>
                <div style={{ color:MUTED,fontSize:"0.72rem" }}>Based on whale movement patterns</div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem",marginTop:"1rem" }}>
                {[["Yesterday",data.fear_greed?.yesterday||48],["Last Week",data.fear_greed?.last_week||52]].map(([l,v])=>(
                  <div key={l as string} style={{ background:"rgba(153,69,255,0.08)",padding:"0.75rem",borderRadius:4,textAlign:"center" }}>
                    <div style={{ color:MUTED,fontSize:"0.58rem",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.25rem" }}>{l}</div>
                    <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.1rem",color:getFGColor(v as number) }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market stats */}
            <div style={{ display:"flex",flexDirection:"column",gap:"1rem" }}>
              {[
                ["ETH Price","$"+data.prices?.eth?.toLocaleString(),"#627eea"],
                ["SOL Price","$"+data.prices?.sol?.toLocaleString(),"#9945ff"],
                ["ETH Gas",`${data.gas?.standard||15} Gwei`,"#28a0f0"],
                ["Total Whale Vol",`$${((data.whale_volume||0)/1e6).toFixed(1)}M today`,"#c084fc"],
              ].map(([l,v,c])=>(
                <div key={l as string} style={{ background:BG2,border:`1px solid ${BORDER}`,padding:"1rem 1.25rem",borderRadius:6,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div style={{ color:MUTED,fontSize:"0.7rem",letterSpacing:"0.08em" }}>{l}</div>
                  <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.1rem",color:c as string }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Top tokens by smart money */}
            <div style={{ gridColumn:"1/-1",background:BG2,border:`1px solid ${BORDER}`,borderTop:`2px solid ${P}`,padding:"2rem",borderRadius:6 }}>
              <div style={{ color:"#c084fc",fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1.25rem" }}>// Top Tokens Smart Money Is Buying</div>
              {data.top_tokens?.length > 0 ? (
                <div style={{ display:"flex",flexDirection:"column",gap:1,background:`${BORDER}`,borderRadius:4,overflow:"hidden" }}>
                  {data.top_tokens.map((t: any, i: number)=>(
                    <div key={t.symbol||i} style={{ background:BG,padding:"1rem 1.25rem",display:"flex",alignItems:"center",gap:"1rem",cursor:"pointer" }}
                      onClick={()=>router.push(`/token/${t.address||""}`)}>
                      <div style={{ color:MUTED,fontSize:"0.65rem",minWidth:24 }}>#{i+1}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.95rem",color:TEXT }}>{t.symbol}</div>
                        <div style={{ color:MUTED,fontSize:"0.65rem" }}>{t.name}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ color:"#4ade80",fontSize:"0.78rem",fontWeight:700 }}>{t.buyers} smart wallets buying</div>
                        <div style={{ color:MUTED,fontSize:"0.62rem" }}>${t.volume?.toLocaleString()} volume</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color:MUTED,fontSize:"0.78rem",padding:"2rem",textAlign:"center" }}>
                  Analysing smart money flows... Check back soon.
                </div>
              )}
            </div>

            {/* Smart money alert */}
            <div style={{ gridColumn:"1/-1",background:"rgba(74,222,128,0.05)",border:"1px solid rgba(74,222,128,0.2)",padding:"1.25rem",borderRadius:6,display:"flex",alignItems:"center",gap:"1rem" }}>
              <span style={{ fontSize:"1.5rem" }}>🚨</span>
              <div style={{ flex:1 }}>
                <div style={{ color:"#4ade80",fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.25rem" }}>Smart Money Alert</div>
                <div style={{ color:TEXT,fontSize:"0.8rem" }}>{data.alert || "No significant alerts right now. Whales are quiet."}</div>
              </div>
              <a href="/whales" style={{ color:"#4ade80",fontSize:"0.65rem",letterSpacing:"0.08em",textDecoration:"none",textTransform:"uppercase",whiteSpace:"nowrap" }}>View Moves →</a>
            </div>

          </div>
        ) : (
          <div style={{ color:"#f87171",fontSize:"0.8rem" }}>Failed to load market data.</div>
        )}
      </div>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </main>
    </AnimatedLayout>
  )
}
