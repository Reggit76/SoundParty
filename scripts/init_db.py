import os
import time
import psycopg2
from psycopg2 import OperationalError

def wait_for_db(max_retries=30):
    """Wait for the database to become available"""
    print("Waiting for database to become available...")
    
    retries = 0
    while retries < max_retries:
        try:
            conn = psycopg2.connect(
                dbname="soundparty",
                user="soundparty",
                password="soundparty",
                host="db"
            )
            conn.close()
            print("Database is available!")
            return True
        except OperationalError:
            retries += 1
            print(f"Database unavailable, waiting... (attempt {retries}/{max_retries})")
            time.sleep(1)
    
    return False

def init_db():
    """Initialize the database with schema"""
    try:
        # Wait for database
        if not wait_for_db():
            print("Error: Database did not become available in time")
            return False

        # Connect and execute schema
        conn = psycopg2.connect(
            dbname="soundparty",
            user="soundparty",
            password="soundparty",
            host="db"
        )
        
        with conn.cursor() as cur:
            # Read and execute schema file
            schema_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                     'migrations', 'init.sql')
            
            with open(schema_path, 'r') as f:
                schema_sql = f.read()
                cur.execute(schema_sql)
            
            conn.commit()
            print("Database schema initialized successfully!")
            return True
            
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    if not init_db():
        exit(1) 