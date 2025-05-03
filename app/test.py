# test_db.py
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()
conn = psycopg2.connect(os.getenv("DATABASE_URL"), client_encoding='utf8')
print("Подключение успешно!")