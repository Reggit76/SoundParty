from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    username: str
    fullname: str
    email: str
    role_id: int

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str]
    fullname: Optional[str]
    email: Optional[str]
    password: Optional[str]
    role_id: Optional[int]

class UserResponse(UserBase):
    user_id: int

    class Config:
        from_attributes = True