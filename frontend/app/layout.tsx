import type { Metadata } from "next"
import { Space_Mono, Syne } from "next/font/google"
import "./globals.css"

const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" })
const syne = Syne({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-display" })

export const metadata: Metadata = {
  title: "Wintercast — The cold truth about every wallet",
  description: "AI-powered crypto wallet personality profiler. Paste any address, get a full behavioural forecast.",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧊</text></svg>" }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${spaceMono.variable} ${syne.variable}`} style={{ background: "#050810", margin: 0 }}>
        {children}
      </body>
    </html>
  )
}
