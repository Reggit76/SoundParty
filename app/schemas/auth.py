from pydantic import BaseModel
from typing import Optional

# Схема для входа
class Login(BaseModel):
    username: str
    password: str
    confirm_password: Optional[str] = None
    role_id: int = 3

# Схема для токена
class Token(BaseModel):
    access_token: str
    token_type: str

# Схема для данных токена
class TokenData(BaseModel):
    username: str