import psycopg2
from psycopg2 import pool
from dotenv import load_dotenv
import os

load_dotenv()

# Глобальная переменная будет инициализирована через lifespan
db_pool = None  # ← Инициализируется как None

def get_db():
    """Возвращает соединение из пула"""
    global db_pool
    if db_pool is None:
        raise Exception("Database pool not initialized")
    return db_pool.getconn()

def put_db(conn):
    """Возвращает соединение в пул"""
    global db_pool
    if conn and db_pool:
        db_pool.putconn(conn)