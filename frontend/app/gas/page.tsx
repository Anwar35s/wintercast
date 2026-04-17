"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const ICE = "#60a5fa"
const BG = "#050810"
const BG2 = "rgba(96,165,250,0.04)"
const BORDER = "rgba(96,165,250,0.12)"
const TEXT = "#e2eaf7"
const MUTED = "rgba(226,234,247,0.4)"
const API_URL = "https://wintercast-production.up.railway.app"

export default function GasPage() {
  const router = useRouter()
  const [gas, setGas] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date|null>(null)

  const fetchGas = async () => {
    try {
      const r = await fetch(`${API_URL}/api/gas`)
      const d = await r.json()
      if (d.success) { setGas(d.gas); setLastUpdate(new Date()) }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchGas()
    const interval = setInterval(fetchGas, 15000)
    return () => clearInterval(interval)
  }, [])

  const getColor = (level: string) => level === "slow" ? "#4ade80" : level === "standard" ? ICE : level === "fast" ? "#f59e0b" : "#f87171"

  return (
    <main style={{ background:BG,minHeight:"100vh",color:TEXT,fontFamily:"var(--font-mono)" }}>
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 120% 60% at 50% -10%, rgba(96,165,250,0.07) 0%, transparent 70%)" }} />
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 1.5rem",background:"rgba(5,8,16,0.95)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${BORDER}` }}>
        <button onClick={()=>router.push("/")} style={{ background:"none",border:"none",color:MUTED,fontFamily:"var(--font-mono)",fontSize:"0.72rem",cursor:"pointer",letterSpacing:"0.08em" }}>← winter<span style={{ color:ICE }}>cast</span></button>
        <div style={{ display:"flex",alignItems:"center",gap:"0.5rem" }}>
          <span style={{ width:7,height:7,borderRadius:"50%",background:"#4ade80",display:"inline-block",animation:"pulse 2s infinite" }} />
          <span style={{ color:MUTED,fontSize:"0.68rem",letterSpacing:"0.1em" }}>LIVE GAS TRACKER</span>
        </div>
        <div style={{ color:MUTED,fontSize:"0.62rem" }}>{lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : ""}</div>
      </nav>

      <div style={{ maxWidth:900,margin:"0 auto",padding:"5rem 1.5rem 4rem",position:"relative",zIndex:1 }}>
        <div style={{ color:ICE,fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem" }}>// Gas Tracker</div>
        <h1 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(2rem,4vw,3rem)",letterSpacing:"-0.02em",marginBottom:"0.5rem" }}>Live gas prices.</h1>
        <p style={{ color:MUTED,fontSize:"0.8rem",marginBottom:"3rem" }}>Real-time gas fees across ETH and Solana. Updates every 15 seconds.</p>

        {loading ? (
          <div style={{ color:ICE,fontSize:"0.72rem",letterSpacing:"0.15em",animation:"pulse 2s infinite" }}>FETCHING GAS DATA...</div>
        ) : gas ? (
          <>
            {/* ETH Gas */}
            {gas.eth && (
              <div style={{ marginBottom:"2rem" }}>
                <div style={{ display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1rem" }}>
                  <div style={{ width:10,height:10,borderRadius:"50%",background:"#627eea" }} />
                  <span style={{ color:TEXT,fontSize:"0.78rem",fontFamily:"var(--font-display)",fontWeight:700 }}>Ethereum</span>
                  <span style={{ color:MUTED,fontSize:"0.65rem" }}>ETH · Gwei</span>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:1,background:BORDER,border:`1px solid ${BORDER}` }}>
                  {[
                    ["SLOW", gas.eth.slow, "~5 min", "#4ade80"],
                    ["STANDARD", gas.eth.standard, "~1 min", ICE],
                    ["FAST", gas.eth.fast, "~30 sec", "#f59e0b"],
                    ["INSTANT", gas.eth.instant, "~15 sec", "#f87171"],
                  ].map(([label,gwei,time,color])=>(
                    <div key={label as string} style={{ background:BG,padding:"1.5rem" }}>
                      <div style={{ color:MUTED,fontSize:"0.58rem",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"0.5rem" }}>{label}</div>
                      <div style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.8rem",color:color as string,marginBottom:"0.25rem" }}>{gwei}</div>
                      <div style={{ color:MUTED,fontSize:"0.62rem" }}>Gwei · {time}</div>
                    </div>
                  ))}
                </div>
                {gas.eth.base_fee && (
                  <div style={{ marginTop:"0.5rem",color:MUTED,fontSize:"0.65rem" }}>
                    Base fee: <span style={{ color:TEXT }}>{gas.eth.base_fee} Gwei</span> · Priority fee: <span style={{ color:TEXT }}>{gas.eth.priority_fee} Gwei</span>
                  </div>
                )}
              </div>
            )}

            {/* Solana */}
            {gas.solana && (
              <div style={{ marginBottom:"2rem" }}>
                <div style={{ display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1rem" }}>
                  <div style={{ width:10,height:10,borderRadius:"50%",background:"#9945ff" }} />
                  <span style={{ color:TEXT,fontSize:"0.78rem",fontFamily:"var(--font-display)",fontWeight:700 }}>Solana</span>
                  <span style={{ color:MUTED,fontSize:"0.65rem" }}>SOL · Lamports</span>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:1,background:BORDER,border:`1px solid ${BORDER}` }}>
                  {[
                    ["AVG FEE", gas.solana.avg_fee, "lamports", "#9945ff"],
                    ["MIN FEE", gas.solana.min_fee, "lamports", "#4ade80"],
                    ["TPS", gas.solana.tps, "transactions/sec", ICE],
                  ].map(([label,val,unit,color])=>(
                    <div key={label as string} style={{ background:BG,padding:"1.5rem" }}>
                      <div style={{ color:MUTED,fontSize:"0.58rem",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"0.5rem" }}>{label}</div>
                      <div style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.8rem",color:color as string,marginBottom:"0.25rem" }}>{val?.toLocaleString()}</div>
                      <div style={{ color:MUTED,fontSize:"0.62rem" }}>{unit}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ETH price */}
            {gas.eth_price && (
              <div style={{ background:BG2,border:`1px solid ${BORDER}`,padding:"1.25rem",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem" }}>
                <div>
                  <div style={{ color:MUTED,fontSize:"0.6rem",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.25rem" }}>ETH Price</div>
                  <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.5rem",color:TEXT }}>${gas.eth_price?.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ color:MUTED,fontSize:"0.6rem",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.25rem" }}>SOL Price</div>
                  <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.5rem",color:TEXT }}>${gas.sol_price?.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ color:MUTED,fontSize:"0.6rem",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.25rem" }}>ETH Transfer Cost</div>
                  <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.5rem",color:ICE }}>${gas.eth_transfer_cost_usd?.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ color:MUTED,fontSize:"0.6rem",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.25rem" }}>SOL Transfer Cost</div>
                  <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.5rem",color:"#9945ff" }}>${gas.sol_transfer_cost_usd?.toFixed(4)}</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ color:"#f87171",fontSize:"0.8rem" }}>Failed to load gas data. Please try again.</div>
        )}
      </div>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </main>
  )
}
