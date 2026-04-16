from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from routers import analyse
import os

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Wintercast API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = [
    "https://wintercast.io",
    "https://www.wintercast.io",
    "https://wintercast.vercel.app",
]
if os.environ.get("ENVIRONMENT") == "development":
    ALLOWED_ORIGINS.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(analyse.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "Wintercast API running"}

@app.get("/debug")
def debug():
    return {
        "MORALIS_KEY": "set" if os.environ.get("MORALIS_API_KEY") else "MISSING",
        "HELIUS_KEY": "set" if os.environ.get("HELIUS_API_KEY") else "MISSING",
        "ANTHROPIC_KEY": "set" if os.environ.get("ANTHROPIC_API_KEY") else "MISSING",
    }

from routers import portfolio as portfolio_router
app.include_router(portfolio_router.router, prefix="/api")
