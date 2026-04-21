"use client"
import { useEffect, useRef } from "react"

export default function AnimatedLayout({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener("resize", resize)

    const stars = Array.from({length:100}, ()=>({
      x: Math.random()*window.innerWidth,
      y: Math.random()*window.innerHeight,
      r: Math.random()*1.2+0.2,
      alpha: Math.random()*0.5+0.1,
      speed: Math.random()*0.2+0.05,
    }))

    const orbs = Array.from({length:4}, (_,i)=>({
      x: Math.random()*window.innerWidth,
      y: Math.random()*window.innerHeight,
      r: Math.random()*100+50,
      vx: (Math.random()-0.5)*0.3,
      vy: (Math.random()-0.5)*0.3,
      hue: [270,240,260,200][i],
      alpha: Math.random()*0.04+0.015,
    }))

    let animId: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      orbs.forEach(o => {
        o.x+=o.vx; o.y+=o.vy
        if(o.x<-o.r)o.x=canvas.width+o.r
        if(o.x>canvas.width+o.r)o.x=-o.r
        if(o.y<-o.r)o.y=canvas.height+o.r
        if(o.y>canvas.height+o.r)o.y=-o.r
        const g=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r)
        g.addColorStop(0,`hsla(${o.hue},80%,60%,${o.alpha})`)
        g.addColorStop(1,`hsla(${o.hue},80%,60%,0)`)
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fill()
      })
      stars.forEach(s => {
        s.y-=s.speed
        if(s.y<0){s.y=canvas.height;s.x=Math.random()*canvas.width}
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(200,180,255,${s.alpha})`; ctx.fill()
      })
      ctx.strokeStyle="rgba(153,69,255,0.025)"; ctx.lineWidth=1
      for(let x=0;x<canvas.width;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke()}
      for(let y=0;y<canvas.height;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke()}
      animId=requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize) }
  }, [])

  return (
    <div style={{background:"#000",minHeight:"100vh",position:"relative"}}>
      <canvas ref={canvasRef} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}/>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"radial-gradient(ellipse 100% 70% at 50% 0%, rgba(153,69,255,0.1) 0%, transparent 65%)"}}/>
      <div style={{position:"relative",zIndex:1}}>
        {children}
      </div>
    </div>
  )
}
