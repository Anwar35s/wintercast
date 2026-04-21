"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
const API = "https://wintercast-production.up.railway.app"
const CC: Record<string,string> = { eth:"#627eea",base:"#0052ff",bsc:"#f0b90b",solana:"#9945ff",polygon:"#8247e5",arbitrum:"#28a0f0" }
const NAV = [["/whales","Whales"],["/token","Tokens"],["/track","Track"],["/gas","Gas"],["/market","Market"],["/battle","Battle"],["/hall","Hall"],["/compare","Compare"],["/pricing","Pricing"]]
const FOOTER_LINKS = [["/whales","Whales"],["/token","Tokens"],["/track","Track"],["/gas","Gas"],["/market","Market"],["/battle","Battle"],["/hall","Hall"],["/compare","Compare"],["/pricing","Pricing"],["mailto:hello@wintercast.io","Contact"]]
const DEMO = [{address:"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",label:"vitalik.eth"},{address:"0x28C6c06298d514Db089934071355E5743bf21d60",label:"Binance"}]
export default function Home() {
  const [addr, setAddr] = useState("")
  const [loading, setLoading] = useState(false)
  const [whales, setWhales] = useState<any[]>([])
  const [gas, setGas] = useState<any>(null)
  const [recent, setRecent] = useState<any[]>([])
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeWhale, setActiveWhale] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()
  useEffect(() => {
    const fetchAll = () => {
      fetch(`${API}/api/whales`).then(r=>r.json()).then(d=>setWhales(d.moves||[])).catch(()=>{})
      fetch(`${API}/api/gas`).then(r=>r.json()).then(d=>{ if(d.success) setGas(d.gas) }).catch(()=>{})
      fetch(`${API}/api/recent`).then(r=>r.json()).then(d=>setRecent(d.recent||[])).catch(()=>{})
    }
    fetchAll()
    const fetchInterval = setInterval(fetchAll, 30000)
    const whaleInterval = setInterval(()=>setActiveWhale(n=>(n+1)%6), 3000)
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")!
      const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
      resize()
      window.addEventListener("resize", resize)
      const stars = Array.from({length:120}, ()=>({ x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight, r:Math.random()*1.2+0.2, alpha:Math.random()*0.5+0.1, speed:Math.random()*0.2+0.05 }))
      const orbs = Array.from({length:5}, (_,i)=>({ x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight, r:Math.random()*80+40, vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.4, hue:[270,240,260,280,200][i], alpha:Math.random()*0.04+0.02 }))
      let animId: number
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        orbs.forEach(o => {
          o.x+=o.vx; o.y+=o.vy
          if(o.x<-o.r)o.x=canvas.width+o.r; if(o.x>canvas.width+o.r)o.x=-o.r
          if(o.y<-o.r)o.y=canvas.height+o.r; if(o.y>canvas.height+o.r)o.y=-o.r
          const g=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r)
          g.addColorStop(0,`hsla(${o.hue},80%,60%,${o.alpha})`); g.addColorStop(1,`hsla(${o.hue},80%,60%,0)`)
          ctx.fillStyle=g; ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fill()
        })
        stars.forEach(s => {
          s.y-=s.speed; if(s.y<0){s.y=canvas.height;s.x=Math.random()*canvas.width}
          ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle=`rgba(200,180,255,${s.alpha})`; ctx.fill()
        })
        ctx.strokeStyle="rgba(153,69,255,0.03)"; ctx.lineWidth=1
        for(let x=0;x<canvas.width;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke()}
        for(let y=0;y<canvas.height;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke()}
        animId=requestAnimationFrame(draw)
      }
      draw()
      return ()=>{clearInterval(fetchInterval);clearInterval(whaleInterval);cancelAnimationFrame(animId);window.removeEventListener("scroll",onScroll);window.removeEventListener("resize",resize)}
    }
    return ()=>{clearInterval(fetchInterval);clearInterval(whaleInterval);window.removeEventListener("scroll",onScroll)}
  }, [])
  const go = () => { if(!addr.trim())return; setLoading(true); router.push(`/profile/${encodeURIComponent(addr.trim())}`) }
  const fmt = (n:number) => n>=1e9?`$${(n/1e9).toFixed(2)}B`:n>=1e6?`$${(n/1e6).toFixed(1)}M`:n>=1000?`$${(n/1000).toFixed(0)}K`:`$${n.toFixed(0)}`
  const short = (a:string) => `${a.slice(0,6)}...${a.slice(-4)}`
  return (
    <main style={{background:"#000",minHeight:"100vh",color:"#fff",fontFamily:"var(--font-mono)",overflowX:"hidden"}}>
      <canvas ref={canvasRef} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}/>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"radial-gradient(ellipse 100% 70% at 50% 0%, rgba(153,69,255,0.12) 0%, transparent 65%)"}}/>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:scrolled?"rgba(0,0,0,0.95)":"rgba(0,0,0,0.3)",backdropFilter:"blur(20px)",borderBottom:scrolled?"1px solid rgba(255,255,255,0.08)":"1px solid transparent",transition:"all 0.4s"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 1.5rem",height:64}}>
          <a href="/" style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.2rem",textDecoration:"none",color:"#fff",letterSpacing:"-0.04em"}}>winter<span style={{color:"#9945ff"}}>cast</span></a>
          <div className="desktop-only" style={{display:"flex",gap:"1.75rem",alignItems:"center"}}>
            {NAV.map(([h,l])=>(<a key={h} href={h} style={{color:"rgba(255,255,255,0.35)",textDecoration:"none",fontSize:"0.72rem",letterSpacing:"0.04em",transition:"color 0.2s"}} onMouseEnter={e=>(e.currentTarget.style.color="#fff")} onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.35)")}>{l}</a>))}
          </div>
          <div style={{display:"flex",gap:"0.75rem",alignItems:"center"}}>
            <button onClick={go} className="desktop-only" style={{background:"#9945ff",color:"#fff",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.72rem",fontWeight:700,padding:"0.5rem 1.25rem",cursor:"pointer",letterSpacing:"0.06em",borderRadius:6}} onMouseEnter={e=>(e.currentTarget.style.background="#7c3aed")} onMouseLeave={e=>(e.currentTarget.style.background="#9945ff")}>Analyse →</button>
            <button onClick={()=>setMenu(!menu)} className="mobile-only" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.6)",width:38,height:38,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6,fontSize:"1rem"}}>{menu?"✕":"☰"}</button>
          </div>
        </div>
        {menu&&(<div style={{borderTop:"1px solid rgba(255,255,255,0.06)",padding:"1rem 1.5rem",display:"flex",flexDirection:"column",gap:"0.75rem",background:"rgba(0,0,0,0.98)"}}>
          <div style={{position:"relative"}}><input value={addr} onChange={e=>setAddr(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){go();setMenu(false)}}} placeholder="Paste wallet address..." style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#fff",fontFamily:"var(--font-mono)",fontSize:"0.78rem",padding:"0.75rem 90px 0.75rem 1rem",outline:"none",boxSizing:"border-box",borderRadius:6}}/><button onClick={()=>{go();setMenu(false)}} style={{position:"absolute",right:0,top:0,bottom:0,background:"#9945ff",color:"#fff",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.68rem",fontWeight:700,padding:"0 1rem",cursor:"pointer",borderRadius:"0 6px 6px 0"}}>Go →</button></div>
          {NAV.map(([h,l])=>(<a key={h} href={h} onClick={()=>setMenu(false)} style={{color:"rgba(255,255,255,0.4)",textDecoration:"none",fontSize:"0.82rem",padding:"0.6rem 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{l}</a>))}
        </div>)}
      </nav>
      <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"5rem 1.5rem 2rem",position:"relative",zIndex:1}}>
        {whales.slice(0,3).map((m,i)=>(<div key={m.hash||i} style={{position:"absolute",top:`${20+i*22}%`,left:i%2===0?`${2+i*2}%`:"auto",right:i%2===1?"2%":"auto",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderLeft:`2px solid ${CC[m.chain]||"#9945ff"}`,padding:"10px 14px",borderRadius:"0 8px 8px 0",minWidth:180,animation:`floatCard${i} ${6+i*2}s ease-in-out infinite`,zIndex:0,pointerEvents:"none",display:"flex",flexDirection:"column",gap:4}} className="desktop-only"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{background:`${CC[m.chain]||"#9945ff"}20`,color:CC[m.chain]||"#9945ff",fontSize:"0.55rem",padding:"1px 6px",borderRadius:3}}>{m.chain.toUpperCase()}</span><span style={{fontWeight:800,fontSize:"0.9rem",color:"#fff"}}>{fmt(m.value_usd)}</span></div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)"}}>{m.from_label||short(m.from_address)} → {m.to_label||short(m.to_address)}</div></div>))}
        {gas&&(<div style={{position:"absolute",bottom:"25%",right:"3%",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderTop:"2px solid #4ade80",padding:"12px 16px",borderRadius:8,minWidth:160,animation:"floatGas 7s ease-in-out infinite",zIndex:0,pointerEvents:"none"}} className="desktop-only"><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><span style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",display:"inline-block"}}/><span style={{color:"#4ade80",fontSize:"0.6rem",letterSpacing:"0.1em"}}>LIVE GAS</span></div><div style={{display:"flex",flexDirection:"column",gap:4}}><div style={{display:"flex",justifyContent:"space-between",fontSize:"0.65rem"}}><span style={{color:"rgba(255,255,255,0.35)"}}>ETH</span><span style={{color:"#627eea",fontWeight:700}}>${gas.eth_price?.toLocaleString()}</span></div><div style={{display:"flex",justifyContent:"space-between",fontSize:"0.65rem"}}><span style={{color:"rgba(255,255,255,0.35)"}}>Gas</span><span style={{color:"#4ade80",fontWeight:700}}>{gas.eth?.standard} Gwei</span></div><div style={{display:"flex",justifyContent:"space-between",fontSize:"0.65rem"}}><span style={{color:"rgba(255,255,255,0.35)"}}>SOL</span><span style={{color:"#9945ff",fontWeight:700}}>${gas.sol_price?.toLocaleString()}</span></div></div></div>)}
        <div style={{position:"relative",zIndex:2,maxWidth:700}}>
          <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.35)",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"1.5rem"}}>ONCHAIN INTELLIGENCE</div>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(3rem,8vw,6.5rem)",fontWeight:800,lineHeight:0.95,letterSpacing:"-0.05em",marginBottom:"1.5rem"}}>
            <span style={{color:"#fff",display:"block"}}>THE COLD</span>
            <span style={{color:"#fff",display:"block"}}>TRUTH ABOUT</span>
            <span style={{background:"linear-gradient(90deg,#9945ff 0%,#627eea 40%,#27e9a4 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",display:"block",animation:"gradShift 4s ease-in-out infinite"}}>EVERY WALLET.</span>
          </h1>
          <p style={{color:"rgba(255,255,255,0.4)",fontSize:"clamp(0.85rem,2vw,1rem)",lineHeight:1.8,maxWidth:440,margin:"0 auto 2.5rem"}}>AI forensic profiling. 30+ onchain signals. Archetypes, predictions, roasts and battles.</p>
          <div style={{position:"relative",width:"100%",maxWidth:520,margin:"0 auto 1.25rem"}}>
            <input value={addr} onChange={e=>setAddr(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="0x... or Solana address" style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",fontFamily:"var(--font-mono)",fontSize:"0.85rem",padding:"1rem 140px 1rem 1.5rem",outline:"none",boxSizing:"border-box",borderRadius:8,backdropFilter:"blur(10px)",transition:"border-color 0.2s"}} onFocus={e=>(e.target.style.borderColor="rgba(153,69,255,0.6)")} onBlur={e=>(e.target.style.borderColor="rgba(255,255,255,0.12)")}/>
            <button onClick={go} disabled={loading} style={{position:"absolute",right:6,top:6,bottom:6,background:"#9945ff",color:"#fff",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.72rem",fontWeight:700,padding:"0 1.25rem",cursor:"pointer",letterSpacing:"0.08em",borderRadius:6}} onMouseEnter={e=>(e.currentTarget.style.background="#7c3aed")} onMouseLeave={e=>(e.currentTarget.style.background="#9945ff")}>{loading?"...":"ANALYSE →"}</button>
          </div>
          <p style={{color:"rgba(255,255,255,0.2)",fontSize:"0.68rem",marginBottom:"2.5rem"}}>Try:{" "}{DEMO.map((w,i)=>(<span key={w.address}><span style={{color:"rgba(167,139,250,0.7)",cursor:"pointer",textDecoration:"underline",textUnderlineOffset:3}} onClick={()=>setAddr(w.address)}>{w.label}</span>{i<DEMO.length-1&&<span style={{color:"rgba(255,255,255,0.15)"}}> · </span>}</span>))}</p>
          <div style={{display:"flex",gap:"0.75rem",justifyContent:"center",flexWrap:"wrap"}}>
            <a href="/whales" style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.6)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"var(--font-mono)",fontSize:"0.72rem",fontWeight:700,padding:"0.7rem 1.5rem",cursor:"pointer",letterSpacing:"0.06em",borderRadius:6,textDecoration:"none"}} onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.color="#fff"}} onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.color="rgba(255,255,255,0.6)"}}>View Whale Feed</a>
            <a href="/battle" style={{background:"rgba(153,69,255,0.1)",color:"#c084fc",border:"1px solid rgba(153,69,255,0.3)",fontFamily:"var(--font-mono)",fontSize:"0.72rem",fontWeight:700,padding:"0.7rem 1.5rem",cursor:"pointer",letterSpacing:"0.06em",borderRadius:6,textDecoration:"none"}}>Wallet Battle ⚔️</a>
          </div>
        </div>
        <div style={{position:"absolute",bottom:"2rem",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:6,animation:"bounce 2s ease-in-out infinite",zIndex:2}}>
          <span style={{color:"rgba(255,255,255,0.2)",fontSize:"0.6rem",letterSpacing:"0.15em"}}>SCROLL</span>
          <div style={{width:1,height:30,background:"linear-gradient(to bottom, rgba(153,69,255,0.5), transparent)"}}/>
        </div>
      </section>
      <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(10px)",overflow:"hidden",position:"relative",zIndex:1}}>
        <div style={{display:"flex",gap:0,animation:"ticker 20s linear infinite",width:"max-content"}}>
          {[...whales.slice(0,6),...whales.slice(0,6)].map((m,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 24px",borderRight:"1px solid rgba(255,255,255,0.05)",whiteSpace:"nowrap"}}><span style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",display:"inline-block"}}/><span style={{color:CC[m.chain]||"#9945ff",fontSize:"0.65rem",fontWeight:700}}>{m.chain.toUpperCase()}</span><span style={{color:"#fff",fontWeight:700,fontSize:"0.75rem"}}>{fmt(m.value_usd)}</span><span style={{color:"rgba(255,255,255,0.35)",fontSize:"0.65rem"}}>{m.from_label||short(m.from_address)} → {m.to_label||short(m.to_address)}</span></div>))}
        </div>
      </div>
      {whales.length>0&&(<section style={{maxWidth:1200,margin:"0 auto",padding:"5rem 1.5rem",position:"relative",zIndex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"2rem"}}>
          <div><div style={{color:"rgba(255,255,255,0.3)",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem"}}>Live Whale Moves</div><h2 style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(1.8rem,4vw,2.5rem)",color:"#fff",letterSpacing:"-0.03em",lineHeight:1}}>Follow the<br/>big money.</h2></div>
          <a href="/whales" style={{color:"rgba(255,255,255,0.35)",fontSize:"0.72rem",textDecoration:"none"}} onMouseEnter={e=>(e.currentTarget.style.color="#fff")} onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.35)")}>View all →</a>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"0.75rem"}}>
          {whales.slice(0,6).map((m,i)=>(<div key={m.hash||i} onClick={()=>router.push(`/profile/${encodeURIComponent(m.from_address)}`)} style={{background:activeWhale===i?"rgba(153,69,255,0.06)":"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderLeft:`3px solid ${CC[m.chain]||"#9945ff"}`,padding:"1.25rem",cursor:"pointer",borderRadius:"0 8px 8px 0",transition:"all 0.3s",transform:activeWhale===i?"translateY(-2px)":"none"}} onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.background="rgba(153,69,255,0.06)";(e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)"}} onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background=activeWhale===i?"rgba(153,69,255,0.06)":"rgba(255,255,255,0.02)";(e.currentTarget as HTMLDivElement).style.transform=activeWhale===i?"translateY(-2px)":"none"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.5rem"}}><span style={{background:`${CC[m.chain]||"#9945ff"}18`,color:CC[m.chain]||"#9945ff",fontSize:"0.58rem",padding:"0.2rem 0.6rem",borderRadius:3,letterSpacing:"0.1em",fontWeight:700}}>{m.chain.toUpperCase()}</span><span style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.2rem",color:"#fff"}}>{fmt(m.value_usd)}</span></div><div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.4)"}}><span style={{color:"#fff"}}>{m.from_label||short(m.from_address)}</span><span style={{margin:"0 0.4rem",color:"rgba(255,255,255,0.2)"}}>→</span><span style={{color:"#fff"}}>{m.to_label||short(m.to_address)}</span></div><div style={{marginTop:"0.4rem",fontSize:"0.6rem",color:"rgba(255,255,255,0.18)"}}>Click to analyse →</div></div>))}
        </div>
      </section>)}
      <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(0,0,0,0.3)",position:"relative",zIndex:1}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0}}>
          {[["500M+","Labelled Addresses"],["30+","Onchain Signals"],["8","Wallet Archetypes"],["6","Chains Supported"]].map(([n,l],i)=>(<div key={l} style={{padding:"2rem 1.5rem",textAlign:"center",borderRight:i<3?"1px solid rgba(255,255,255,0.05)":"none"}}><div style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(2rem,4vw,3rem)",color:"#fff",letterSpacing:"-0.04em",lineHeight:1}}>{n}</div><div style={{color:"rgba(255,255,255,0.25)",fontSize:"0.65rem",letterSpacing:"0.08em",textTransform:"uppercase",marginTop:6}}>{l}</div></div>))}
        </div>
      </div>
      {recent.length>0&&(<section style={{maxWidth:1200,margin:"0 auto",padding:"5rem 1.5rem",position:"relative",zIndex:1}}><div style={{color:"rgba(255,255,255,0.25)",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1rem"}}>Recently Analysed</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:"1px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:8,overflow:"hidden"}}>{recent.slice(0,8).map((w:any)=>(<div key={w.address} onClick={()=>router.push(`/profile/${encodeURIComponent(w.address)}`)} style={{background:"#000",padding:"1.25rem",cursor:"pointer",transition:"background 0.2s"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(153,69,255,0.05)")} onMouseLeave={e=>(e.currentTarget.style.background="#000")}><div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.5rem"}}><span style={{fontSize:"1.1rem"}}>{w.archetype_icon}</span><div><div style={{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.8rem",color:"#fff"}}>{w.archetype}</div><div style={{color:"rgba(255,255,255,0.25)",fontSize:"0.58rem"}}>{short(w.address)}</div></div></div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:CC[w.chain]||"#9945ff",fontSize:"0.6rem",textTransform:"uppercase"}}>{w.chain}</span><span style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.2rem",color:"#fff"}}>{w.score}</span></div></div>))}</div></section>)}
      <section style={{borderTop:"1px solid rgba(255,255,255,0.05)",padding:"8rem 1.5rem",position:"relative",zIndex:1,textAlign:"center"}}><div style={{maxWidth:560,margin:"0 auto"}}><h2 style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(2.5rem,6vw,4.5rem)",letterSpacing:"-0.04em",color:"#fff",marginBottom:"1.5rem",lineHeight:0.95}}>Start reading<br/>wallets today.</h2><p style={{color:"rgba(255,255,255,0.35)",fontSize:"0.95rem",lineHeight:1.8,marginBottom:"2.5rem"}}>Free during beta. No signup required.</p><button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{background:"#9945ff",color:"#fff",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.85rem",fontWeight:700,padding:"1rem 2.5rem",cursor:"pointer",letterSpacing:"0.08em",borderRadius:8}} onMouseEnter={e=>(e.currentTarget.style.background="#7c3aed")} onMouseLeave={e=>(e.currentTarget.style.background="#9945ff")}>ANALYSE A WALLET →</button></div></section>
      <footer style={{borderTop:"1px solid rgba(255,255,255,0.05)",padding:"2.5rem 1.5rem 3rem",position:"relative",zIndex:1}}><div style={{maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1.5rem"}}><div style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.2rem",color:"#fff",letterSpacing:"-0.03em"}}>winter<span style={{color:"#9945ff"}}>cast</span></div><div style={{display:"flex",gap:"1.5rem",flexWrap:"wrap"}}>{FOOTER_LINKS.map(([h,l])=>(<a key={l} href={h} style={{color:"rgba(255,255,255,0.2)",fontSize:"0.68rem",letterSpacing:"0.04em",textDecoration:"none"}} onMouseEnter={e=>(e.currentTarget.style.color="rgba(255,255,255,0.6)")} onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.2)")}>{l}</a>))}</div><div style={{color:"rgba(255,255,255,0.1)",fontSize:"0.62rem"}}>© 2026 Wintercast</div></div></footer>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}@keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(8px)}}@keyframes gradShift{0%,100%{filter:hue-rotate(0deg)}50%{filter:hue-rotate(20deg)}}@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}@keyframes floatCard0{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-12px) rotate(1deg)}}@keyframes floatCard1{0%,100%{transform:translateY(0) rotate(1deg)}50%{transform:translateY(-16px) rotate(-1deg)}}@keyframes floatCard2{0%,100%{transform:translateY(0) rotate(-0.5deg)}50%{transform:translateY(-10px) rotate(0.5deg)}}@keyframes floatGas{0%,100%{transform:translateY(0) rotate(0.5deg)}50%{transform:translateY(-14px) rotate(-0.5deg)}}.desktop-only{display:flex!important}.mobile-only{display:none!important}@media(max-width:768px){.desktop-only{display:none!important}.mobile-only{display:flex!important}}`}</style>
    </main>
  )
}
