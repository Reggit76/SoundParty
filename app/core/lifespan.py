import logging
import psycopg2
from psycopg2 import pool
from contextlib import asynccontextmanager
from fastapi import FastAPI
from typing import AsyncIterator
from dotenv import load_dotenv
import os

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Загрузка переменных окружения
load_dotenv()

# Глобальная переменная для хранения пула соединений
db_pool = None

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    Управление жизненным циклом приложения:
    - Подключение к БД при запуске
    - Освобождение ресурсов при остановке
    """
    global db_pool
    
    try:
        # 🚀 Инициализация пула соединений при запуске
        db_pool = psycopg2.pool.SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=os.getenv("DATABASE_URL")
        )
        logger.info("✅ Успешно подключено к базе данных")
    except Exception as e:
        logger.error(f"❌ Ошибка подключения к БД: {str(e)}")
        raise

    try:
        # ⏳ Основной цикл работы приложения
        yield
    finally:
        # 🛑 Освобождение ресурсов при остановке
        if db_pool:
            db_pool.closeall()
            logger.info("🔌 Все соединения с БД закрыты")