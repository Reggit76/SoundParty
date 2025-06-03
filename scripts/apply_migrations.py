import os
import psycopg2
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Получаем параметры подключения к базе данных
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "sound_party")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

def apply_migrations():
    # Подключаемся к базе данных
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    
    try:
        # Создаем курсор
        cur = conn.cursor()
        
        # Читаем и выполняем миграцию
        with open("migrations/add_status_to_bookings.sql", "r", encoding="utf-8") as f:
            migration_sql = f.read()
            cur.execute(migration_sql)
        
        # Подтверждаем изменения
        conn.commit()
        print("Миграция успешно применена!")
        
    except Exception as e:
        print(f"Ошибка при применении миграции: {str(e)}")
        conn.rollback()
    
    finally:
        # Закрываем соединение
        cur.close()
        conn.close()

if __name__ == "__main__":
    apply_migrations() 