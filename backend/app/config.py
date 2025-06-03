from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/soundparty"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-here"  # В продакшене использовать безопасный ключ
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "SoundParty API"
    
    class Config:
        case_sensitive = True


settings = Settings() 