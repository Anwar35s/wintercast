from fastapi import APIRouter
import time

router = APIRouter()

@router.get("/leaderboard")
async def get_leaderboard():
    return {"leaderboard": [], "total_analysed": 0}

@router.get("/recent")
async def get_recent():
    return {"recent": []}
