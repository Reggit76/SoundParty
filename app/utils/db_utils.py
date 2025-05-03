import psycopg2
from typing import List, Dict, Any, Optional

def execute_query(
    conn: psycopg2.extensions.connection,
    query: str,
    params: Optional[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """
    Выполняет SQL-запрос и возвращает результат в виде списка словарей
    """
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params or {})
            try:
                result = [dict(zip([desc[0] for desc in cursor.description], row)) for row in cursor.fetchall()]
            except psycopg2.ProgrammingError:
                result = []
            conn.commit()
            return result
    except psycopg2.Error as e:
        conn.rollback()
        raise Exception(f"Database error: {str(e)}")