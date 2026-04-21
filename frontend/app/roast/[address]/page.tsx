"use client"
import AnimatedLayout from "@/app/components/AnimatedLayout"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const P = "#9945ff"
const BG = "#0a0520"
const BORDER = "rgba(153,69,255,0.15)"
const TEXT = "#f1f5f9"
const MUTED = "rgba(241,245,249,0.4)"
const API = "https://wintercast-production.up.railway.app"

export default function RoastPage({ params }: { params: { address: string } }) {
  const address = decodeURIComponent(params.address)
  const router = useRouter()
  const [roast, setRoast] = useState<string>("")
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const short = `${address.slice(0,8)}...${address.slice(-6)}`

  useEffect(() => {
    fetch(`${API}/api/roast/${encodeURIComponent(address)}`)
      .then(r=>r.json())
      .then(d=>{ if(d.success){ setRoast(d.roast); setProfile(d.profile) } setLoading(false) })
      .catch(()=>setLoading(false))
  }, [address])

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.href}\n\n"${roast.slice(0,100)}..." 🔥 Get your wallet roasted at wintercast.io`)
    setCopied(true)
    setTimeout(()=>setCopied(false), 2000)
  }

  return (
    <AnimatedLayout>
    <main style={{background:"rgba(0,0,0,0.85)",minHeight:"100vh",color:TEXT,fontFamily:"var(--font-mono)"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 80% 60% at 50% 20%, rgba(248,113,113,0.08) 0%, transparent 60%)"}}/>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 1.5rem",background:"rgba(0,0,0,0.92)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${BORDER}`}}>
        <button onClick={()=>router.push(`/profile/${encodeURIComponent(address)}`)} style={{background:"none",border:"none",color:MUTED,fontFamily:"var(--font-mono)",fontSize:"0.72rem",cursor:"pointer"}}>← Profile</button>
        <div style={{color:MUTED,fontSize:"0.68rem",letterSpacing:"0.1em"}}>🔥 WALLET ROAST</div>
        <button onClick={()=>router.push("/")} style={{background:"none",border:"none",color:P,fontFamily:"var(--font-mono)",fontSize:"0.72rem",cursor:"pointer"}}>winter<span style={{color:P}}>cast</span></button>
      </nav>

      <div style={{maxWidth:700,margin:"0 auto",padding:"5rem 1.5rem 4rem",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{fontSize:"4rem",marginBottom:"1rem"}}>🔥</div>
          <div style={{color:"#f87171",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem"}}>// Wallet Roast</div>
          <h1 style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(1.8rem,4vw,2.5rem)",letterSpacing:"-0.02em",color:TEXT}}>
            {profile ? `${profile.archetype_icon} ${profile.archetype}` : short}
          </h1>
          <div style={{color:MUTED,fontSize:"0.72rem",marginTop:"0.5rem"}}>{short}</div>
        </div>

        {loading ? (
          <div style={{textAlign:"center",padding:"3rem"}}>
            <div style={{color:"#f87171",fontSize:"0.72rem",letterSpacing:"0.15em",animation:"pulse 2s infinite",marginBottom:"1rem"}}>🔥 READING YOUR TRADING SINS...</div>
            <div style={{color:MUTED,fontSize:"0.7rem"}}>Analysing 30+ signals of questionable decisions...</div>
          </div>
        ) : roast ? (
          <>
            <div style={{background:"rgba(248,113,113,0.05)",border:"1px solid rgba(248,113,113,0.2)",borderLeft:"3px solid #f87171",padding:"2rem",borderRadius:6,marginBottom:"1.5rem",position:"relative"}}>
              <div style={{fontSize:"3rem",position:"absolute",top:-20,left:20,opacity:0.3}}>"</div>
              <p style={{color:TEXT,fontSize:"clamp(0.9rem,2.5vw,1.05rem)",lineHeight:1.9,fontStyle:"italic"}}>{roast}</p>
              <div style={{fontSize:"3rem",position:"absolute",bottom:-20,right:20,opacity:0.3}}>"</div>
            </div>

            {profile && (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:1,background:BORDER,border:`1px solid ${BORDER}`,borderRadius:6,overflow:"hidden",marginBottom:"1.5rem"}}>
                {[
                  ["Score",profile.score,"#9945ff"],
                  ["Win Rate",`${profile.win_rate_pct}%`,profile.win_rate_pct>50?"#4ade80":"#f87171"],
                  ["Risk",profile.risk_level,profile.risk_level==="HIGH"?"#f87171":"#4ade80"],
                  ["Chain",profile.chain?.toUpperCase(),"#627eea"],
                ].map(([l,v,c])=>(
                  <div key={l as string} style={{background:BG,padding:"1rem",textAlign:"center"}}>
                    <div style={{color:MUTED,fontSize:"0.58rem",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.25rem"}}>{l}</div>
                    <div style={{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.2rem",color:c as string}}>{v}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{display:"flex",gap:"0.75rem",flexWrap:"wrap"}}>
              <button onClick={handleShare} style={{flex:1,background:"linear-gradient(135deg,#f87171,#ef4444)",color:"#fff",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.72rem",fontWeight:700,padding:"0.85rem 1.5rem",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",borderRadius:4}}>
                {copied?"Copied! 🔥":"Share Roast 🔥"}
              </button>
              <button onClick={()=>router.push(`/profile/${encodeURIComponent(address)}`)} style={{flex:1,background:"transparent",color:P,border:`1px solid rgba(153,69,255,0.4)`,fontFamily:"var(--font-mono)",fontSize:"0.72rem",fontWeight:700,padding:"0.85rem 1.5rem",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",borderRadius:4}}>
                Full Profile →
              </button>
            </div>

            <div style={{marginTop:"1.5rem",textAlign:"center"}}>
              <a href="/" style={{color:MUTED,fontSize:"0.68rem",textDecoration:"none",letterSpacing:"0.08em"}}>Roast another wallet →</a>
            </div>
          </>
        ) : (
          <div style={{textAlign:"center",color:"#f87171",padding:"2rem"}}>Failed to generate roast. Try again.</div>
        )}
      </div>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </main>
    </AnimatedLayout>
  )
}
