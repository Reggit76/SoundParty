from pydantic import BaseModel, EmailStr
from typing import Optional

# Схема для регистрации
class RegisterRequest(BaseModel):
    username: str
    fullname: str
    email: EmailStr
    password: str
    confirm_password: str
    role_id: int = 3

# Схема для входа
class Login(BaseModel):
    username: str
    password: str
    confirm_password: Optional[str] = None
    fullname: Optional[str] = None
    email: Optional[EmailStr] = None
    role_id: int = 3

# Схема для токена
class Token(BaseModel):
    access_token: str
    token_type: str

# Схема для данных токена
class TokenData(BaseModel):
    username: str