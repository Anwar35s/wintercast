"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const ARCHETYPES = [
  { icon: "🐋", name: "The Whale",       desc: "Massive holdings, slow deliberate moves, market-moving trades.", badge: "TOP 0.1%" },
  { icon: "🤖", name: "The Bot",         desc: "Millisecond timing, high-frequency patterns. Human? Unlikely.",  badge: "MEV SUSPECTED" },
  { icon: "🎰", name: "The Degen",       desc: "Meme coins, leverage, high loss rate. Lives for the thrill.",    badge: "HIGH RISK" },
  { icon: "🧠", name: "Smart Money",     desc: "Consistently profitable, early entries before pumps.",           badge: "ALPHA SIGNAL" },
  { icon: "💎", name: "Diamond Hands",   desc: "Buys and rarely sells. Long hold times, ignores volatility.",    badge: "LONG TERM" },
  { icon: "🎯", name: "The Sniper",      desc: "Gets in early on new launches. Fast flip, big ROI.",             badge: "LAUNCH EXPERT" },
  { icon: "🔄", name: "The Flipper",     desc: "Short hold times, high volume, trades narratives fast.",         badge: "MOMENTUM" },
  { icon: "🐟", name: "Retail Follower", desc: "Buys tops, small amounts, follows trends late.",                 badge: "COMMON" },
]

const DEMO_WALLETS = [
  { address: "0x28C6c06298d514Db089934071355E5743bf21d60", label: "Binance Hot Wallet" },
  { address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", label: "vitalik.eth" },
  { address: "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8", label: "Binance Cold" },
]

const API_URL = "https://wintercast-production.up.railway.app"
const CHAIN_COLORS: Record<string,string> = { eth:"#627eea",base:"#0052ff",bsc:"#f0b90b",solana:"#9945ff" }

export default function Home() {
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState<any[]>([])
  const [whales, setWhales] = useState<any[]>([])
  const [portfolioPreview, setPortfolioPreview] = useState<{total_usd:number,tokens:number}|null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch(`${API_URL}/api/recent`).then(r=>r.json()).then(d=>setRecent(d.recent||[])).catch(()=>{})
    fetch(`${API_URL}/api/whales`).then(r=>r.json()).then(d=>setWhales((d.moves||[]).slice(0,4))).catch(()=>{})
  }, [])

  const fetchPortfolioPreview = async (addr: string) => {
    if (!addr || addr.length < 10) { setPortfolioPreview(null); return }
    try {
      const r = await fetch(`${API_URL}/api/portfolio/${encodeURIComponent(addr)}`)
      const d = await r.json()
      if (d.success && d.portfolio.total_usd > 0) setPortfolioPreview({total_usd:d.portfolio.total_usd,tokens:d.portfolio.tokens.length})
      else setPortfolioPreview(null)
    } catch { setPortfolioPreview(null) }
  }

  const handleAnalyse = () => {
    const addr = address.trim()
    if (!addr) return
    setLoading(true)
    router.push(`/profile/${encodeURIComponent(addr)}`)
  }

  const short = (addr: string) => `${addr.slice(0,6)}...${addr.slice(-4)}`
  const formatUSD = (n: number) => n>=1_000_000?`$${(n/1_000_000).toFixed(1)}M`:n>=1_000?`$${(n/1_000).toFixed(0)}K`:`$${n.toFixed(0)}`

  return (
    <main style={{ background:"#050810",minHeight:"100vh",color:"#e2eaf7",fontFamily:"var(--font-mono)" }}>
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 120% 60% at 50% -10%, rgba(96,165,250,0.07) 0%, transparent 70%)" }} />

      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1.1rem 2rem",background:"rgba(5,8,16,0.85)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(96,165,250,0.1)" }}>
        <div style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.2rem",letterSpacing:"-0.02em" }}>winter<span style={{ color:"#60a5fa" }}>cast</span></div>
        <div style={{ display:"flex",gap:"1.5rem" }}>
          {[["/#archetypes","Archetypes"],["/#how-it-works","How it works"],["/whales","🐋 Whales"],["/compare","Compare"],["/pricing","Pricing"]].map(([href,label]) => (
            <a key={label} href={href} style={{ color:"rgba(226,234,247,0.4)",textDecoration:"none",fontSize:"0.72rem",letterSpacing:"0.08em",textTransform:"uppercase",transition:"color 0.2s" }}
              onMouseEnter={e=>(e.currentTarget.style.color="#60a5fa")}
              onMouseLeave={e=>(e.currentTarget.style.color="rgba(226,234,247,0.4)")}>
              {label}
            </a>
          ))}
        </div>
        <button onClick={handleAnalyse} style={{ background:"#60a5fa",color:"#050810",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.72rem",fontWeight:700,padding:"0.5rem 1.25rem",letterSpacing:"0.08em",cursor:"pointer",textTransform:"uppercase" }}>Analyse Wallet</button>
      </nav>

      <section style={{ minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"8rem 2rem 4rem",position:"relative" }}>
        <div style={{ position:"absolute",inset:0,zIndex:0,backgroundImage:"linear-gradient(rgba(96,165,250,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.04) 1px, transparent 1px)",backgroundSize:"50px 50px",maskImage:"radial-gradient(ellipse 80% 70% at 50% 50%, black 10%, transparent 100%)" }} />
        <div style={{ position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center" }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:"0.5rem",border:"1px solid rgba(96,165,250,0.25)",background:"rgba(96,165,250,0.08)",color:"#93c5fd",padding:"0.35rem 1rem",fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"2rem" }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:"#60a5fa",display:"inline-block",animation:"pulse 2s infinite" }} />
            Free during beta · EVM + Solana
          </div>
          <h1 style={{ fontFamily:"var(--font-display)",fontSize:"clamp(2.8rem, 7vw, 5.5rem)",fontWeight:800,lineHeight:1.02,letterSpacing:"-0.03em",marginBottom:"1.5rem" }}>
            Every wallet<br />tells a story.<br /><span style={{ color:"#60a5fa" }}>We read it.</span>
          </h1>
          <p style={{ color:"rgba(226,234,247,0.45)",fontSize:"0.88rem",lineHeight:1.9,maxWidth:480,marginBottom:"3rem" }}>
            Paste any EVM or Solana address. Wintercast analyses 30+ on-chain signals and delivers a complete behavioural forecast — archetype, score, AI narrative, and next-move predictions.
          </p>
          <div style={{ position:"relative",width:"100%",maxWidth:580,marginBottom:"0.75rem" }}>
            <input value={address} onChange={e=>{setAddress(e.target.value);if(e.target.value.length>10)fetchPortfolioPreview(e.target.value)}} onKeyDown={e=>e.key==="Enter"&&handleAnalyse()}
              placeholder="0x... or Solana address"
              style={{ width:"100%",background:"rgba(96,165,250,0.05)",border:"1px solid rgba(96,165,250,0.2)",color:"#e2eaf7",fontFamily:"var(--font-mono)",fontSize:"0.8rem",padding:"1.1rem 1.5rem",paddingRight:"140px",outline:"none",letterSpacing:"0.03em" }} />
            <button onClick={handleAnalyse} disabled={loading}
              style={{ position:"absolute",right:0,top:0,bottom:0,background:"#60a5fa",color:"#050810",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.72rem",fontWeight:700,padding:"0 1.5rem",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase" }}>
              {loading?"...":"Analyse →"}
            </button>
          </div>
          <p style={{ color:"rgba(226,234,247,0.25)",fontSize:"0.68rem",letterSpacing:"0.08em",marginBottom:"0.75rem" }}>
            Try:{" "}
            {DEMO_WALLETS.map((w,i)=>(
              <span key={w.address}>
                <span style={{ color:"rgba(96,165,250,0.7)",cursor:"pointer",textDecoration:"underline",textUnderlineOffset:3 }} onClick={()=>{setAddress(w.address);fetchPortfolioPreview(w.address)}}>{w.label}</span>
                {i<DEMO_WALLETS.length-1&&<span style={{ color:"rgba(226,234,247,0.2)" }}> · </span>}
              </span>
            ))}
          </p>
          {portfolioPreview && (
            <div style={{ display:"flex",alignItems:"center",gap:"1rem",background:"rgba(96,165,250,0.05)",border:"1px solid rgba(96,165,250,0.15)",padding:"0.75rem 1.25rem",maxWidth:580,width:"100%",marginBottom:"0.75rem" }}>
              <span style={{ fontSize:"1.1rem" }}>💼</span>
              <div style={{ flex:1,fontSize:"0.72rem",color:"rgba(226,234,247,0.6)" }}>
                Portfolio: <span style={{ color:"#e2eaf7",fontFamily:"var(--font-display)",fontWeight:700 }}>${portfolioPreview.total_usd.toLocaleString(undefined,{maximumFractionDigits:0})}</span> across <span style={{ color:"#e2eaf7" }}>{portfolioPreview.tokens} tokens</span>
              </div>
              <a href={`/portfolio/${encodeURIComponent(address)}`} style={{ color:"#60a5fa",fontSize:"0.65rem",letterSpacing:"0.08em",textDecoration:"none",textTransform:"uppercase",whiteSpace:"nowrap" }}>View X-Ray →</a>
            </div>
          )}
          <div style={{ display:"flex",gap:"3rem",marginTop:"2rem",paddingTop:"2rem",borderTop:"1px solid rgba(96,165,250,0.1)",flexWrap:"wrap",justifyContent:"center" }}>
            {[["2.4M+","Wallets Analysed"],["30+","Signals Tracked"],["8","Archetypes"],["6","Chains Supported"]].map(([n,l])=>(
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.8rem",color:"#60a5fa" }}>{n}</div>
                <div style={{ color:"rgba(226,234,247,0.35)",fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:"0.25rem" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {whales.length>0&&(
        <section style={{ maxWidth:1100,margin:"0 auto",padding:"3rem 2rem",position:"relative",zIndex:1 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem" }}>
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.25rem" }}>
                <span style={{ width:8,height:8,borderRadius:"50%",background:"#4ade80",display:"inline-block",animation:"pulse 2s infinite" }} />
                <span style={{ color:"#60a5fa",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase" }}>// Live Whale Moves</span>
              </div>
              <div style={{ color:"rgba(226,234,247,0.4)",fontSize:"0.72rem" }}>Transactions over $50K right now</div>
            </div>
            <a href="/whales" style={{ color:"#60a5fa",fontSize:"0.68rem",letterSpacing:"0.1em",textDecoration:"none",textTransform:"uppercase" }}>View all →</a>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:1,background:"rgba(96,165,250,0.08)",border:"1px solid rgba(96,165,250,0.08)" }}>
            {whales.map((m,i)=>(
              <div key={m.hash||i} style={{ background:"rgba(5,8,16,0.95)",padding:"1rem 1.25rem",display:"flex",alignItems:"center",gap:"1rem",cursor:"pointer",transition:"background 0.2s" }}
                onClick={()=>router.push(`/profile/${encodeURIComponent(m.from_address)}`)}
                onMouseEnter={e=>(e.currentTarget.style.background="rgba(96,165,250,0.04)")}
                onMouseLeave={e=>(e.currentTarget.style.background="rgba(5,8,16,0.95)")}>
                <div style={{ background:`${CHAIN_COLORS[m.chain]||"#60a5fa"}20`,color:CHAIN_COLORS[m.chain]||"#60a5fa",border:`1px solid ${CHAIN_COLORS[m.chain]||"#60a5fa"}40`,fontSize:"0.58rem",padding:"0.15rem 0.5rem",letterSpacing:"0.1em",flexShrink:0 }}>{m.chain.toUpperCase()}</div>
                <div style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.1rem",color:"#e2eaf7",minWidth:90,flexShrink:0 }}>{formatUSD(m.value_usd)}</div>
                <div style={{ flex:1,fontSize:"0.7rem",color:"rgba(226,234,247,0.5)" }}>
                  <span style={{ color:"#e2eaf7" }}>{m.from_label||`${m.from_address.slice(0,6)}...`}</span>
                  <span style={{ margin:"0 0.4rem" }}>→</span>
                  <span style={{ color:"#e2eaf7" }}>{m.to_label||`${m.to_address.slice(0,6)}...`}</span>
                </div>
                <div style={{ color:"rgba(226,234,247,0.3)",fontSize:"0.62rem",flexShrink:0 }}>{m.native_symbol}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {recent.length>0&&(
        <section style={{ maxWidth:1100,margin:"0 auto",padding:"3rem 2rem",position:"relative",zIndex:1 }}>
          <div style={{ color:"#60a5fa",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1.5rem" }}>// Recently Analysed</div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",gap:1,background:"rgba(96,165,250,0.08)",border:"1px solid rgba(96,165,250,0.08)" }}>
            {recent.slice(0,8).map((w:any)=>(
              <div key={w.address} onClick={()=>router.push(`/profile/${encodeURIComponent(w.address)}`)}
                style={{ background:"rgba(5,8,16,0.95)",padding:"1.25rem",cursor:"pointer",transition:"background 0.2s" }}
                onMouseEnter={e=>(e.currentTarget.style.background="rgba(96,165,250,0.05)")}
                onMouseLeave={e=>(e.currentTarget.style.background="rgba(5,8,16,0.95)")}>
                <div style={{ display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.5rem" }}>
                  <span style={{ fontSize:"1.25rem" }}>{w.archetype_icon}</span>
                  <div>
                    <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.82rem" }}>{w.archetype}</div>
                    <div style={{ color:"rgba(226,234,247,0.4)",fontSize:"0.6rem" }}>{short(w.address)}</div>
                  </div>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between" }}>
                  <div style={{ color:"rgba(226,234,247,0.4)",fontSize:"0.6rem" }}>{w.chain?.toUpperCase()}</div>
                  <div style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.2rem",color:"#60a5fa" }}>{w.score}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="archetypes" style={{ maxWidth:1100,margin:"0 auto",padding:"6rem 2rem",position:"relative",zIndex:1 }}>
        <div style={{ color:"#60a5fa",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.75rem" }}>// Archetypes</div>
        <h2 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(1.8rem,3vw,2.8rem)",letterSpacing:"-0.02em",marginBottom:"0.75rem" }}>Which type are you?</h2>
        <p style={{ color:"rgba(226,234,247,0.4)",fontSize:"0.82rem",lineHeight:1.8,maxWidth:480,marginBottom:"3rem" }}>Every wallet falls into one of 8 behavioural patterns. Our AI identifies exactly which one.</p>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))",gap:1,background:"rgba(96,165,250,0.08)",border:"1px solid rgba(96,165,250,0.08)" }}>
          {ARCHETYPES.map(a=>(
            <div key={a.name} style={{ background:"rgba(5,8,16,0.95)",padding:"2rem",cursor:"pointer",transition:"background 0.2s" }}
              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(96,165,250,0.05)"}
              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(5,8,16,0.95)"}>
              <div style={{ fontSize:"1.5rem",marginBottom:"1rem" }}>{a.icon}</div>
              <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.95rem",marginBottom:"0.5rem" }}>{a.name}</div>
              <div style={{ color:"rgba(226,234,247,0.4)",fontSize:"0.72rem",lineHeight:1.7 }}>{a.desc}</div>
              <div style={{ display:"inline-block",marginTop:"1rem",background:"rgba(96,165,250,0.1)",color:"#93c5fd",fontSize:"0.6rem",padding:"0.25rem 0.6rem",letterSpacing:"0.1em" }}>{a.badge}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" style={{ maxWidth:1100,margin:"0 auto",padding:"6rem 2rem",position:"relative",zIndex:1 }}>
        <div style={{ color:"#60a5fa",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.75rem" }}>// How it works</div>
        <h2 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(1.8rem,3vw,2.8rem)",letterSpacing:"-0.02em",marginBottom:"0.75rem" }}>From address to forecast</h2>
        <p style={{ color:"rgba(226,234,247,0.4)",fontSize:"0.82rem",lineHeight:1.8,maxWidth:480,marginBottom:"3rem" }}>Paste any wallet. In seconds, Wintercast reads the chain and delivers the cold truth.</p>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:"rgba(96,165,250,0.08)",border:"1px solid rgba(96,165,250,0.08)" }}>
          {[["01","Paste any address","EVM or Solana. Auto-detects chain across ETH, Base, Polygon, Arbitrum, BSC, Optimism + Solana."],["02","AI reads 30+ signals","Win rate, hold time, risk exposure, DeFi activity, timing patterns — all analysed in seconds."],["03","Get your forecast","Archetype, score, AI narrative, next-move predictions and a shareable card. Cold. Precise. Yours."]].map(([n,t,d])=>(
            <div key={n} style={{ background:"rgba(5,8,16,0.95)",padding:"2.5rem 2rem" }}>
              <div style={{ color:"#60a5fa",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1.5rem" }}>Step {n}</div>
              <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.05rem",marginBottom:"0.75rem" }}>{t}</div>
              <div style={{ color:"rgba(226,234,247,0.4)",fontSize:"0.75rem",lineHeight:1.8 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth:1100,margin:"0 auto",padding:"0 2rem 6rem",position:"relative",zIndex:1 }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem" }}>
          <div style={{ background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.15)",borderTop:"2px solid #60a5fa",padding:"2.5rem" }}>
            <div style={{ color:"#60a5fa",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.75rem" }}>// Compare</div>
            <h3 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.5rem",letterSpacing:"-0.02em",marginBottom:"0.75rem" }}>Who trades better?</h3>
            <p style={{ color:"rgba(226,234,247,0.4)",fontSize:"0.78rem",lineHeight:1.7,marginBottom:"1.5rem" }}>Put two wallets head to head. Compare archetypes, scores, and traits side by side.</p>
            <a href="/compare" style={{ display:"inline-block",background:"#60a5fa",color:"#050810",fontFamily:"var(--font-mono)",fontSize:"0.72rem",fontWeight:700,padding:"0.75rem 1.5rem",letterSpacing:"0.08em",textTransform:"uppercase",textDecoration:"none" }}>Compare Wallets →</a>
          </div>
          <div style={{ background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.15)",padding:"2.5rem" }}>
            <div style={{ color:"#60a5fa",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.75rem" }}>// Whale Feed</div>
            <h3 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.5rem",letterSpacing:"-0.02em",marginBottom:"0.75rem" }}>Follow the big money.</h3>
            <p style={{ color:"rgba(226,234,247,0.4)",fontSize:"0.78rem",lineHeight:1.7,marginBottom:"1.5rem" }}>Live feed of $50K+ moves across ETH, Base and Solana. Updated every 60 seconds.</p>
            <a href="/whales" style={{ display:"inline-block",background:"transparent",color:"#60a5fa",border:"1px solid rgba(96,165,250,0.3)",fontFamily:"var(--font-mono)",fontSize:"0.72rem",fontWeight:700,padding:"0.75rem 1.5rem",letterSpacing:"0.08em",textTransform:"uppercase",textDecoration:"none" }}>View Whale Feed →</a>
          </div>
        </div>
      </section>

      <footer style={{ maxWidth:1100,margin:"0 auto",padding:"2rem 2rem 4rem",borderTop:"1px solid rgba(96,165,250,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem",position:"relative",zIndex:1 }}>
        <div style={{ fontFamily:"var(--font-display)",fontWeight:800 }}>winter<span style={{ color:"#60a5fa" }}>cast</span></div>
        <div style={{ display:"flex",gap:"2rem" }}>
          {[["/whales","Whales"],["/compare","Compare"],["/pricing","Pricing"],["mailto:hello@wintercast.io","Contact"]].map(([href,label])=>(
            <a key={label} href={href} style={{ color:"rgba(226,234,247,0.3)",fontSize:"0.68rem",letterSpacing:"0.08em",textDecoration:"none" }}>{label}</a>
          ))}
        </div>
        <div style={{ color:"rgba(226,234,247,0.25)",fontSize:"0.65rem" }}>© 2025 Wintercast · wintercast.io</div>
      </footer>

      <style>{`
        * { box-sizing:border-box;margin:0;padding:0; }
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @media(max-width:700px){
          nav>div:nth-child(2){display:none;}
          div[style*="grid-template-columns: repeat(3"]{grid-template-columns:1fr!important;}
          div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}
        }
      `}</style>
    </main>
  )
}
