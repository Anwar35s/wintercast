"use client"
import AnimatedLayout from "@/app/components/AnimatedLayout"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const P = "#9945ff"
const BG = "transparent"
const BORDER = "rgba(153,69,255,0.15)"
const TEXT = "#f1f5f9"
const MUTED = "rgba(241,245,249,0.4)"
const API = "https://wintercast-production.up.railway.app"

export default function ActivityPage({ params }: { params: { address: string } }) {
  const address = decodeURIComponent(params.address)
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all"|"buy"|"sell">("all")
  const short = `${address.slice(0,8)}...${address.slice(-6)}`

  useEffect(() => {
    fetch(`${API}/api/activity/${encodeURIComponent(address)}`)
      .then(r=>r.json())
      .then(d=>{ setData(d); setLoading(false) })
      .catch(()=>setLoading(false))
    const i = setInterval(()=>{
      fetch(`${API}/api/activity/${encodeURIComponent(address)}`)
        .then(r=>r.json())
        .then(setData)
        .catch(()=>{})
    }, 30000)
    return ()=>clearInterval(i)
  }, [address])

  const fmt = (n: number) => n>=1e9?`$${(n/1e9).toFixed(2)}B`:n>=1e6?`$${(n/1e6).toFixed(1)}M`:n>=1000?`$${(n/1000).toFixed(1)}K`:`$${n.toFixed(2)}`
  const timeAgo = (ts: number) => {
    const diff = Date.now()/1000 - ts
    if (diff < 60) return `${Math.floor(diff)}s ago`
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
    return `${Math.floor(diff/86400)}d ago`
  }

  const filtered = data?.activity?.filter((a: any) => filter === "all" || a.type === filter) || []

  return (
    <AnimatedLayout>
    <main style={{background:"transparent",minHeight:"100vh",color:TEXT,fontFamily:"var(--font-mono)"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 80% 60% at 20% 20%, rgba(153,69,255,0.12) 0%, transparent 60%)"}}/>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 1.5rem",background:"rgba(0,0,0,0.92)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${BORDER}`}}>
        <button onClick={()=>router.push(`/profile/${encodeURIComponent(address)}`)} style={{background:"none",border:"none",color:MUTED,fontFamily:"var(--font-mono)",fontSize:"0.72rem",cursor:"pointer"}}>← Profile</button>
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:"#4ade80",display:"inline-block",animation:"pulse 2s infinite"}}/>
          <span style={{color:MUTED,fontSize:"0.68rem",letterSpacing:"0.1em"}}>LIVE ACTIVITY</span>
        </div>
        <div style={{color:MUTED,fontSize:"0.65rem"}}>{short}</div>
      </nav>

      <div style={{maxWidth:900,margin:"0 auto",padding:"5rem 1.5rem 4rem",position:"relative",zIndex:1}}>
        <div style={{color:"#c084fc",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem"}}>// Wallet Activity</div>
        <h1 style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(1.8rem,4vw,2.5rem)",letterSpacing:"-0.02em",marginBottom:"0.5rem"}}>What is this wallet buying?</h1>
        <p style={{color:MUTED,fontSize:"0.78rem",marginBottom:"2rem"}}>Live token swaps, buys and sells. Updates every 30 seconds.</p>

        {/* Summary cards */}
        {data && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:1,background:BORDER,border:`1px solid ${BORDER}`,borderRadius:6,overflow:"hidden",marginBottom:"2rem"}}>
            {[
              ["Total Trades", data.total_trades||0, TEXT],
              ["Total Bought", fmt(data.total_bought_usd||0), "#4ade80"],
              ["Total Sold", fmt(data.total_sold_usd||0), "#f87171"],
              ["PnL", fmt((data.total_bought_usd||0)-(data.total_sold_usd||0)), (data.total_bought_usd||0)>(data.total_sold_usd||0)?"#f87171":"#4ade80"],
              ["Unique Tokens", data.unique_tokens||0, "#c084fc"],
            ].map(([l,v,c])=>(
              <div key={l as string} style={{background:BG,padding:"1.25rem",textAlign:"center"}}>
                <div style={{color:MUTED,fontSize:"0.58rem",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.25rem"}}>{l}</div>
                <div style={{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.2rem",color:c as string}}>{v}</div>
              </div>
            ))}
          </div>
        )}

        {/* Top tokens */}
        {data?.top_tokens?.length > 0 && (
          <div style={{marginBottom:"2rem"}}>
            <div style={{color:"#c084fc",fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1rem"}}>// Most Traded Tokens</div>
            <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
              {data.top_tokens.map((t: any)=>(
                <div key={t.symbol} style={{background:"rgba(153,69,255,0.1)",border:"1px solid rgba(153,69,255,0.25)",padding:"0.4rem 0.75rem",borderRadius:20,display:"flex",alignItems:"center",gap:"0.5rem"}}>
                  <span style={{color:TEXT,fontSize:"0.75rem",fontWeight:700}}>{t.symbol}</span>
                  <span style={{color:t.net_usd>=0?"#4ade80":"#f87171",fontSize:"0.65rem"}}>{t.net_usd>=0?"▲":"▼"} {fmt(Math.abs(t.net_usd))}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter */}
        <div style={{display:"flex",gap:"0.5rem",marginBottom:"1.25rem"}}>
          {(["all","buy","sell"] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{background:filter===f?"linear-gradient(135deg,#9945ff,#627eea)":"rgba(153,69,255,0.08)",color:filter===f?"#fff":MUTED,border:`1px solid ${filter===f?"transparent":"rgba(153,69,255,0.2)"}`,fontFamily:"var(--font-mono)",fontSize:"0.65rem",fontWeight:700,padding:"0.4rem 1rem",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",borderRadius:4}}>
              {f === "all" ? "All" : f === "buy" ? "🟢 Buys" : "🔴 Sells"}
            </button>
          ))}
        </div>

        {/* Activity feed */}
        {loading ? (
          <div style={{color:P,fontSize:"0.72rem",letterSpacing:"0.15em",animation:"pulse 2s infinite"}}>FETCHING ACTIVITY...</div>
        ) : filtered.length > 0 ? (
          <div style={{display:"flex",flexDirection:"column",gap:1,background:BORDER,border:`1px solid ${BORDER}`,borderRadius:6,overflow:"hidden"}}>
            {/* Header */}
            <div style={{background:"rgba(153,69,255,0.06)",padding:"0.75rem 1.25rem",display:"grid",gridTemplateColumns:"80px 1fr 1fr 1fr 100px",gap:"1rem",alignItems:"center"}}>
              {["TYPE","TOKEN","AMOUNT","VALUE","TIME"].map(h=>(
                <div key={h} style={{color:MUTED,fontSize:"0.58rem",letterSpacing:"0.12em",textTransform:"uppercase"}}>{h}</div>
              ))}
            </div>
            {filtered.map((a: any, i: number)=>(
              <div key={a.hash||i} style={{background:BG,padding:"1rem 1.25rem",display:"grid",gridTemplateColumns:"80px 1fr 1fr 1fr 100px",gap:"1rem",alignItems:"center",cursor:"pointer",transition:"background 0.2s"}}
                onMouseEnter={e=>(e.currentTarget.style.background="rgba(153,69,255,0.06)")}
                onMouseLeave={e=>(e.currentTarget.style.background=BG)}>
                <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:a.type==="buy"?"#4ade80":"#f87171",flexShrink:0}}/>
                  <span style={{color:a.type==="buy"?"#4ade80":"#f87171",fontSize:"0.65rem",fontWeight:700,textTransform:"uppercase"}}>{a.type}</span>
                </div>
                <div>
                  <div style={{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.9rem",color:TEXT}}>{a.token_symbol||"?"}</div>
                  <div style={{color:MUTED,fontSize:"0.6rem"}}>{a.token_name||""}</div>
                </div>
                <div style={{color:TEXT,fontSize:"0.78rem"}}>{a.amount?.toLocaleString(undefined,{maximumFractionDigits:4})} {a.token_symbol}</div>
                <div style={{color:a.type==="buy"?"#4ade80":"#f87171",fontFamily:"var(--font-display)",fontWeight:700,fontSize:"0.9rem"}}>{fmt(a.value_usd||0)}</div>
                <div style={{color:MUTED,fontSize:"0.65rem"}}>{a.timestamp?timeAgo(a.timestamp):""}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{background:"rgba(153,69,255,0.05)",border:`1px solid ${BORDER}`,padding:"3rem",textAlign:"center",borderRadius:6}}>
            <div style={{color:MUTED,fontSize:"0.82rem"}}>No {filter === "all" ? "" : filter} activity found for this wallet.</div>
          </div>
        )}
      </div>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </main>
    </AnimatedLayout>
  )
}
