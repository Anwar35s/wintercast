const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function analyseWallet(address: string) {
  const res = await fetch(`${API_URL}/api/analyse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Analysis failed")
  }

  return res.json()
}
