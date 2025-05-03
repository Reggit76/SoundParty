from pydantic import BaseModel

# Схема для входа
class Login(BaseModel):
    username: str
    password: str

# Схема для токена
class Token(BaseModel):
    access_token: str
    token_type: str

# Схема для данных токена
class TokenData(BaseModel):
    username: str