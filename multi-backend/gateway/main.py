from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.init import *

app = FastAPI()
origins = ["http://localhost:5173"]

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
