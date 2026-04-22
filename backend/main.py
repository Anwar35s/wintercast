from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from routers import analyse, leaderboard, whales, portfolio, tracking, token, gas, nft, pnl, labels
from services.security import check_honeypot, check_blocked, check_suspicious_headers, get_client_ip, log_request, log_security_event, REQUEST_LOG, BLOCKED_IPS, SUSPICIOUS_IPS
import os, time, logging

logging.basicConfig(level=logging.INFO)
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Wintercast API", version="2.0.0", docs_url=None, redoc_url=None)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = ["https://wintercast.io","https://www.wintercast.io","https://wintercast.vercel.app","http://localhost:8082","http://localhost:3000","http://localhost:19006"]
if os.environ.get("ENVIRONMENT") == "development":
    ALLOWED_ORIGINS.append("http://localhost:3000")

app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_methods=["GET","POST"], allow_headers=["Content-Type"])

@app.middleware("http")
async def security_middleware(request: Request, call_next):
    start = time.time()
    ip = get_client_ip(request)
    path = str(request.url.path)
    check_blocked(ip)
    if check_honeypot(path, ip):
        log_request(request, 404, (time.time()-start)*1000)
        return JSONResponse(status_code=404, content={"detail": "Not found"})
    try:
        check_suspicious_headers(request, ip)
    except HTTPException as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.detail})
    response = await call_next(request)
    log_request(request, response.status_code, (time.time()-start)*1000)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Cache-Control"] = "no-store"
    return response

@app.api_route("/admin", methods=["GET","POST"])
@app.api_route("/wp-admin", methods=["GET","POST"])
@app.api_route("/.env", methods=["GET","POST"])
@app.api_route("/phpmyadmin", methods=["GET","POST"])
@app.api_route("/.git/config", methods=["GET","POST"])
async def honeypot(request: Request):
    return JSONResponse(status_code=404, content={"detail": "Not found"})

app.include_router(analyse.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(whales.router, prefix="/api")
app.include_router(portfolio.router, prefix="/api")
app.include_router(tracking.router, prefix="/api")
app.include_router(token.router, prefix="/api")
app.include_router(gas.router, prefix="/api")
app.include_router(nft.router, prefix="/api")
app.include_router(pnl.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "ok", "version": "2.0"}

MONITOR_KEY = os.environ.get("MONITOR_KEY", "")

@app.get("/internal/stats")
def stats(key: str = ""):
    if not MONITOR_KEY or key != MONITOR_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")
    return {"blocked_ips": len(BLOCKED_IPS), "recent_requests": REQUEST_LOG[-50:]}

from routers import market as market_router
from routers import labels as labels_router
app.include_router(market_router.router, prefix="/api")
app.include_router(labels_router.router, prefix="/api")
