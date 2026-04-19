"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const ICE = "#9945ff"
const BG = "#0a0520"
const BG2 = "rgba(153,69,255,0.04)"
const BORDER = "rgba(153,69,255,0.12)"
const TEXT = "#e2eaf7"
const MUTED = "rgba(241,245,249,0.4)"
const API_URL = "https://wintercast-production.up.railway.app"

const SMART_MONEY = [
  { address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", label: "Vitalik.eth", desc: "Ethereum founder. Long-term holder, early DeFi adopter." },
  { address: "0x28C6c06298d514Db089934071355E5743bf21d60", label: "Binance Hot Wallet", desc: "High-frequency trading. $380K avg trade size." },
  { address: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf", label: "Kraken Exchange", desc: "Major exchange wallet. Institutional-grade moves." },
]

export default function CopyPage() {
  const router = useRouter()
  const [followed, setFollowed] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try { return JSON.parse(localStorage.getItem("followed_wallets") || "[]") } catch { return [] }
    }
    return []
  })
  const [customAddr, setCustomAddr] = useState("")
  const [recentMoves, setRecentMoves] = useState<any[]>([])

  useEffect(() => {
    fetch(`${API_URL}/api/whales`)
      .then(r=>r.json())
      .then(d=>setRecentMoves(d.moves||[]))
      .catch(()=>{})
  }, [])

  const follow = (address: string) => {
    const updated = followed.includes(address) ? followed.filter(a=>a!==address) : [...followed, address]
    setFollowed(updated)
    if (typeof window !== "undefined") localStorage.setItem("followed_wallets", JSON.stringify(updated))
  }

  const formatUSD = (n: number) => n>=1_000_000?`$${(n/1_000_000).toFixed(1)}M`:n>=1_000?`$${(n/1_000).toFixed(0)}K`:`$${n.toFixed(0)}`

  return (
    <main style={{ background:BG,minHeight:"100vh",color:TEXT,fontFamily:"var(--font-mono)" }}>
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 1.5rem",background:"rgba(10,5,32,0.95)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${BORDER}` }}>
        <button onClick={()=>router.push("/")} style={{ background:"none",border:"none",color:MUTED,fontFamily:"var(--font-mono)",fontSize:"0.72rem",cursor:"pointer",letterSpacing:"0.08em" }}>← winter<span style={{ color:ICE }}>cast</span></button>
        <div style={{ color:MUTED,fontSize:"0.68rem",letterSpacing:"0.1em" }}>COPY TRADING</div>
        <div style={{ width:80 }} />
      </nav>

      <div style={{ maxWidth:900,margin:"0 auto",padding:"5rem 1.5rem 4rem",position:"relative",zIndex:1 }}>
        <div style={{ color:ICE,fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem" }}>// Copy Trading</div>
        <h1 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(2rem,4vw,3rem)",letterSpacing:"-0.02em",marginBottom:"0.75rem" }}>Follow smart money.</h1>
        <p style={{ color:MUTED,fontSize:"0.8rem",lineHeight:1.8,marginBottom:"3rem",maxWidth:500 }}>
          Track the wallets that consistently outperform. Follow them here and get notified of their moves via the whale feed.
        </p>

        {/* Follow custom wallet */}
        <div style={{ background:BG2,border:`1px solid rgba(153,69,255,0.2)`,borderTop:`2px solid ${ICE}`,padding:"1.5rem",marginBottom:"2rem" }}>
          <div style={{ color:ICE,fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1rem" }}>// Follow any wallet</div>
          <div style={{ display:"flex",gap:"0.75rem" }}>
            <input value={customAddr} onChange={e=>setCustomAddr(e.target.value)} placeholder="0x... or Solana address"
              style={{ flex:1,background:"rgba(153,69,255,0.05)",border:`1px solid rgba(153,69,255,0.2)`,color:TEXT,fontFamily:"var(--font-mono)",fontSize:"0.78rem",padding:"0.75rem 1rem",outline:"none" }} />
            <button onClick={()=>{ if(customAddr.trim()){follow(customAddr.trim());setCustomAddr("")} }}
              style={{ background:"linear-gradient(135deg,#9945ff,#627eea)",color:"#fff",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.72rem",fontWeight:700,padding:"0.75rem 1.25rem",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",whiteSpace:"nowrap" }}>
              Follow →
            </button>
          </div>
        </div>

        {/* Smart money suggestions */}
        <div style={{ marginBottom:"2rem" }}>
          <div style={{ color:ICE,fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1rem" }}>// Smart Money Wallets</div>
          <div style={{ display:"flex",flexDirection:"column",gap:1,background:BORDER,border:`1px solid ${BORDER}` }}>
            {SMART_MONEY.map(w=>(
              <div key={w.address} style={{ background:BG,padding:"1.25rem",display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap" }}>
                <div style={{ flex:1,minWidth:200 }}>
                  <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.92rem",marginBottom:"0.2rem",color:ICE }}>{w.label}</div>
                  <div style={{ color:MUTED,fontSize:"0.68rem",marginBottom:"0.2rem" }}>{w.address.slice(0,8)}...{w.address.slice(-6)}</div>
                  <div style={{ color:MUTED,fontSize:"0.68rem" }}>{w.desc}</div>
                </div>
                <div style={{ display:"flex",gap:"0.5rem" }}>
                  <button onClick={()=>router.push(`/profile/${encodeURIComponent(w.address)}`)}
                    style={{ background:BG2,border:`1px solid ${BORDER}`,color:ICE,fontFamily:"var(--font-mono)",fontSize:"0.62rem",padding:"0.4rem 0.75rem",cursor:"pointer",letterSpacing:"0.06em",textTransform:"uppercase" }}>
                    Profile
                  </button>
                  <button onClick={()=>follow(w.address)}
                    style={{ background:followed.includes(w.address)?"rgba(74,222,128,0.1)":BG2,border:`1px solid ${followed.includes(w.address)?"rgba(74,222,128,0.3)":BORDER}`,color:followed.includes(w.address)?"#4ade80":MUTED,fontFamily:"var(--font-mono)",fontSize:"0.62rem",padding:"0.4rem 0.75rem",cursor:"pointer",letterSpacing:"0.06em",textTransform:"uppercase" }}>
                    {followed.includes(w.address)?"Following ✓":"Follow"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Followed wallets */}
        {followed.length > 0 && (
          <div style={{ marginBottom:"2rem" }}>
            <div style={{ color:ICE,fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1rem" }}>// Your Followed Wallets ({followed.length})</div>
            <div style={{ display:"flex",flexDirection:"column",gap:1,background:BORDER,border:`1px solid ${BORDER}` }}>
              {followed.map(addr=>(
                <div key={addr} style={{ background:BG,padding:"1rem 1.25rem",display:"flex",alignItems:"center",gap:"1rem" }}>
                  <div style={{ flex:1,fontSize:"0.75rem",color:TEXT,fontFamily:"var(--font-mono)" }}>{addr.slice(0,8)}...{addr.slice(-6)}</div>
                  <button onClick={()=>router.push(`/profile/${encodeURIComponent(addr)}`)}
                    style={{ background:BG2,border:`1px solid ${BORDER}`,color:ICE,fontFamily:"var(--font-mono)",fontSize:"0.62rem",padding:"0.4rem 0.75rem",cursor:"pointer",letterSpacing:"0.06em",textTransform:"uppercase" }}>
                    Profile
                  </button>
                  <button onClick={()=>follow(addr)}
                    style={{ background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",color:"#f87171",fontFamily:"var(--font-mono)",fontSize:"0.62rem",padding:"0.4rem 0.75rem",cursor:"pointer",letterSpacing:"0.06em",textTransform:"uppercase" }}>
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent moves from followed */}
        {recentMoves.length > 0 && (
          <div>
            <div style={{ color:ICE,fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1rem" }}>// Latest Smart Money Moves</div>
            <div style={{ display:"flex",flexDirection:"column",gap:1,background:BORDER,border:`1px solid ${BORDER}` }}>
              {recentMoves.slice(0,5).map((m,i)=>(
                <div key={m.hash||i} style={{ background:BG,padding:"1rem 1.25rem",display:"flex",alignItems:"center",gap:"1rem",cursor:"pointer",flexWrap:"wrap" }}
                  onClick={()=>router.push(`/profile/${encodeURIComponent(m.from_address)}`)}>
                  <div style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.1rem",color:TEXT,minWidth:80 }}>{formatUSD(m.value_usd)}</div>
                  <div style={{ flex:1,fontSize:"0.7rem",color:MUTED }}>
                    <span style={{ color:TEXT }}>{m.from_label||`${m.from_address.slice(0,6)}...`}</span>
                    <span style={{ margin:"0 0.4rem" }}>→</span>
                    <span style={{ color:TEXT }}>{m.to_label||`${m.to_address.slice(0,6)}...`}</span>
                  </div>
                  <div style={{ color:MUTED,fontSize:"0.62rem" }}>{m.native_symbol} · {m.chain.toUpperCase()}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:"0.75rem",textAlign:"right" }}>
              <a href="/whales" style={{ color:ICE,fontSize:"0.68rem",letterSpacing:"0.1em",textDecoration:"none",textTransform:"uppercase" }}>View all whale moves →</a>
            </div>
          </div>
        )}
      </div>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>
    </main>
  )
}
