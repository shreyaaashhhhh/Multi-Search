from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.init import *
import os

app = FastAPI()
origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
app.include_router(AuthenticationRouter)
app.include_router(ProductRouter)
app.include_router(CartRouter)
app.include_router(TaskRouter)

@app.get("/")
def home():
    return "Started FastAPI on 15.4.2026...."
