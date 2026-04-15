from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analyse
import os

app = FastAPI(title="Wintercast API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
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
