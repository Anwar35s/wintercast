"use client"
import AnimatedLayout from "@/app/components/AnimatedLayout"
import { useRouter } from "next/navigation"

export default function PricingPage() {
  const router = useRouter()
  const ICE = "#9945ff"
  const BG = "#0a0520"
  const BORDER = "rgba(153,69,255,0.12)"
  const TEXT = "#e2eaf7"
  const MUTED = "rgba(241,245,249,0.4)"

  return (
    <AnimatedLayout>
    <main style={{ background:"rgba(0,0,0,0.85)",minHeight:"100vh",color:TEXT,fontFamily:"var(--font-mono)" }}>
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 120% 60% at 50% -10%, rgba(96,165,250,0.07) 0%, transparent 70%)" }} />
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1.1rem 2rem",background:"rgba(0,0,0,0.92)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${BORDER}` }}>
        <button onClick={()=>router.push("/")} style={{ background:"none",border:"none",color:MUTED,fontFamily:"var(--font-mono)",fontSize:"0.72rem",cursor:"pointer",letterSpacing:"0.08em" }}>← winter<span style={{ color:ICE }}>cast</span></button>
        <div style={{ color:MUTED,fontSize:"0.68rem",letterSpacing:"0.1em" }}>PRICING</div>
        <div style={{ width:80 }} />
      </nav>
      <div style={{ maxWidth:600,margin:"0 auto",padding:"8rem 1.5rem 4rem",position:"relative",zIndex:1,textAlign:"center" }}>
        <div style={{ color:ICE,fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.75rem" }}>// Pricing</div>
        <h1 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"clamp(2rem,5vw,3.5rem)",letterSpacing:"-0.02em",marginBottom:"1rem" }}>Free during beta.</h1>
        <p style={{ color:MUTED,fontSize:"0.85rem",lineHeight:1.8,marginBottom:"3rem",maxWidth:400,margin:"0 auto 3rem" }}>Wintercast is completely free while we are in beta. No credit card, no account, no limits.</p>
        <div style={{ background:"rgba(153,69,255,0.04)",border:"1px solid rgba(153,69,255,0.25)",borderTop:`2px solid ${ICE}`,padding:"2.5rem",marginBottom:"2rem" }}>
          <div style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"3rem",color:ICE,marginBottom:"0.25rem" }}>£0</div>
          <div style={{ color:MUTED,fontSize:"0.72rem",marginBottom:"2rem" }}>forever, during beta</div>
          <div style={{ display:"flex",flexDirection:"column",gap:"0.75rem",marginBottom:"2rem",textAlign:"left" }}>
            {["Unlimited wallet analyses","Full AI personality profiles","Next-move predictions","Wallet comparison","Shareable cards","EVM + Solana support","Live whale feed","Portfolio X-ray"].map(f=>(
              <div key={f} style={{ display:"flex",alignItems:"center",gap:"0.75rem",fontSize:"0.78rem" }}>
                <span style={{ color:"#4ade80" }}>✓</span>
                <span style={{ color:TEXT }}>{f}</span>
              </div>
            ))}
          </div>
          <button onClick={()=>router.push("/")} style={{ width:"100%",background:"linear-gradient(135deg,#9945ff,#627eea)",color:"#fff",border:"none",fontFamily:"var(--font-mono)",fontSize:"0.78rem",fontWeight:700,padding:"1rem",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase" }}>
            Start Analysing →
          </button>
        </div>
        <div style={{ background:"rgba(153,69,255,0.04)",border:`1px solid ${BORDER}`,padding:"1.5rem",textAlign:"left" }}>
          <div style={{ color:ICE,fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.75rem" }}>// Coming soon</div>
          <div style={{ color:MUTED,fontSize:"0.75rem",lineHeight:1.8 }}>Pro plan at £9/mo — unlimited history, PDF exports, API access, and priority support. Join the waitlist to get 3 months free when we launch.</div>
          <a href="mailto:hello@wintercast.io?subject=Wintercast Pro Waitlist" style={{ display:"inline-block",marginTop:"1rem",color:ICE,fontSize:"0.72rem",letterSpacing:"0.08em",textDecoration:"underline",textUnderlineOffset:3 }}>Join waitlist →</a>
        </div>
        <div style={{ marginTop:"2rem",color:MUTED,fontSize:"0.68rem" }}>Questions? <a href="mailto:hello@wintercast.io" style={{ color:ICE }}>hello@wintercast.io</a></div>
      </div>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>
    </main>
    </AnimatedLayout>
  )
}
