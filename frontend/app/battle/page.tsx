"use client"
import AnimatedLayout from "@/app/components/AnimatedLayout"
import { useState } from "react"
import { useRouter } from "next/navigation"

const P = "#9945ff"
const BG = "#0a0520"
const BORDER = "rgba(153,69,255,0.15)"
const TEXT = "#f1f5f9"
const MUTED = "rgba(241,245,249,0.4)"
const API = "https://wintercast-production.up.railway.app"

export default function BattlePage() {
  const router = useRouter()
  const [addr1, setAddr1] = useState("")
  const [addr2, setAddr2] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const battle = async () => {
    if (!addr1.trim() || !addr2.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const r = await fetch(`${API}/api/battle`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({address1: addr1.trim(), address2: addr2.trim()})
      })
      const d = await r.json()
      if (d.success) setResult(d)
    } catch {}
    setLoading(false)
  }

  const share = () => {
    if (!result) return
    const text = `⚔️ Wallet Battle on wintercast.io\n\n${result.wallet1.archetype_icon} ${result.wallet1.archetype} (${result.wallet1.score}) vs ${result.wallet2.archetype_icon} ${result.wallet2.archetype} (${result.wallet2.score})\n\n🏆 Winner: ${result.winner.archetype_icon} ${result.winner.archetype}\n\n${result.verdict}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(()=>setCopied(false), 2000)
  }

  const DEMOS = [
    ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045","0x28C6c06298d514Db089934071355E5743bf21d60"],
  ]

  return (
    <AnimatedLayout>
    <main style={{background:BG,minHeight:"100vh",color:TEXT,fontFamily:"var(--font-mono)"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 60% 50% at 20% 50%, rgba(153,69,255,0.1) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(98,126,234,0.1) 0%, transparent 50%)"}}/>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 1.5rem",background:"rgba(0,0,0,0.92)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${BORDER}`}}>
        <button onClick={()=>router.push("/")} style={{background:"none",border:"none",color:MUTED,fontFamily:"var(--font-mono)",fontSize:"0.72rem",cursor:"pointer"}}>← winter<span style={{color:P}}>cast</span></button>
        <div style={{color:MUTED,fontSize:"0.68rem",letterSpacing:"0.1em"}}>⚔️ WALLET BATTLE</div>
        <div style={{width:80}}/>
      </nav>

      <div style={{maxWidth:800,margin:"0 auto",padding:"5rem 1.5rem 4rem",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:"3rem"}}>
          <div style={{fontSize:"3rem",marginBottom:"1rem"}}>⚔️</div>
          <div style={{color:"#c084fc",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem"}}>// Wallet Battle</div>
          <h1 style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(2rem,5vw,3rem)",letterSpacing:"-0.02em",color:TEXT}}>Who trades better?</h1>
          <p style={{color:MUTED,fontSize:"0.8rem",marginTop:"0.75rem"}}>Two wallets enter. One wins. AI decides.</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:"1rem",alignItems:"center",marginBottom:"1.5rem"}}>
          <div>
            <div style={{color:"#9945ff",fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem"}}>Fighter 1</div>
            <input value={addr1} onChange={e=>setAddr1(e.target.value)} placeholder="0x... or Solana"
              style={{width:"100%",background:"rgba(153,69,255,0.06)",border:"1px solid rgba(153,69,255,0.3)",color:TEXT,fontFamily:"var(--font-mono)",fontSize:"0.75rem",padding:"0.85rem 1rem",outline:"none",borderRadius:4,boxSizing:"border-box"}}/>
          </div>
          <div style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.5rem",color:"#c084fc",textAlign:"center",paddingTop:"1.5rem"}}>VS</div>
          <div>
            <div style={{color:"#627eea",fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem"}}>Fighter 2</div>
            <input value={addr2} onChange={e=>setAddr2(e.target.value)} placeholder="0x... or Solana"
              style={{width:"100%",background:"rgba(98,126,234,0.06)",border:"1px solid rgba(98,126,234,0.3)",color:TEXT,fontFamily:"var(--font-mono)",fontSize:"0.75rem",padding:"0.85rem 1rem",outline:"none",borderRadius:4,boxSizing:"border-box"}}/>
          </div>
        </div>

        <div style={{textAlign:"center",marginBottom:"0.75rem"}}>
          <span style={{color:MUTED,fontSize:"0.65rem"}}>Try: </span>
          <span style={{color:"rgba(192,132,252,0.7)",cursor:"pointer",fontSize:"0.65rem",textDecoration:"underline"}} onClick={()=>{setAddr1(DEMOS[0][0]);setAddr2(DEMOS[0][1])}}>vitalik.eth vs Binance</span>
        </div>

        <button onClick={battle} disabled={loading||!addr1.trim()||!addr2.trim()}
          style={{width:"100%",background:"linear-gradient(135deg,#9945ff,#627eea)",color:"#fff",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.8rem",fontWeight:700,padding:"1rem",cursor:"pointer",letterSpacing:"0.1em",textTransform:"uppercase",borderRadius:4,opacity:loading||!addr1.trim()||!addr2.trim()?0.6:1}}>
          {loading?"⚔️ ANALYSING BOTH WALLETS...":"⚔️ START BATTLE"}
        </button>

        {result && (
          <div style={{marginTop:"2rem"}}>
            {/* Fighter cards */}
            <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:"1rem",alignItems:"stretch",marginBottom:"1.5rem"}}>
              {[result.wallet1, result.wallet2].map((w,i)=>(
                <div key={i} style={{background:result.winner?.address===w.address?"rgba(74,222,128,0.05)":"rgba(0,0,0,0.95)",border:`1px solid ${result.winner?.address===w.address?"rgba(74,222,128,0.3)":BORDER}`,padding:"1.5rem",borderRadius:6,textAlign:"center",position:"relative"}}>
                  {result.winner?.address===w.address&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"#4ade80",color:"#050810",fontSize:"0.6rem",fontWeight:700,padding:"0.2rem 0.75rem",borderRadius:20,letterSpacing:"0.1em",whiteSpace:"nowrap"}}>🏆 WINNER</div>}
                  <div style={{fontSize:"2.5rem",marginBottom:"0.5rem"}}>{w.archetype_icon}</div>
                  <div style={{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1rem",color:TEXT,marginBottom:"0.25rem"}}>{w.archetype}</div>
                  <div style={{color:MUTED,fontSize:"0.62rem",marginBottom:"0.75rem"}}>{w.address.slice(0,8)}...{w.address.slice(-4)}</div>
                  <div style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"2rem",color:i===0?"#9945ff":"#627eea"}}>{w.score}</div>
                  <div style={{color:MUTED,fontSize:"0.58rem",letterSpacing:"0.1em"}}>SCORE</div>
                  <div style={{marginTop:"0.75rem",display:"flex",flexDirection:"column",gap:"0.3rem"}}>
                    {[["Win Rate",`${w.win_rate_pct}%`],["Risk",w.risk_level],["Chain",w.chain?.toUpperCase()]].map(([l,v])=>(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:"0.65rem"}}>
                        <span style={{color:MUTED}}>{l}</span>
                        <span style={{color:TEXT}}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"2rem",color:"#c084fc"}}>VS</div>
              </div>
            </div>

            {/* Verdict */}
            <div style={{background:"rgba(153,69,255,0.06)",border:"1px solid rgba(153,69,255,0.2)",borderLeft:"3px solid #9945ff",padding:"1.5rem",borderRadius:6,marginBottom:"1.5rem"}}>
              <div style={{color:"#c084fc",fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.75rem"}}>// AI Verdict</div>
              <p style={{color:TEXT,fontSize:"0.88rem",lineHeight:1.8}}>{result.verdict}</p>
            </div>

            <div style={{display:"flex",gap:"0.75rem"}}>
              <button onClick={share} style={{flex:1,background:"linear-gradient(135deg,#9945ff,#627eea)",color:"#fff",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.72rem",fontWeight:700,padding:"0.85rem",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",borderRadius:4}}>
                {copied?"Copied! ⚔️":"Share Battle ⚔️"}
              </button>
              <button onClick={()=>{setResult(null);setAddr1("");setAddr2("")}} style={{flex:1,background:"transparent",color:P,border:`1px solid rgba(153,69,255,0.4)`,fontFamily:"var(--font-mono)",fontSize:"0.72rem",fontWeight:700,padding:"0.85rem",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",borderRadius:4}}>
                New Battle →
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </main>
    </AnimatedLayout>
  )
}
