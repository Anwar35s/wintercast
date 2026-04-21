import httpx, os

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
FROM_EMAIL = "alerts@wintercast.io"

async def send_wallet_alert(to_email: str, wallet_address: str, move_value_usd: float, from_addr: str, to_addr: str, chain: str):
    if not RESEND_API_KEY:
        return False
    
    short = lambda a: f"{a[:6]}...{a[-4:]}"
    fmt = lambda n: f"${n/1e6:.1f}M" if n >= 1e6 else f"${n/1e3:.0f}K" if n >= 1e3 else f"${n:.0f}"
    
    html = f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#000;color:#f1f5f9;font-family:monospace;padding:40px 20px;margin:0">
  <div style="max-width:560px;margin:0 auto">
    <div style="margin-bottom:24px">
      <span style="color:#f1f5f9;font-weight:800;font-size:18px">winter</span><span style="color:#9945ff;font-weight:800;font-size:18px">cast</span>
    </div>
    <div style="background:rgba(153,69,255,0.1);border:1px solid rgba(153,69,255,0.3);border-left:3px solid #9945ff;padding:20px;border-radius:0 8px 8px 0;margin-bottom:24px">
      <div style="color:rgba(241,245,249,0.5);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px">🚨 Wallet Alert</div>
      <div style="font-size:28px;font-weight:800;color:#f1f5f9;margin-bottom:4px">{fmt(move_value_usd)}</div>
      <div style="color:rgba(241,245,249,0.5);font-size:13px">{short(from_addr)} → {short(to_addr)} · {chain.upper()}</div>
    </div>
    <div style="margin-bottom:24px">
      <div style="color:rgba(241,245,249,0.5);font-size:12px;margin-bottom:8px">Tracked wallet:</div>
      <div style="color:#9945ff;font-size:13px;font-family:monospace">{wallet_address}</div>
    </div>
    <a href="https://wintercast.io/profile/{wallet_address}" style="display:inline-block;background:#9945ff;color:#fff;text-decoration:none;padding:12px 24px;font-family:monospace;font-size:13px;font-weight:700;letter-spacing:0.06em;border-radius:6px">View Profile →</a>
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08)">
      <div style="color:rgba(241,245,249,0.25);font-size:11px">You're receiving this because you're tracking this wallet on <a href="https://wintercast.io/track" style="color:#9945ff">wintercast.io</a></div>
    </div>
  </div>
</body>
</html>"""

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
                json={
                    "from": FROM_EMAIL,
                    "to": [to_email],
                    "subject": f"🚨 Wallet Alert: {fmt(move_value_usd)} move detected",
                    "html": html,
                }
            )
            return r.status_code == 200
    except:
        return False

async def send_welcome_email(to_email: str, wallet_address: str):
    if not RESEND_API_KEY:
        return False
    
    short = f"{wallet_address[:6]}...{wallet_address[-4:]}"
    
    html = f"""
<!DOCTYPE html>
<html>
<body style="background:#000;color:#f1f5f9;font-family:monospace;padding:40px 20px;margin:0">
  <div style="max-width:560px;margin:0 auto">
    <div style="margin-bottom:24px">
      <span style="color:#f1f5f9;font-weight:800;font-size:18px">winter</span><span style="color:#9945ff;font-weight:800;font-size:18px">cast</span>
    </div>
    <h1 style="color:#f1f5f9;font-size:24px;font-weight:800;margin-bottom:12px">You're now tracking {short}</h1>
    <p style="color:rgba(241,245,249,0.5);font-size:13px;line-height:1.7;margin-bottom:24px">You'll receive an email alert whenever this wallet makes a significant move. We monitor for transactions over $10,000.</p>
    <a href="https://wintercast.io/profile/{wallet_address}" style="display:inline-block;background:#9945ff;color:#fff;text-decoration:none;padding:12px 24px;font-family:monospace;font-size:13px;font-weight:700;letter-spacing:0.06em;border-radius:6px">View Profile →</a>
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08)">
      <div style="color:rgba(241,245,249,0.25);font-size:11px">Manage your tracked wallets at <a href="https://wintercast.io/track" style="color:#9945ff">wintercast.io/track</a></div>
    </div>
  </div>
</body>
</html>"""

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
                json={
                    "from": FROM_EMAIL,
                    "to": [to_email],
                    "subject": f"✅ Now tracking {short} on Wintercast",
                    "html": html,
                }
            )
            return r.status_code == 200
    except:
        return False
