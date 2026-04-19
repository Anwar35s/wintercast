"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const ARCHETYPES = [
  { icon: "🐋", name: "The Whale", desc: "Massive holdings, slow deliberate moves.", badge: "TOP 0.1%" },
  { icon: "🤖", name: "The Bot", desc: "Millisecond timing, high-frequency patterns.", badge: "MEV SUSPECTED" },
  { icon: "🎰", name: "The Degen", desc: "Meme coins, leverage, high loss rate.", badge: "HIGH RISK" },
  { icon: "🧠", name: "Smart Money", desc: "Consistently profitable, early entries.", badge: "ALPHA SIGNAL" },
  { icon: "💎", name: "Diamond Hands", desc: "Buys and rarely sells. Long hold times.", badge: "LONG TERM" },
  { icon: "🎯", name: "The Sniper", desc: "Gets in early on new launches.", badge: "LAUNCH EXPERT" },
  { icon: "🔄", name: "The Flipper", desc: "Short hold times, high volume.", badge: "MOMENTUM" },
  { icon: "🐟", name: "Retail Follower", desc: "Buys tops, follows trends late.", badge: "COMMON" },
]
const DEMO = [
  { address: "0x28C6c06298d514Db089934071355E5743bf21d60", label: "Binance" },
  { address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", label: "vitalik.eth" },
  { address: "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8", label: "Binance Cold" },
]
const API = "https://wintercast-production.up.railway.app"
const CC: Record<string,string> = { eth:"#627eea",base:"#0052ff",bsc:"#f0b90b",solana:"#9945ff",polygon:"#8247e5",arbitrum:"#28a0f0" }
const NAV = [["/whales","Whales"],["/token","Tokens"],["/track","Track"],["/gas","Gas"],["/leaderboard","Board"],["/copy","Copy"],["/market","📊 Market"],["/compare","Compare"],["/pricing","Pricing"]]
const STATS = [["2.4M+","Wallets","rgba(153,69,255,0.2)","rgba(153,69,255,0.4)","#c084fc"],["30+","Signals","rgba(98,126,234,0.2)","rgba(98,126,234,0.4)","#818cf8"],["8","Archetypes","rgba(247,147,26,0.2)","rgba(247,147,26,0.4)","#fb923c"],["6","Chains","rgba(40,160,240,0.2)","rgba(40,160,240,0.4)","#9945ff"]]

export default function Home() {
  const [addr, setAddr] = useState("")
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState<any[]>([])
  const [whales, setWhales] = useState<any[]>([])
  const [menu, setMenu] = useState(false)
  const [gas, setGas] = useState<any>(null)
  const [pp, setPP] = useState<{total_usd:number,tokens:number}|null>(null)
  const router = useRouter()
  useEffect(()=>{
    fetch(`${API}/api/recent`).then(r=>r.json()).then(d=>setRecent(d.recent||[])).catch(()=>{})
    fetch(`${API}/api/whales`).then(r=>r.json()).then(d=>setWhales((d.moves||[]).slice(0,4))).catch(()=>{})
  },[])
  const go = () => { if(!addr.trim())return; setLoading(true); router.push(`/profile/${encodeURIComponent(addr.trim())}`) }
  const fmt = (n:number) => n>=1e6?`$${(n/1e6).toFixed(1)}M`:n>=1000?`$${(n/1000).toFixed(0)}K`:`$${n.toFixed(0)}`
  const short = (a:string) => `${a.slice(0,6)}...${a.slice(-4)}`
  return (
    <main style={{background:"#0a0520",minHeight:"100vh",color:"#f1f5f9",fontFamily:"var(--font-mono)"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 80% 60% at 20% 20%, rgba(153,69,255,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(98,126,234,0.1) 0%, transparent 50%)"}}/>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:50,background:"rgba(10,5,32,0.9)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(153,69,255,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 1.5rem"}}>
          <a href="/" style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.1rem",textDecoration:"none",color:"#f1f5f9"}}>winter<span style={{color:"#9945ff"}}>cast</span></a>
          <div className="desktop-only" style={{display:"flex",gap:"1.25rem"}}>
            {NAV.map(([h,l])=><a key={h} href={h} style={{color:"rgba(241,245,249,0.4)",textDecoration:"none",fontSize:"0.68rem",letterSpacing:"0.08em",textTransform:"uppercase"}} onMouseEnter={e=>(e.currentTarget.style.color="#c084fc")} onMouseLeave={e=>(e.currentTarget.style.color="rgba(241,245,249,0.4)")}>{l}</a>)}
          </div>
          <div style={{display:"flex",gap:"0.75rem",alignItems:"center"}}>
            <button onClick={go} className="desktop-only" style={{background:"linear-gradient(135deg,#9945ff,#627eea)",color:"#fff",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.68rem",fontWeight:700,padding:"0.45rem 1rem",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",borderRadius:4}}>Analyse →</button>
            <button onClick={()=>setMenu(!menu)} className="mobile-only" style={{background:"rgba(153,69,255,0.15)",border:"1px solid rgba(153,69,255,0.3)",color:"#c084fc",width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:4,fontSize:"0.9rem"}}>{menu?"✕":"☰"}</button>
          </div>
        </div>
        {menu&&<div style={{borderTop:"1px solid rgba(153,69,255,0.15)",padding:"1rem 1.5rem",display:"flex",flexDirection:"column",gap:"0.75rem",background:"rgba(10,5,32,0.95)"}}>
          <div style={{position:"relative"}}>
            <input value={addr} onChange={e=>setAddr(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){go();setMenu(false)}}} placeholder="Paste wallet address..." style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(153,69,255,0.3)",color:"#f1f5f9",fontFamily:"var(--font-mono)",fontSize:"0.78rem",padding:"0.75rem 90px 0.75rem 1rem",outline:"none",boxSizing:"border-box",borderRadius:4}}/>
            <button onClick={()=>{go();setMenu(false)}} style={{position:"absolute",right:0,top:0,bottom:0,background:"linear-gradient(135deg,#9945ff,#627eea)",color:"#fff",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.68rem",fontWeight:700,padding:"0 1rem",cursor:"pointer",borderRadius:"0 4px 4px 0"}}>Go →</button>
          </div>
          {NAV.map(([h,l])=><a key={h} href={h} onClick={()=>setMenu(false)} style={{color:"rgba(241,245,249,0.5)",textDecoration:"none",fontSize:"0.82rem",padding:"0.6rem 0",borderBottom:"1px solid rgba(153,69,255,0.1)"}}>{l}</a>)}
        </div>}
      </nav>
      <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"5rem 1.25rem 3rem",position:"relative"}}>
        <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",width:"100%",maxWidth:600}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",background:"rgba(153,69,255,0.15)",border:"1px solid rgba(153,69,255,0.3)",color:"#c084fc",padding:"0.35rem 1rem",fontSize:"0.65rem",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"1.5rem",borderRadius:20}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#9945ff",display:"inline-block",animation:"pulse 2s infinite"}}/>Free during beta · EVM + Solana
          </div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(2.4rem,7vw,4.5rem)",fontWeight:800,lineHeight:1.02,letterSpacing:"-0.03em",marginBottom:"1.25rem",color:"#f1f5f9"}}>
            Every wallet<br/>tells a story.<br/><span style={{background:"linear-gradient(135deg,#9945ff,#627eea)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>We read it.</span>
          </h1>
          <p style={{color:"rgba(241,245,249,0.45)",fontSize:"clamp(0.78rem,2.5vw,0.88rem)",lineHeight:1.9,maxWidth:440,marginBottom:"2rem"}}>Paste any EVM or Solana address. Get archetype, score, AI narrative, and next-move predictions.</p>
          <div style={{position:"relative",width:"100%",maxWidth:560,marginBottom:"0.75rem"}}>
            <input value={addr} onChange={e=>setAddr(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="0x... or Solana address" style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(153,69,255,0.3)",color:"#f1f5f9",fontFamily:"var(--font-mono)",fontSize:"clamp(0.72rem,2vw,0.8rem)",padding:"1rem 120px 1rem 1.25rem",outline:"none",boxSizing:"border-box",borderRadius:6,backdropFilter:"blur(10px)"}}/>
            <button onClick={go} disabled={loading} style={{position:"absolute",right:0,top:0,bottom:0,background:"linear-gradient(135deg,#9945ff,#627eea)",color:"#fff",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.68rem",fontWeight:700,padding:"0 1.25rem",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",borderRadius:"0 6px 6px 0"}}>{loading?"...":"Analyse →"}</button>
          </div>
          <p style={{color:"rgba(241,245,249,0.25)",fontSize:"0.65rem",letterSpacing:"0.06em",marginBottom:"0.75rem"}}>
            Try:{" "}{DEMO.map((w,i)=><span key={w.address}><span style={{color:"rgba(192,132,252,0.7)",cursor:"pointer",textDecoration:"underline",textUnderlineOffset:3}} onClick={()=>setAddr(w.address)}>{w.label}</span>{i<DEMO.length-1&&<span style={{color:"rgba(241,245,249,0.2)"}}> · </span>}</span>)}
          </p>
          {gas && (
            <div style={{display:"flex",gap:"1.5rem",flexWrap:"wrap",justifyContent:"center",background:"rgba(153,69,255,0.06)",border:"1px solid rgba(153,69,255,0.15)",padding:"0.75rem 1.5rem",borderRadius:8,fontSize:"0.7rem",marginTop:"0.5rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",display:"inline-block",animation:"pulse 2s infinite"}}/>
                <span style={{color:"rgba(241,245,249,0.4)"}}>ETH Gas:</span>
                <span style={{color:"#4ade80",fontWeight:700}}>{gas.eth?.standard||"—"} Gwei</span>
              </div>
              <div><span style={{color:"rgba(241,245,249,0.4)"}}>ETH: </span><span style={{color:"#627eea",fontWeight:700}}>${gas.eth_price?.toLocaleString()||"—"}</span></div>
              <div><span style={{color:"rgba(241,245,249,0.4)"}}>SOL: </span><span style={{color:"#9945ff",fontWeight:700}}>${gas.sol_price?.toLocaleString()||"—"}</span></div>
              <div><span style={{color:"rgba(241,245,249,0.4)"}}>TPS: </span><span style={{color:"#c084fc",fontWeight:700}}>{gas.solana?.tps?.toLocaleString()||"—"}</span></div>
              <a href="/gas" style={{color:"rgba(241,245,249,0.3)",textDecoration:"none",fontSize:"0.62rem"}}>Full Tracker →</a>
            </div>
          )}
          {pp&&<div style={{display:"flex",alignItems:"center",gap:"0.75rem",background:"rgba(153,69,255,0.1)",border:"1px solid rgba(153,69,255,0.25)",padding:"0.65rem 1rem",width:"100%",maxWidth:560,marginBottom:"0.5rem",borderRadius:6}}>
            <span>💼</span>
            <div style={{flex:1,fontSize:"0.7rem",color:"rgba(241,245,249,0.6)"}}>Portfolio: <span style={{color:"#f1f5f9",fontFamily:"var(--font-display)",fontWeight:700}}>${pp.total_usd.toLocaleString(undefined,{maximumFractionDigits:0})}</span> · <span style={{color:"#f1f5f9"}}>{pp.tokens} tokens</span></div>
            <a href={`/portfolio/${encodeURIComponent(addr)}`} style={{color:"#c084fc",fontSize:"0.62rem",textDecoration:"none",textTransform:"uppercase",whiteSpace:"nowrap"}}>X-Ray →</a>
          </div>}
          <div style={{display:"flex",gap:"0.75rem",marginTop:"2.5rem",paddingTop:"2rem",borderTop:"1px solid rgba(153,69,255,0.15)",flexWrap:"wrap",justifyContent:"center"}}>
            {STATS.map(([n,l,bg,border,c])=><div key={l} style={{textAlign:"center",background:bg,border:`1px solid ${border}`,padding:"0.5rem 0.75rem",borderRadius:6,minWidth:70}}>
              <div style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(1.2rem,3vw,1.5rem)",color:c}}>{n}</div>
              <div style={{color:"rgba(241,245,249,0.4)",fontSize:"0.58rem",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:2}}>{l}</div>
            </div>)}
          </div>
        </div>
      </section>
      {whales.length>0&&<section style={{maxWidth:1100,margin:"0 auto",padding:"2rem 1.25rem",position:"relative",zIndex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:"#4ade80",display:"inline-block",animation:"pulse 2s infinite"}}/>
            <span style={{color:"#c084fc",fontSize:"0.62rem",letterSpacing:"0.15em",textTransform:"uppercase"}}>Live Whale Moves</span>
          </div>
          <a href="/whales" style={{color:"#9945ff",fontSize:"0.65rem",textDecoration:"none",textTransform:"uppercase"}}>View all →</a>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:1,background:"rgba(153,69,255,0.08)",border:"1px solid rgba(153,69,255,0.12)",borderRadius:6,overflow:"hidden"}}>
          {whales.map((m,i)=><div key={m.hash||i} style={{background:"rgba(10,5,32,0.95)",padding:"0.9rem 1rem",display:"flex",alignItems:"center",gap:"0.75rem",cursor:"pointer",flexWrap:"wrap"}} onClick={()=>router.push(`/profile/${encodeURIComponent(m.from_address)}`)}>
            <div style={{background:`${CC[m.chain]||"#9945ff"}20`,color:CC[m.chain]||"#9945ff",fontSize:"0.55rem",padding:"0.15rem 0.45rem",flexShrink:0,borderRadius:3}}>{m.chain.toUpperCase()}</div>
            <div style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1rem",color:"#f1f5f9",minWidth:80,flexShrink:0}}>{fmt(m.value_usd)}</div>
            <div style={{flex:1,fontSize:"0.68rem",color:"rgba(241,245,249,0.5)",minWidth:120}}>
              <span style={{color:"#f1f5f9"}}>{m.from_label||`${m.from_address.slice(0,6)}...`}</span>
              <span style={{margin:"0 0.35rem"}}>→</span>
              <span style={{color:"#f1f5f9"}}>{m.to_label||`${m.to_address.slice(0,6)}...`}</span>
            </div>
          </div>)}
        </div>
      </section>}
      {recent.length>0&&<section style={{maxWidth:1100,margin:"0 auto",padding:"2rem 1.25rem",position:"relative",zIndex:1}}>
        <div style={{color:"#c084fc",fontSize:"0.62rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1rem"}}> Recently Analysed</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:1,background:"rgba(153,69,255,0.08)",border:"1px solid rgba(153,69,255,0.12)",borderRadius:6,overflow:"hidden"}}>
          {recent.slice(0,8).map((w:any)=><div key={w.address} onClick={()=>router.push(`/profile/${encodeURIComponent(w.address)}`)} style={{background:"rgba(10,5,32,0.95)",padding:"1rem",cursor:"pointer"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(153,69,255,0.08)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(10,5,32,0.95)")}>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.4rem"}}>
              <span style={{fontSize:"1.1rem"}}>{w.archetype_icon}</span>
              <div>
                <div style={{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.78rem",color:"#f1f5f9"}}>{w.archetype}</div>
                <div style={{color:"rgba(241,245,249,0.4)",fontSize:"0.58rem"}}>{short(w.address)}</div>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div style={{color:"rgba(241,245,249,0.4)",fontSize:"0.58rem"}}>{w.chain?.toUpperCase()}</div>
              <div style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.1rem",color:"#9945ff"}}>{w.score}</div>
            </div>
          </div>)}
        </div>
      </section>}
      <section id="archetypes" style={{maxWidth:1100,margin:"0 auto",padding:"4rem 1.25rem",position:"relative",zIndex:1}}>
        <div style={{color:"#c084fc",fontSize:"0.62rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem"}}> Archetypes</div>
        <h2 style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(1.6rem,4vw,2.5rem)",letterSpacing:"-0.02em",marginBottom:"2.5rem",color:"#f1f5f9"}}>Which type are you?</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:1,background:"rgba(153,69,255,0.08)",border:"1px solid rgba(153,69,255,0.12)",borderRadius:6,overflow:"hidden"}}>
          {ARCHETYPES.map(a=><div key={a.name} style={{background:"rgba(10,5,32,0.95)",padding:"1.5rem",cursor:"pointer",transition:"background 0.2s"}} onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(153,69,255,0.08)"} onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(10,5,32,0.95)"}>
            <div style={{fontSize:"1.4rem",marginBottom:"0.75rem"}}>{a.icon}</div>
            <div style={{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.9rem",marginBottom:"0.4rem",color:"#f1f5f9"}}>{a.name}</div>
            <div style={{color:"rgba(241,245,249,0.4)",fontSize:"0.7rem",lineHeight:1.6}}>{a.desc}</div>
            <div style={{display:"inline-block",marginTop:"0.75rem",background:"rgba(153,69,255,0.15)",color:"#c084fc",fontSize:"0.58rem",padding:"0.2rem 0.5rem",borderRadius:3}}>{a.badge}</div>
          </div>)}
        </div>
      </section>
      <section id="how-it-works" style={{maxWidth:1100,margin:"0 auto",padding:"4rem 1.25rem",position:"relative",zIndex:1}}>
        <div style={{color:"#c084fc",fontSize:"0.62rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem"}}> How it works</div>
        <h2 style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(1.6rem,4vw,2.5rem)",letterSpacing:"-0.02em",marginBottom:"2rem",color:"#f1f5f9"}}>From address to forecast</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:1,background:"rgba(153,69,255,0.08)",border:"1px solid rgba(153,69,255,0.12)",borderRadius:6,overflow:"hidden"}}>
          {[["01","Paste any address","EVM or Solana. Auto-detects chain across ETH, Base, Polygon, Arbitrum, BSC, Optimism + Solana."],["02","AI reads 30+ signals","Win rate, hold time, risk, DeFi activity, timing patterns — analysed in seconds."],["03","Get your forecast","Archetype, score, AI narrative, predictions and shareable card. Cold. Precise."]].map(([n,t,d])=><div key={n} style={{background:"rgba(10,5,32,0.95)",padding:"2rem 1.5rem"}}>
            <div style={{color:"#9945ff",fontSize:"0.62rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1rem"}}>Step {n}</div>
            <div style={{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1rem",marginBottom:"0.5rem",color:"#f1f5f9"}}>{t}</div>
            <div style={{color:"rgba(241,245,249,0.4)",fontSize:"0.72rem",lineHeight:1.7}}>{d}</div>
          </div>)}
        </div>
      </section>
      <section style={{maxWidth:1100,margin:"0 auto",padding:"0 1.25rem 5rem",position:"relative",zIndex:1}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"1rem"}}>
          {[["/compare","Compare","Who trades better?","Put two wallets head to head.","Compare →",true],["/whales","Whale Feed","Follow the big money.","Live moves. Updated every 60s.","View Whales →",false],["/track","Track","Never miss a move.","Email alerts when any wallet moves.","Track →",false]].map(([href,tag,title,desc,cta,primary])=><div key={href as string} style={{background:"rgba(153,69,255,0.05)",border:"1px solid rgba(153,69,255,0.2)",borderTop:"2px solid #9945ff",padding:"2rem",borderRadius:6}}>
            <div style={{color:"#c084fc",fontSize:"0.62rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem"}}>{tag}</div>
            <h3 style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.3rem",letterSpacing:"-0.02em",marginBottom:"0.75rem",color:"#f1f5f9"}}>{title}</h3>
            <p style={{color:"rgba(241,245,249,0.4)",fontSize:"0.75rem",lineHeight:1.7,marginBottom:"1.25rem"}}>{desc}</p>
            <a href={href as string} style={{display:"inline-block",background:primary?"linear-gradient(135deg,#9945ff,#627eea)":"transparent",color:"#fff",border:primary?"none":"1px solid rgba(153,69,255,0.4)",fontFamily:"var(--font-mono)",fontSize:"0.7rem",fontWeight:700,padding:"0.7rem 1.25rem",letterSpacing:"0.08em",textTransform:"uppercase",textDecoration:"none",borderRadius:4}}>{cta}</a>
          </div>)}
        </div>
      </section>
      <footer style={{maxWidth:1100,margin:"0 auto",padding:"2rem 1.25rem 3rem",borderTop:"1px solid rgba(153,69,255,0.15)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem",position:"relative",zIndex:1}}>
        <div style={{fontFamily:"var(--font-display)",fontWeight:800,color:"#f1f5f9"}}>winter<span style={{color:"#9945ff"}}>cast</span></div>
        <div style={{display:"flex",gap:"1.5rem",flexWrap:"wrap"}}>
          {[["/whales","Whales"],["/token","Tokens"],["/track","Track"],["/gas","Gas"],["/leaderboard","Board"],["/copy","Copy"],["/market","📊 Market"],["/compare","Compare"],["/pricing","Pricing"],["mailto:hello@wintercast.io","Contact"]].map(([h,l])=><a key={l} href={h} style={{color:"rgba(241,245,249,0.3)",fontSize:"0.65rem",letterSpacing:"0.08em",textDecoration:"none"}}>{l}</a>)}
        </div>
        <div style={{color:"rgba(241,245,249,0.2)",fontSize:"0.62rem"}}>© 2026 Wintercast</div>
      </footer>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}.desktop-only{display:flex!important}.mobile-only{display:none!important}@media(max-width:768px){.desktop-only{display:none!important}.mobile-only{display:flex!important}}`}</style>
    </main>
  )
}
// Sun 19 Apr 2026 13:57:27 BST
