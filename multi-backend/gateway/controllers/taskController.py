from fastapi import APIRouter, Header
from models.schemas import TaskSchema
import httpx
import os

router = APIRouter(prefix="/taskservice")

TASK_URL = os.getenv("TASK_URL", "http://localhost:8002/").rstrip("/") + "/"


@router.post("/createtask")
async def create_task(task: TaskSchema, Token: str = Header(...)):
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            TASK_URL + "task/createtask",
            json=task.model_dump(),
            headers={"Token": Token}
        )
    return response.json()


@router.get("/getalltasks/{PAGE}/{SIZE}")
async def get_all_tasks(PAGE: int, SIZE: int, Token: str = Header(...)):
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.get(
            f"{TASK_URL}task/getalltasks/{PAGE}/{SIZE}",
            headers={"Token": Token}
        )
    return response.json()


@router.get("/gettask/{ID}")
async def get_task(ID: str, Token: str = Header(...)):
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.get(
            f"{TASK_URL}task/gettask/{ID}",
            headers={"Token": Token}
        )
    return response.json()


@router.put("/updatetask/{ID}")
async def update_task(ID: str, task: TaskSchema, Token: str = Header(...)):
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.put(
            f"{TASK_URL}task/updatetask/{ID}",
            json=task.model_dump(),
            headers={"Token": Token}
        )
    return response.json()


@router.delete("/deletetask/{ID}")
async def delete_task(ID: str, Token: str = Header(...)):
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.delete(
            f"{TASK_URL}task/deletetask/{ID}",
            headers={"Token": Token}
        )
    return response.json()


@router.get("/vectorsearch/{QUERY}")
async def vector_search(QUERY: str, Token: str = Header(...)):
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.get(
            f"{TASK_URL}task/vectorsearch/{QUERY}",
            headers={"Token": Token}
        )
    return response.json()
