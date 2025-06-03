from pydantic_settings import BaseSettings
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sound Party"
    SECRET_KEY: str
    DATABASE_URL: str
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]

settings = Settings() 