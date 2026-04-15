from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analyse

app = FastAPI(title="WalletDNA API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyse.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "WalletDNA API running"}
