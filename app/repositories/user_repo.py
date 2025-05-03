from app.utils.db_utils import execute_query

def create_user(conn, user_data):
    query = """
    INSERT INTO "Users" 
    (username, fullname, email, password_hash, role_id)
    VALUES 
    (%(username)s, %(fullname)s, %(email)s, %(password_hash)s, %(role_id)s)
    RETURNING user_id
    """
    return execute_query(conn, query, user_data)

def get_all_users(conn):
    query = """
    SELECT user_id, username, fullname, email, role_id
    FROM "Users"
    """
    return execute_query(conn, query)

def get_user_by_id(conn, user_id):
    query = """
    SELECT user_id, username, fullname, email, role_id
    FROM "Users"
    WHERE user_id = %(user_id)s
    """
    return execute_query(conn, query, {"user_id": user_id})

def update_user(conn, user_id, user_data):
    query = """
    UPDATE "Users"
    SET 
        username = %(username)s,
        fullname = %(fullname)s,
        email = %(email)s,
        password_hash = %(password_hash)s,
        role_id = %(role_id)s
    WHERE user_id = %(user_id)s
    RETURNING *
    """
    params = {**user_data, "user_id": user_id}
    return execute_query(conn, query, params)

def delete_user(conn, user_id):
    query = """
    DELETE FROM "Users"
    WHERE user_id = %(user_id)s
    RETURNING *
    """
    return execute_query(conn, query, {"user_id": user_id})


def get_user_by_username(conn, username):
    query = """
    SELECT user_id, username, email, password_hash, role_id
    FROM "Users"
    WHERE username = %(username)s
    """
    return execute_query(conn, query, {"username": username})

def register_user(conn, user_data):
    """
    Регистрация пользователя через хранимую процедуру
    """
    query = """
    SELECT * FROM register_user(
        %(username)s, 
        %(fullname)s, 
        %(email)s, 
        %(password_hash)s, 
        %(role_id)s
    )
    """
    return execute_query(conn, query, user_data)