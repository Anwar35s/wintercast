"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const ARCHETYPES = [
  { icon: "🐋", name: "The Whale", desc: "Massive holdings, slow deliberate moves, market-moving trades.", badge: "TOP 0.1%" },
  { icon: "🤖", name: "The Bot", desc: "Millisecond timing, high-frequency patterns. Human? Unlikely.", badge: "MEV SUSPECTED" },
  { icon: "🎰", name: "The Degen", desc: "Meme coins, leverage, high loss rate. Lives for the thrill.", badge: "HIGH RISK" },
  { icon: "🧠", name: "Smart Money", desc: "Consistently profitable, early entries before pumps.", badge: "ALPHA SIGNAL" },
  { icon: "💎", name: "Diamond Hands", desc: "Buys and rarely sells. Long hold times, ignores volatility.", badge: "LONG TERM" },
  { icon: "🎯", name: "The Sniper", desc: "Gets in early on new launches. Fast flip, big ROI.", badge: "LAUNCH EXPERT" },
  { icon: "🔄", name: "The Flipper", desc: "Short hold times, high volume, trades narratives fast.", badge: "MOMENTUM" },
  { icon: "🐟", name: "Retail Follower", desc: "Buys tops, small amounts, follows trends late.", badge: "COMMON" },
]

const DEMO_WALLETS = [
  { address: "0x28C6c06298d514Db089934071355E5743bf21d60", label: "Binance" },
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
  const [menuOpen, setMenuOpen] = useState(false)
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

  const NAV_LINKS = [["/whales","🐋 Whales"],["/token","🔍 Tokens"],["/track","📡 Track"],["/compare","Compare"],["/pricing","Pricing"]]

  return (
    <main style={{ background:"#050810",minHeight:"100vh",color:"#e2eaf7",fontFamily:"var(--font-mono)" }}>
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 120% 60% at 50% -10%, rgba(96,165,250,0.07) 0%, transparent 70%)" }} />

      {/* Nav */}
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:50,background:"rgba(5,8,16,0.95)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(96,165,250,0.1)" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 1.5rem" }}>
          <div style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.1rem",letterSpacing:"-0.02em" }}>
            winter<span style={{ color:"#60a5fa" }}>cast</span>
          </div>
          {/* Desktop links */}
          <div style={{ display:"flex",gap:"1.5rem" }} className="desktop-only">
            {NAV_LINKS.map(([href,label])=>(
              <a key={href} href={href} style={{ color:"rgba(226,234,247,0.4)",textDecoration:"none",fontSize:"0.7rem",letterSpacing:"0.08em",textTransform:"uppercase" }}
                onMouseEnter={e=>(e.currentTarget.style.color="#60a5fa")}
                onMouseLeave={e=>(e.currentTarget.style.color="rgba(226,234,247,0.4)")}>
                {label}
              </a>
            ))}
          </div>
          <div style={{ display:"flex",gap:"0.75rem",alignItems:"center" }}>
            <button onClick={handleAnalyse} className="desktop-only" style={{ background:"#60a5fa",color:"#050810",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.68rem",fontWeight:700,padding:"0.45rem 1rem",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase" }}>
              Analyse →
            </button>
            <button onClick={()=>setMenuOpen(!menuOpen)} className="mobile-only" style={{ background:"none",border:"1px solid rgba(96,165,250,0.2)",color:"rgba(226,234,247,0.6)",fontFamily:"var(--font-mono)",fontSize:"0.9rem",width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
              {menuOpen?"✕":"☰"}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ borderTop:"1px solid rgba(96,165,250,0.1)",padding:"1rem 1.5rem",display:"flex",flexDirection:"column",gap:"0.75rem" }}>
            <div style={{ position:"relative",marginBottom:"0.5rem" }}>
              <input value={address} onChange={e=>setAddress(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){handleAnalyse();setMenuOpen(false)}}}
                placeholder="Paste wallet address..."
                style={{ width:"100%",background:"rgba(96,165,250,0.05)",border:"1px solid rgba(96,165,250,0.2)",color:"#e2eaf7",fontFamily:"var(--font-mono)",fontSize:"0.78rem",padding:"0.75rem 90px 0.75rem 1rem",outline:"none",boxSizing:"border-box" }} />
              <button onClick={()=>{handleAnalyse();setMenuOpen(false)}} style={{ position:"absolute",right:0,top:0,bottom:0,background:"#60a5fa",color:"#050810",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.68rem",fontWeight:700,padding:"0 1rem",cursor:"pointer",textTransform:"uppercase",letterSpacing:"0.06em" }}>
                Go →
              </button>
            </div>
            {NAV_LINKS.map(([href,label])=>(
              <a key={href} href={href} onClick={()=>setMenuOpen(false)}
                style={{ color:"rgba(226,234,247,0.5)",textDecoration:"none",fontSize:"0.82rem",padding:"0.6rem 0",borderBottom:"1px solid rgba(96,165,250,0.08)",letterSpacing:"0.06em" }}>
                {label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section style={{ minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"5rem 1.25rem 3rem",position:"relative" }}>
        <div style={{ position:"absolute",inset:0,zIndex:0,backgroundImage:"linear-gradient(rgba(96,165,250,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.04) 1px, transparent 1px)",backgroundSize:"50px 50px",maskImage:"radial-gradient(ellipse 80% 70% at 50% 50%, black 10%, transparent 100%)" }} />
        <div style={{ position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",width:"100%",maxWidth:600 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:"0.5rem",border:"1px solid rgba(96,165,250,0.25)",background:"rgba(96,165,250,0.08)",color:"#93c5fd",padding:"0.35rem 1rem",fontSize:"0.65rem",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"1.5rem" }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:"#60a5fa",display:"inline-block",animation:"pulse 2s infinite" }} />
            Free during beta · EVM + Solana
          </div>
          <h1 style={{ fontFamily:"var(--font-display)",fontSize:"clamp(2rem,4vw,3.2rem)",fontWeight:800,lineHeight:1.02,letterSpacing:"-0.03em",marginBottom:"1.25rem" }}>
            Every wallet<br />tells a story.<br /><span style={{ color:"#60a5fa" }}>We read it.</span>
          </h1>
          <p style={{ color:"rgba(226,234,247,0.45)",fontSize:"clamp(0.78rem,2.5vw,0.88rem)",lineHeight:1.9,maxWidth:440,marginBottom:"2rem" }}>
            Paste any EVM or Solana address. Get archetype, score, AI narrative, and next-move predictions.
          </p>
          <div style={{ position:"relative",width:"100%",maxWidth:560,marginBottom:"0.75rem" }}>
            <input value={address} onChange={e=>{setAddress(e.target.value);if(e.target.value.length>10)fetchPortfolioPreview(e.target.value)}} onKeyDown={e=>e.key==="Enter"&&handleAnalyse()}
              placeholder="0x... or Solana address"
              style={{ width:"100%",background:"rgba(96,165,250,0.05)",border:"1px solid rgba(96,165,250,0.2)",color:"#e2eaf7",fontFamily:"var(--font-mono)",fontSize:"clamp(0.72rem,2vw,0.8rem)",padding:"1rem 120px 1rem 1.25rem",outline:"none",boxSizing:"border-box" }} />
            <button onClick={handleAnalyse} disabled={loading}
              style={{ position:"absolute",right:0,top:0,bottom:0,background:"#60a5fa",color:"#050810",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.68rem",fontWeight:700,padding:"0 1.25rem",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",whiteSpace:"nowrap" }}>
              {loading?"...":"Analyse →"}
            </button>
          </div>
          <p style={{ color:"rgba(226,234,247,0.25)",fontSize:"0.65rem",letterSpacing:"0.06em",marginBottom:"0.75rem" }}>
            Try:{" "}
            {DEMO_WALLETS.map((w,i)=>(
              <span key={w.address}>
                <span style={{ color:"rgba(96,165,250,0.7)",cursor:"pointer",textDecoration:"underline",textUnderlineOffset:3 }} onClick={()=>{setAddress(w.address);fetchPortfolioPreview(w.address)}}>{w.label}</span>
                {i<DEMO_WALLETS.length-1&&<span style={{ color:"rgba(226,234,247,0.2)" }}> · </span>}
              </span>
            ))}
          </p>
          {portfolioPreview && (
            <div style={{ display:"flex",alignItems:"center",gap:"0.75rem",background:"rgba(96,165,250,0.05)",border:"1px solid rgba(96,165,250,0.15)",padding:"0.65rem 1rem",width:"100%",maxWidth:560,marginBottom:"0.5rem" }}>
              <span>💼</span>
              <div style={{ flex:1,fontSize:"0.7rem",color:"rgba(226,234,247,0.6)" }}>
                Portfolio: <span style={{ color:"#e2eaf7",fontFamily:"var(--font-display)",fontWeight:700 }}>${portfolioPreview.total_usd.toLocaleString(undefined,{maximumFractionDigits:0})}</span> · <span style={{ color:"#e2eaf7" }}>{portfolioPreview.tokens} tokens</span>
              </div>
              <a href={`/portfolio/${encodeURIComponent(address)}`} style={{ color:"#60a5fa",fontSize:"0.62rem",letterSpacing:"0.08em",textDecoration:"none",textTransform:"uppercase",whiteSpace:"nowrap" }}>X-Ray →</a>
            </div>
          )}
          <div style={{ display:"flex",gap:"2rem",marginTop:"2.5rem",paddingTop:"2rem",borderTop:"1px solid rgba(96,165,250,0.1)",flexWrap:"wrap",justifyContent:"center" }}>
            {[["2.4M+","Wallets"],["30+","Signals"],["8","Archetypes"],["6","Chains"]].map(([n,l])=>(
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(1.4rem,4vw,1.8rem)",color:"#60a5fa" }}>{n}</div>
                <div style={{ color:"rgba(226,234,247,0.35)",fontSize:"0.6rem",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:"0.25rem" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Whale feed preview */}
      {whales.length>0&&(
        <section style={{ maxWidth:1100,margin:"0 auto",padding:"2rem 1.25rem",position:"relative",zIndex:1 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem" }}>
            <div style={{ display:"flex",alignItems:"center",gap:"0.5rem" }}>
              <span style={{ width:8,height:8,borderRadius:"50%",background:"#4ade80",display:"inline-block",animation:"pulse 2s infinite" }} />
              <span style={{ color:"#60a5fa",fontSize:"0.62rem",letterSpacing:"0.15em",textTransform:"uppercase" }}>Live Whale Moves</span>
            </div>
            <a href="/whales" style={{ color:"#60a5fa",fontSize:"0.65rem",letterSpacing:"0.1em",textDecoration:"none",textTransform:"uppercase" }}>View all →</a>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:1,background:"rgba(96,165,250,0.08)",border:"1px solid rgba(96,165,250,0.08)" }}>
            {whales.map((m,i)=>(
              <div key={m.hash||i} style={{ background:"rgba(5,8,16,0.95)",padding:"0.9rem 1rem",display:"flex",alignItems:"center",gap:"0.75rem",cursor:"pointer",flexWrap:"wrap" }}
                onClick={()=>router.push(`/profile/${encodeURIComponent(m.from_address)}`)}>
                <div style={{ background:`${CHAIN_COLORS[m.chain]||"#60a5fa"}20`,color:CHAIN_COLORS[m.chain]||"#60a5fa",fontSize:"0.55rem",padding:"0.15rem 0.45rem",letterSpacing:"0.1em",flexShrink:0 }}>{m.chain.toUpperCase()}</div>
                <div style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1rem",color:"#e2eaf7",minWidth:80,flexShrink:0 }}>{formatUSD(m.value_usd)}</div>
                <div style={{ flex:1,fontSize:"0.68rem",color:"rgba(226,234,247,0.5)",minWidth:120 }}>
                  <span style={{ color:"#e2eaf7" }}>{m.from_label||`${m.from_address.slice(0,6)}...`}</span>
                  <span style={{ margin:"0 0.35rem" }}>→</span>
                  <span style={{ color:"#e2eaf7" }}>{m.to_label||`${m.to_address.slice(0,6)}...`}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent profiles */}
      {recent.length>0&&(
        <section style={{ maxWidth:1100,margin:"0 auto",padding:"2rem 1.25rem",position:"relative",zIndex:1 }}>
          <div style={{ color:"#60a5fa",fontSize:"0.62rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1rem" }}>// Recently Analysed</div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:1,background:"rgba(96,165,250,0.08)",border:"1px solid rgba(96,165,250,0.08)" }}>
            {recent.slice(0,8).map((w:any)=>(
              <div key={w.address} onClick={()=>router.push(`/profile/${encodeURIComponent(w.address)}`)}
                style={{ background:"rgba(5,8,16,0.95)",padding:"1rem",cursor:"pointer" }}>
                <div style={{ display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.4rem" }}>
                  <span style={{ fontSize:"1.1rem" }}>{w.archetype_icon}</span>
                  <div>
                    <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.78rem" }}>{w.archetype}</div>
                    <div style={{ color:"rgba(226,234,247,0.4)",fontSize:"0.58rem" }}>{short(w.address)}</div>
                  </div>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between" }}>
                  <div style={{ color:"rgba(226,234,247,0.4)",fontSize:"0.58rem" }}>{w.chain?.toUpperCase()}</div>
                  <div style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.1rem",color:"#60a5fa" }}>{w.score}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Archetypes */}
      <section id="archetypes" style={{ maxWidth:1100,margin:"0 auto",padding:"4rem 1.25rem",position:"relative",zIndex:1 }}>
        <div style={{ color:"#60a5fa",fontSize:"0.62rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem" }}>// Archetypes</div>
        <h2 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(1.6rem,4vw,2.5rem)",letterSpacing:"-0.02em",marginBottom:"0.75rem" }}>Which type are you?</h2>
        <p style={{ color:"rgba(226,234,247,0.4)",fontSize:"0.8rem",lineHeight:1.8,maxWidth:480,marginBottom:"2.5rem" }}>Every wallet falls into one of 8 behavioural patterns.</p>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:1,background:"rgba(96,165,250,0.08)",border:"1px solid rgba(96,165,250,0.08)" }}>
          {ARCHETYPES.map(a=>(
            <div key={a.name} style={{ background:"rgba(5,8,16,0.95)",padding:"1.5rem",cursor:"pointer" }}
              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(96,165,250,0.05)"}
              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(5,8,16,0.95)"}>
              <div style={{ fontSize:"1.4rem",marginBottom:"0.75rem" }}>{a.icon}</div>
              <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.9rem",marginBottom:"0.4rem" }}>{a.name}</div>
              <div style={{ color:"rgba(226,234,247,0.4)",fontSize:"0.7rem",lineHeight:1.6 }}>{a.desc}</div>
              <div style={{ display:"inline-block",marginTop:"0.75rem",background:"rgba(96,165,250,0.1)",color:"#93c5fd",fontSize:"0.58rem",padding:"0.2rem 0.5rem",letterSpacing:"0.1em" }}>{a.badge}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ maxWidth:1100,margin:"0 auto",padding:"4rem 1.25rem",position:"relative",zIndex:1 }}>
        <div style={{ color:"#60a5fa",fontSize:"0.62rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem" }}>// How it works</div>
        <h2 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(1.6rem,4vw,2.5rem)",letterSpacing:"-0.02em",marginBottom:"0.75rem" }}>From address to forecast</h2>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:1,background:"rgba(96,165,250,0.08)",border:"1px solid rgba(96,165,250,0.08)",marginTop:"2rem" }}>
          {[["01","Paste any address","EVM or Solana. Auto-detects chain across ETH, Base, Polygon, Arbitrum, BSC, Optimism + Solana."],["02","AI reads 30+ signals","Win rate, hold time, risk, DeFi activity, timing patterns — analysed in seconds."],["03","Get your forecast","Archetype, score, AI narrative, predictions and shareable card. Cold. Precise."]].map(([n,t,d])=>(
            <div key={n} style={{ background:"rgba(5,8,16,0.95)",padding:"2rem 1.5rem" }}>
              <div style={{ color:"#60a5fa",fontSize:"0.62rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1rem" }}>Step {n}</div>
              <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1rem",marginBottom:"0.5rem" }}>{t}</div>
              <div style={{ color:"rgba(226,234,247,0.4)",fontSize:"0.72rem",lineHeight:1.7 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTAs */}
      <section style={{ maxWidth:1100,margin:"0 auto",padding:"0 1.25rem 5rem",position:"relative",zIndex:1 }}>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"1rem" }}>
          <div style={{ background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.15)",borderTop:"2px solid #60a5fa",padding:"2rem" }}>
            <div style={{ color:"#60a5fa",fontSize:"0.62rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem" }}>// Compare</div>
            <h3 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.3rem",letterSpacing:"-0.02em",marginBottom:"0.75rem" }}>Who trades better?</h3>
            <p style={{ color:"rgba(226,234,247,0.4)",fontSize:"0.75rem",lineHeight:1.7,marginBottom:"1.25rem" }}>Put two wallets head to head.</p>
            <a href="/compare" style={{ display:"inline-block",background:"#60a5fa",color:"#050810",fontFamily:"var(--font-mono)",fontSize:"0.7rem",fontWeight:700,padding:"0.7rem 1.25rem",letterSpacing:"0.08em",textTransform:"uppercase",textDecoration:"none" }}>Compare →</a>
          </div>
          <div style={{ background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.15)",padding:"2rem" }}>
            <div style={{ color:"#60a5fa",fontSize:"0.62rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem" }}>// Whale Feed</div>
            <h3 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.3rem",letterSpacing:"-0.02em",marginBottom:"0.75rem" }}>Follow the big money.</h3>
            <p style={{ color:"rgba(226,234,247,0.4)",fontSize:"0.75rem",lineHeight:1.7,marginBottom:"1.25rem" }}>Live $50K+ moves. Updated every 60s.</p>
            <a href="/whales" style={{ display:"inline-block",background:"transparent",color:"#60a5fa",border:"1px solid rgba(96,165,250,0.3)",fontFamily:"var(--font-mono)",fontSize:"0.7rem",fontWeight:700,padding:"0.7rem 1.25rem",letterSpacing:"0.08em",textTransform:"uppercase",textDecoration:"none" }}>View Whales →</a>
          </div>
          <div style={{ background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.15)",padding:"2rem" }}>
            <div style={{ color:"#60a5fa",fontSize:"0.62rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem" }}>// Track</div>
            <h3 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.3rem",letterSpacing:"-0.02em",marginBottom:"0.75rem" }}>Never miss a move.</h3>
            <p style={{ color:"rgba(226,234,247,0.4)",fontSize:"0.75rem",lineHeight:1.7,marginBottom:"1.25rem" }}>Email alerts when any wallet moves.</p>
            <a href="/track" style={{ display:"inline-block",background:"transparent",color:"#60a5fa",border:"1px solid rgba(96,165,250,0.3)",fontFamily:"var(--font-mono)",fontSize:"0.7rem",fontWeight:700,padding:"0.7rem 1.25rem",letterSpacing:"0.08em",textTransform:"uppercase",textDecoration:"none" }}>Track Wallet →</a>
          </div>
        </div>
      </section>

      <footer style={{ maxWidth:1100,margin:"0 auto",padding:"1.5rem 1.25rem 3rem",borderTop:"1px solid rgba(96,165,250,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem",position:"relative",zIndex:1 }}>
        <div style={{ fontFamily:"var(--font-display)",fontWeight:800 }}>winter<span style={{ color:"#60a5fa" }}>cast</span></div>
        <div style={{ display:"flex",gap:"1.5rem",flexWrap:"wrap" }}>
          {[["/whales","Whales"],["/token","Tokens"],["/track","Track"],["/compare","Compare"],["/pricing","Pricing"],["mailto:hello@wintercast.io","Contact"]].map(([href,label])=>(
            <a key={label} href={href} style={{ color:"rgba(226,234,247,0.3)",fontSize:"0.65rem",letterSpacing:"0.08em",textDecoration:"none" }}>{label}</a>
          ))}
        </div>
        <div style={{ color:"rgba(226,234,247,0.2)",fontSize:"0.62rem" }}>© 2025 Wintercast</div>
      </footer>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        .desktop-only{display:flex!important}
        .mobile-only{display:none!important}
        @media(max-width:768px){
          .desktop-only{display:none!important}
          .mobile-only{display:flex!important}
        }
      `}</style>
    </main>
  )
}
