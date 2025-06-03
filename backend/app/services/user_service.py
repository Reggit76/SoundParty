from app.repositories.user_repo import create_user, get_all_users, get_user_by_id, update_user, delete_user, get_user_by_username, register_user
from app.core.security import hash_password, verify_password

def create_new_user(conn, user_data):
    user_data["password_hash"] = hash_password(user_data["password"])
    return create_user(conn, user_data)

def get_all_users_service(conn):
    return get_all_users(conn)

def get_user_by_id_service(conn, user_id):
    return get_user_by_id(conn, user_id)

def update_user_service(conn, user_id, user_data):
    if "password" in user_data:
        user_data["password_hash"] = hash_password(user_data["password"])
    return update_user(conn, user_id, user_data)

def delete_user_service(conn, user_id):
    return delete_user(conn, user_id)

def authenticate_user(conn, username, password):
    user = get_user_by_username(conn, username)
    if not user or not verify_password(password, user[0]["password_hash"]):
        return None
    return user[0]

def register_new_user(conn, user_data):
    # Убираем confirm_password из данных перед сохранением
    if "confirm_password" in user_data:
        del user_data["confirm_password"]
    
    # password_hash уже должен быть установлен в вызывающем коде
    return create_user(conn, user_data)