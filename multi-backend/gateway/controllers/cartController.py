from fastapi import APIRouter, Header
from models.schemas import CartItemSchema
import httpx
import os

router = APIRouter(prefix="/cartservice")

SPRING_URL = os.getenv("SPRING_URL", "http://localhost:8001/").rstrip("/") + "/"


@router.post("/add")
async def add_to_cart(item: CartItemSchema, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPRING_URL + "cart/add",
            json=item.model_dump(),
            headers={"Token": Token}
        )
    return response.json()


@router.get("/items")
async def get_cart(Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            SPRING_URL + "cart/items",
            headers={"Token": Token}
        )
    return response.json()
