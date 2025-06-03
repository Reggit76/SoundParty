# app/core/lifespan.py
import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Управление жизненным циклом приложения:
    - Подключение к БД при запуске
    - Освобождение ресурсов при остановке
    """
    logger.info("🚀 Запуск приложения")
    try:
        from app.database import init_db_pool, close_db_pool
        init_db_pool()
        logger.info("✅ Пул соединений с БД инициализирован")
    except Exception as e:
        logger.error(f"❌ Ошибка инициализации БД: {str(e)}")
        raise

    yield  # Здесь работает приложение

    logger.info("🛑 Остановка приложения")
    try:
        close_db_pool()
        logger.info("🔌 Все соединения с БД закрыты")
    except Exception as e:
        logger.error(f"❌ Ошибка при закрытии соединений: {str(e)}")