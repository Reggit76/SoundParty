# app/database.py
import os
import psycopg2
from psycopg2.pool import SimpleConnectionPool
from contextlib import contextmanager

# Получаем параметры подключения из переменных окружения
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://soundparty:soundparty@localhost:5432/soundparty')

# Глобальная переменная для пула соединений
pool = None

# Разбираем URL для получения параметров подключения
def parse_db_url(url):
    # postgresql://user:password@host:port/dbname
    parts = url.split('://', 1)[1]
    auth, rest = parts.split('@', 1)
    user, password = auth.split(':', 1)
    host_port, dbname = rest.split('/', 1)
    if ':' in host_port:
        host, port = host_port.split(':', 1)
        port = int(port)
    else:
        host = host_port
        port = 5432
    return {
        'dbname': dbname,
        'user': user,
        'password': password,
        'host': host,
        'port': port
    }

def init_db_pool():
    """Инициализация пула соединений с базой данных"""
    global pool
    if pool is None:
        db_params = parse_db_url(DATABASE_URL)
        pool = SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            **db_params
        )
    return pool

def get_db():
    """Получить соединение из пула"""
    if pool is None:
        init_db_pool()
    conn = pool.getconn()
    try:
        return conn
    except:
        pool.putconn(conn)
        raise

def put_db(conn):
    """Вернуть соединение в пул"""
    if pool is not None:
        pool.putconn(conn)

@contextmanager
def get_db_connection():
    """Контекстный менеджер для работы с соединением"""
    conn = get_db()
    try:
        yield conn
    finally:
        put_db(conn)

def close_db_pool():
    """Закрыть пул соединений"""
    global pool
    if pool is not None:
        pool.closeall()
        pool = None