import type { Metadata } from "next"
import { Space_Mono, Syne } from "next/font/google"
import "./globals.css"

const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" })
const syne = Syne({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-display" })

export const metadata: Metadata = {
  title: "WalletDNA — Know Every Wallet",
  description: "AI-powered crypto wallet personality profiler. Paste any address, get a full behavioural analysis.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${spaceMono.variable} ${syne.variable} bg-[#080b0f] text-[#e8e6e0] font-mono`}>
        {children}
      </body>
    </html>
  )
}
