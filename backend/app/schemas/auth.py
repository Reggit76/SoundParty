from pydantic import BaseModel
from typing import Optional

# Схема для входа
class Login(BaseModel):
    username: str
    password: str
    confirm_password: Optional[str] = None
    fullname: Optional[str] = None  # Добавляем поле для регистрации
    email: Optional[str] = None     # Добавляем поле для регистрации
    role_id: int = 3


# Схема для регистрации
class Register(BaseModel):
    username: str
    fullname: str
    email: str
    password: str
    confirm_password: str
    role_id: int = 3

# Схема для токена
class Token(BaseModel):
    access_token: str
    token_type: str

# Схема для данных токена
class TokenData(BaseModel):
    username: str