"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const P = "#9945ff"
const BG = "#0a0520"
const BORDER = "rgba(153,69,255,0.15)"
const TEXT = "#f1f5f9"
const MUTED = "rgba(241,245,249,0.4)"
const API = "https://wintercast-production.up.railway.app"

const MEDALS = ["🥇","🥈","🥉"]
const TROPHIES = ["👑","⭐","🔥","💎","🎯","🧠","🐋","🚀"]

export default function HallPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/hall`)
      .then(r=>r.json())
      .then(d=>{ setData(d); setLoading(false) })
      .catch(()=>setLoading(false))
  }, [])

  const short = (a: string) => `${a.slice(0,8)}...${a.slice(-6)}`

  return (
    <main style={{background:BG,minHeight:"100vh",color:TEXT,fontFamily:"var(--font-mono)"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 80% 60% at 50% 10%, rgba(247,147,26,0.08) 0%, transparent 60%)"}}/>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 1.5rem",background:"rgba(10,5,32,0.9)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${BORDER}`}}>
        <button onClick={()=>router.push("/")} style={{background:"none",border:"none",color:MUTED,fontFamily:"var(--font-mono)",fontSize:"0.72rem",cursor:"pointer"}}>← winter<span style={{color:P}}>cast</span></button>
        <div style={{color:MUTED,fontSize:"0.68rem",letterSpacing:"0.1em"}}>🏛️ HALL OF FAME</div>
        <div style={{width:80}}/>
      </nav>

      <div style={{maxWidth:900,margin:"0 auto",padding:"5rem 1.5rem 4rem",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:"3rem"}}>
          <div style={{fontSize:"3rem",marginBottom:"1rem"}}>🏛️</div>
          <div style={{color:"#fb923c",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem"}}>// Hall of Fame</div>
          <h1 style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(2rem,5vw,3rem)",letterSpacing:"-0.02em",color:TEXT}}>Legendary wallets.</h1>
          <p style={{color:MUTED,fontSize:"0.8rem",marginTop:"0.75rem"}}>The most analysed, highest scored, and most interesting wallets on Wintercast.</p>
        </div>

        {loading ? (
          <div style={{color:P,fontSize:"0.72rem",letterSpacing:"0.15em",animation:"pulse 2s infinite",textAlign:"center"}}>LOADING LEGENDS...</div>
        ) : (
          <>
            {/* Daily wallet */}
            {data?.daily_wallet && (
              <div style={{background:"rgba(247,147,26,0.05)",border:"1px solid rgba(247,147,26,0.3)",borderTop:"2px solid #fb923c",padding:"2rem",borderRadius:6,marginBottom:"2rem",cursor:"pointer"}} onClick={()=>router.push(`/profile/${encodeURIComponent(data.daily_wallet.address)}`)}>
                <div style={{color:"#fb923c",fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.75rem"}}>🌟 Wallet of the Day</div>
                <div style={{display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap"}}>
                  <div style={{fontSize:"2.5rem"}}>{data.daily_wallet.archetype_icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.3rem",color:TEXT}}>{data.daily_wallet.archetype}</div>
                    <div style={{color:MUTED,fontSize:"0.68rem",marginTop:"0.25rem"}}>{short(data.daily_wallet.address)}</div>
                    <div style={{color:MUTED,fontSize:"0.72rem",marginTop:"0.5rem",lineHeight:1.6}}>{data.daily_wallet.reason}</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"2.5rem",color:"#fb923c"}}>{data.daily_wallet.score}</div>
                    <div style={{color:MUTED,fontSize:"0.58rem",letterSpacing:"0.1em"}}>SCORE</div>
                  </div>
                </div>
              </div>
            )}

            {/* Top wallets */}
            {data?.top_wallets?.length > 0 && (
              <div style={{marginBottom:"2rem"}}>
                <div style={{color:"#c084fc",fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1rem"}}>// Top Wallets This Week</div>
                <div style={{display:"flex",flexDirection:"column",gap:1,background:BORDER,border:`1px solid ${BORDER}`,borderRadius:6,overflow:"hidden"}}>
                  {data.top_wallets.map((w: any, i: number)=>(
                    <div key={w.address} onClick={()=>router.push(`/profile/${encodeURIComponent(w.address)}`)}
                      style={{background:BG,padding:"1rem 1.25rem",display:"flex",alignItems:"center",gap:"1rem",cursor:"pointer",flexWrap:"wrap"}}
                      onMouseEnter={e=>(e.currentTarget.style.background="rgba(153,69,255,0.08)")}
                      onMouseLeave={e=>(e.currentTarget.style.background=BG)}>
                      <div style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.2rem",minWidth:32}}>{i<3?MEDALS[i]:TROPHIES[i]||`#${i+1}`}</div>
                      <span style={{fontSize:"1.5rem"}}>{w.archetype_icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.9rem",color:TEXT}}>{w.archetype}</div>
                        <div style={{color:MUTED,fontSize:"0.62rem"}}>{short(w.address)} · {w.chain?.toUpperCase()}</div>
                      </div>
                      <div style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.5rem",color:P}}>{w.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!data?.top_wallets || data.top_wallets.length === 0) && (
              <div style={{background:"rgba(153,69,255,0.05)",border:`1px solid ${BORDER}`,padding:"3rem",textAlign:"center",borderRadius:6}}>
                <div style={{fontSize:"2rem",marginBottom:"1rem"}}>🏛️</div>
                <div style={{color:MUTED,fontSize:"0.82rem",marginBottom:"1.5rem"}}>The hall is empty. Be the first legend!</div>
                <button onClick={()=>router.push("/")} style={{background:"linear-gradient(135deg,#9945ff,#627eea)",color:"#fff",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.72rem",fontWeight:700,padding:"0.75rem 1.5rem",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",borderRadius:4}}>
                  Analyse a Wallet →
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </main>
  )
}
