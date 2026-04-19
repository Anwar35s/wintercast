"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

const ICE = "#9945ff"
const BG = "#0a0520"
const BG2 = "rgba(153,69,255,0.04)"
const BORDER = "rgba(153,69,255,0.12)"
const TEXT = "#e2eaf7"
const MUTED = "rgba(241,245,249,0.4)"

const POPULAR_TOKENS = [
  { address: "0xdac17f958d2ee523a2206206994597c13d831ec7", symbol: "USDT", name: "Tether USD" },
  { address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC", name: "USD Coin" },
  { address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", symbol: "WBTC", name: "Wrapped Bitcoin" },
  { address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", symbol: "UNI", name: "Uniswap" },
  { address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", symbol: "AAVE", name: "Aave" },
  { address: "0x514910771af9ca656af840dff83e8264ecf986ca", symbol: "LINK", name: "Chainlink" },
]

export default function TokenSearchPage() {
  const router = useRouter()
  const [address, setAddress] = useState("")

  const handleAnalyse = () => {
    const addr = address.trim()
    if (!addr) return
    router.push(`/token/${encodeURIComponent(addr)}`)
  }

  return (
    <main style={{ background:BG,minHeight:"100vh",color:TEXT,fontFamily:"var(--font-mono)" }}>
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 120% 60% at 50% -10%, rgba(96,165,250,0.07) 0%, transparent 70%)" }} />
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1.1rem 2rem",background:"rgba(10,5,32,0.9)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${BORDER}` }}>
        <button onClick={()=>router.push("/")} style={{ background:"none",border:"none",color:MUTED,fontFamily:"var(--font-mono)",fontSize:"0.72rem",cursor:"pointer",letterSpacing:"0.08em" }}>← winter<span style={{ color:ICE }}>cast</span></button>
        <div style={{ color:MUTED,fontSize:"0.68rem",letterSpacing:"0.1em" }}>TOKEN DEEP DIVE</div>
        <div style={{ width:80 }} />
      </nav>

      <div style={{ maxWidth:700,margin:"0 auto",padding:"8rem 1.5rem 4rem",position:"relative",zIndex:1 }}>
        <div style={{ color:ICE,fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.5rem" }}>// Token Analysis</div>
        <h1 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(2rem,5vw,3.5rem)",letterSpacing:"-0.02em",marginBottom:"1rem" }}>Analyse any token.</h1>
        <p style={{ color:MUTED,fontSize:"0.82rem",lineHeight:1.8,marginBottom:"3rem",maxWidth:500 }}>
          Paste any ERC-20 token address to see price, market cap, top holders, concentration risk and more.
        </p>

        <div style={{ position:"relative",maxWidth:580,marginBottom:"1.5rem" }}>
          <input value={address} onChange={e=>setAddress(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAnalyse()}
            placeholder="0x token contract address"
            style={{ width:"100%",background:"rgba(153,69,255,0.05)",border:`1px solid rgba(153,69,255,0.2)`,color:TEXT,fontFamily:"var(--font-mono)",fontSize:"0.8rem",padding:"1.1rem 1.5rem",paddingRight:"140px",outline:"none" }} />
          <button onClick={handleAnalyse}
            style={{ position:"absolute",right:0,top:0,bottom:0,background:"linear-gradient(135deg,#9945ff,#627eea)",color:"#fff",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.72rem",fontWeight:700,padding:"0 1.5rem",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase" }}>
            Analyse →
          </button>
        </div>

        <div style={{ color:ICE,fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"1rem" }}>// Popular Tokens</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:1,background:BORDER,border:`1px solid ${BORDER}` }}>
          {POPULAR_TOKENS.map(t=>(
            <div key={t.address} onClick={()=>router.push(`/token/${t.address}`)}
              style={{ background:BG,padding:"1.25rem",cursor:"pointer",transition:"background 0.2s" }}
              onMouseEnter={e=>(e.currentTarget.style.background="rgba(153,69,255,0.05)")}
              onMouseLeave={e=>(e.currentTarget.style.background=BG)}>
              <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.1rem",color:ICE,marginBottom:"0.25rem" }}>{t.symbol}</div>
              <div style={{ color:MUTED,fontSize:"0.68rem" }}>{t.name}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>
    </main>
  )
}
