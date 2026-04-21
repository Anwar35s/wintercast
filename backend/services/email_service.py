import httpx, os

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
FROM_EMAIL = "alerts@wintercast.io"

async def send_welcome_email(to_email: str, wallet_address: str):
    if not RESEND_API_KEY:
        print("No RESEND_API_KEY set")
        return False
    short = f"{wallet_address[:6]}...{wallet_address[-4:]}"
    html = f"""<html><body style="background:#000;color:#f1f5f9;font-family:monospace;padding:40px 20px">
  <div style="max-width:560px;margin:0 auto">
    <div style="margin-bottom:24px"><span style="color:#f1f5f9;font-weight:800;font-size:18px">winter</span><span style="color:#9945ff;font-weight:800;font-size:18px">cast</span></div>
    <h1 style="color:#f1f5f9;font-size:24px;font-weight:800">You are now tracking {short}</h1>
    <p style="color:rgba(241,245,249,0.5);font-size:13px;line-height:1.7">You will receive alerts when this wallet makes moves over $10,000.</p>
    <a href="https://wintercast.io/profile/{wallet_address}" style="display:inline-block;background:#9945ff;color:#fff;text-decoration:none;padding:12px 24px;font-family:monospace;font-size:13px;font-weight:700;border-radius:6px">View Profile</a>
  </div>
</body></html>"""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post("https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
                json={"from": FROM_EMAIL, "to": [to_email], "subject": f"Tracking {short} on Wintercast", "html": html})
            print(f"Resend response: {r.status_code} {r.text}")
            return r.status_code == 200
    except Exception as e:
        print(f"Email error: {e}")
        return False

async def send_wallet_alert(to_email, wallet_address, value_usd, from_addr, to_addr, chain):
    if not RESEND_API_KEY:
        return False
    fmt = lambda n: f"${n/1e6:.1f}M" if n>=1e6 else f"${n/1e3:.0f}K" if n>=1e3 else f"${n:.0f}"
    short = lambda a: f"{a[:6]}...{a[-4:]}"
    html = f"""<html><body style="background:#000;color:#f1f5f9;font-family:monospace;padding:40px 20px">
  <div style="max-width:560px;margin:0 auto">
    <div style="margin-bottom:24px"><span style="color:#f1f5f9;font-weight:800;font-size:18px">winter</span><span style="color:#9945ff;font-weight:800;font-size:18px">cast</span></div>
    <div style="background:rgba(153,69,255,0.1);border-left:3px solid #9945ff;padding:20px;margin-bottom:24px">
      <div style="font-size:28px;font-weight:800;color:#f1f5f9">{fmt(value_usd)}</div>
      <div style="color:rgba(241,245,249,0.5);font-size:13px">{short(from_addr)} to {short(to_addr)} on {chain.upper()}</div>
    </div>
    <a href="https://wintercast.io/profile/{wallet_address}" style="display:inline-block;background:#9945ff;color:#fff;text-decoration:none;padding:12px 24px;font-family:monospace;font-size:13px;font-weight:700;border-radius:6px">View Profile</a>
  </div>
</body></html>"""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post("https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
                json={"from": FROM_EMAIL, "to": [to_email], "subject": f"Alert: {fmt(value_usd)} move on tracked wallet", "html": html})
            return r.status_code == 200
    except:
        return False
