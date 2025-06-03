from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/soundparty"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-here"  # В продакшене использовать безопасный ключ
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "SoundParty API"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

    @property
    def cors_origins(self) -> List[str]:
        """Обработка CORS origins из переменной окружения"""
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",")]
        return self.BACKEND_CORS_ORIGINS


settings = Settings()