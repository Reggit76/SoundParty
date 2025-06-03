# app/database.py
import psycopg2
from psycopg2 import pool
from dotenv import load_dotenv
import os

load_dotenv()

db_pool = None  # Глобальная переменная, инициализируемая в lifespan.py

def init_db_pool():
    global db_pool
    if db_pool is None:
        db_pool = psycopg2.pool.SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=os.getenv("DATABASE_URL")
        )
        print("✅ База данных: пул соединений инициализирован")

def get_db():
    global db_pool
    if db_pool is None:
        raise Exception("Database pool not initialized")
    return db_pool.getconn()

def put_db(conn):
    global db_pool
    if conn and db_pool:
        db_pool.putconn(conn)