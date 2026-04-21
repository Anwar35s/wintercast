"use client"
import AnimatedLayout from "@/app/components/AnimatedLayout"
import { useState } from "react"
import { useRouter } from "next/navigation"

const ICE = "#9945ff"
const BG = "transparent"
const BG2 = "rgba(153,69,255,0.04)"
const BORDER = "rgba(153,69,255,0.12)"
const TEXT = "#e2eaf7"
const MUTED = "rgba(241,245,249,0.4)"
const API_URL = "https://wintercast-production.up.railway.app"

export default function TrackPage() {
  const router = useRouter()
  const [address, setAddress] = useState("")
  const [email, setEmail] = useState("")
  const [threshold, setThreshold] = useState("50000")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [tracked, setTracked] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try { return JSON.parse(localStorage.getItem("tracked_wallets") || "[]") } catch { return [] }
    }
    return []
  })

  const handleTrack = async () => {
    if (!address.trim() || !email.trim()) { setError("Enter both wallet address and email"); return }
    if (!email.includes("@")) { setError("Enter a valid email address"); return }
    setLoading(true)
    setError("")
    try {
      const r = await fetch(`${API_URL}/api/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim(), email: email.trim(), threshold_usd: parseInt(threshold) })
      })
      const data = await r.json()
      if (data.success) {
        const newTracked = [...tracked, { address: address.trim(), email: email.trim(), threshold: parseInt(threshold), added: new Date().toISOString() }]
        setTracked(newTracked)
        localStorage.setItem("tracked_wallets", JSON.stringify(newTracked))
        setSuccess(true)
        setAddress("")
      } else setError(data.error || "Failed to add tracking")
    } catch { setError("Failed to connect. Please try again.") }
    setLoading(false)
  }

  const removeTracked = (addr: string) => {
    const updated = tracked.filter(w => w.address !== addr)
    setTracked(updated)
    localStorage.setItem("tracked_wallets", JSON.stringify(updated))
  }

  const short = (addr: string) => `${addr.slice(0,8)}...${addr.slice(-6)}`

  return (
    <AnimatedLayout>
    <main style={{ background:"transparent",minHeight:"100vh",color:TEXT,fontFamily:"var(--font-mono)" }}>
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 120% 60% at 50% -10%, rgba(96,165,250,0.07) 0%, transparent 70%)" }} />
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1.1rem 2rem",background:"rgba(0,0,0,0.92)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${BORDER}` }}>
        <button onClick={()=>router.push("/")} style={{ background:"none",border:"none",color:MUTED,fontFamily:"var(--font-mono)",fontSize:"0.72rem",cursor:"pointer",letterSpacing:"0.08em" }}>← winter<span style={{ color:ICE }}>cast</span></button>
        <div style={{ color:MUTED,fontSize:"0.68rem",letterSpacing:"0.1em" }}>WALLET TRACKER</div>
        <div style={{ width:80 }} />
      </nav>

      <div style={{ maxWidth:700,margin:"0 auto",padding:"5rem 1.5rem 4rem",position:"relative",zIndex:1 }}>
        <div style={{ color:ICE,fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem" }}>// Wallet Tracker</div>
        <h1 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(2rem,4vw,3rem)",letterSpacing:"-0.02em",marginBottom:"0.75rem" }}>Never miss a move.</h1>
        <p style={{ color:MUTED,fontSize:"0.82rem",lineHeight:1.8,marginBottom:"3rem",maxWidth:500 }}>
          Track any wallet and get an email alert the moment they make a large move. Perfect for following smart money or monitoring your own wallets.
        </p>

        {success ? (
          <div style={{ background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.25)",padding:"2rem",marginBottom:"2rem",textAlign:"center" }}>
            <div style={{ fontSize:"2rem",marginBottom:"1rem" }}>✅</div>
            <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.2rem",color:"#4ade80",marginBottom:"0.5rem" }}>Wallet tracked!</div>
            <div style={{ color:MUTED,fontSize:"0.78rem" }}>You'll get an email when this wallet makes a move over ${parseInt(threshold).toLocaleString()}.</div>
            <button onClick={()=>setSuccess(false)} style={{ marginTop:"1.5rem",background:"transparent",border:`1px solid ${BORDER}`,color:ICE,fontFamily:"var(--font-mono)",fontSize:"0.72rem",padding:"0.6rem 1.5rem",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase" }}>Track Another →</button>
          </div>
        ) : (
          <div style={{ background:BG2,border:`1px solid rgba(153,69,255,0.2)`,borderTop:`2px solid ${ICE}`,padding:"2rem",marginBottom:"2rem" }}>
            <div style={{ display:"flex",flexDirection:"column",gap:"1rem" }}>
              <div>
                <div style={{ color:MUTED,fontSize:"0.6rem",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.5rem" }}>Wallet Address</div>
                <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="0x... or Solana address"
                  style={{ width:"100%",background:"rgba(153,69,255,0.05)",border:`1px solid rgba(153,69,255,0.2)`,color:TEXT,fontFamily:"var(--font-mono)",fontSize:"0.78rem",padding:"0.85rem 1rem",outline:"none" }} />
              </div>
              <div>
                <div style={{ color:MUTED,fontSize:"0.6rem",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.5rem" }}>Your Email</div>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email"
                  style={{ width:"100%",background:"rgba(153,69,255,0.05)",border:`1px solid rgba(153,69,255,0.2)`,color:TEXT,fontFamily:"var(--font-mono)",fontSize:"0.78rem",padding:"0.85rem 1rem",outline:"none" }} />
              </div>
              <div>
                <div style={{ color:MUTED,fontSize:"0.6rem",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.5rem" }}>Alert Threshold (USD)</div>
                <div style={{ display:"flex",gap:"0.5rem",flexWrap:"wrap" }}>
                  {[["10000","$10K"],["50000","$50K"],["100000","$100K"],["1000000","$1M"]].map(([val,label])=>(
                    <button key={val} onClick={()=>setThreshold(val)}
                      style={{ background:threshold===val?"rgba(153,69,255,0.15)":BG2,border:`1px solid ${threshold===val?"rgba(153,69,255,0.4)":BORDER}`,color:threshold===val?ICE:MUTED,fontFamily:"var(--font-mono)",fontSize:"0.72rem",padding:"0.5rem 1rem",cursor:"pointer",letterSpacing:"0.06em" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {error && <div style={{ color:"#f87171",fontSize:"0.72rem" }}>{error}</div>}
              <button onClick={handleTrack} disabled={loading}
                style={{ background:"linear-gradient(135deg,#9945ff,#627eea)",color:"#fff",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.78rem",fontWeight:700,padding:"0.9rem",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase",opacity:loading?0.6:1 }}>
                {loading?"SETTING UP TRACKER...":"Track Wallet →"}
              </button>
            </div>
          </div>
        )}

        {tracked.length > 0 && (
          <div>
            <div style={{ color:ICE,fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1rem" }}>// Tracked Wallets ({tracked.length})</div>
            <div style={{ display:"flex",flexDirection:"column",gap:1,background:BORDER,border:`1px solid ${BORDER}` }}>
              {tracked.map((w,i)=>(
                <div key={i} style={{ background:BG,padding:"1rem 1.25rem",display:"flex",alignItems:"center",gap:"1rem" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.78rem",color:TEXT,marginBottom:"0.25rem" }}>{short(w.address)}</div>
                    <div style={{ fontSize:"0.65rem",color:MUTED }}>{w.email} · alerts over ${w.threshold?.toLocaleString()}</div>
                  </div>
                  <button onClick={()=>router.push(`/profile/${encodeURIComponent(w.address)}`)}
                    style={{ background:BG2,border:`1px solid ${BORDER}`,color:ICE,fontFamily:"var(--font-mono)",fontSize:"0.62rem",padding:"0.4rem 0.75rem",cursor:"pointer",letterSpacing:"0.06em",textTransform:"uppercase" }}>
                    Profile
                  </button>
                  <button onClick={()=>removeTracked(w.address)}
                    style={{ background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",color:"#f87171",fontFamily:"var(--font-mono)",fontSize:"0.62rem",padding:"0.4rem 0.75rem",cursor:"pointer",letterSpacing:"0.06em",textTransform:"uppercase" }}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop:"2rem",background:BG2,border:`1px solid ${BORDER}`,padding:"1.25rem" }}>
          <div style={{ color:ICE,fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem" }}>// How it works</div>
          <div style={{ color:MUTED,fontSize:"0.75rem",lineHeight:1.8 }}>
            Wintercast monitors your tracked wallets every 60 seconds. When a move exceeds your threshold, we send you an email with the full details and a link to their Wintercast profile.
          </div>
        </div>
      </div>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>
    </main>
    </AnimatedLayout>
  )
}
