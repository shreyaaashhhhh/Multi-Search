from pydantic import BaseModel
from typing import Optional
class SignupSchema(BaseModel):
   fullname: str
   phone: str
   email: str
   password: str

class SigninSchema(BaseModel):
    username: str
    password: str

class CartItemSchema(BaseModel):
    productId: int
    productName: str
    actualAmount: int
    amount: int = 1

class TaskSchema(BaseModel):
    title: str
    description: str
    createdby: Optional[int] = None
    assignedto: int
    assignedEmail: Optional[str] = None
    priority: int
    deadline: str
    status: int
