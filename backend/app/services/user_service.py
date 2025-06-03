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
    # Проверяем confirm_password если есть
    if "confirm_password" in user_data and user_data.get("password") != user_data.get("confirm_password"):
        raise ValueError("Пароли не совпадают")

    # Удаляем confirm_password из данных, так как его не нужно сохранять
    user_data_clean = {k: v for k, v in user_data.items() if k != "confirm_password"}
    
    # Хешируем пароль если он есть в исходном виде
    if "password" in user_data_clean:
        user_data_clean["password_hash"] = hash_password(user_data_clean["password"])
        del user_data_clean["password"]  # Удаляем исходный пароль
    
    # Используем register_user из репозитория для проверки уникальности
    from app.repositories.user_repo import register_user
    return register_user(conn, user_data_clean)