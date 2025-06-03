from fastapi import Depends, HTTPException, status
import psycopg2

from app.core.security import decode_access_token, oauth2_scheme
from app.database import get_db, put_db

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    return {"username": username}

def get_current_user_data(current_user: dict = Depends(get_current_user)):
    return current_user

def get_current_admin(token: str = Depends(oauth2_scheme)):
    from app.repositories.user_repo import get_user_by_username
    
    # Проверяем токен
    current_user = get_current_user(token)
    
    # Получаем данные пользователя
    conn = get_db()
    try:
        user = get_user_by_username(conn, current_user["username"])
        if not user or user[0]["role_id"] != 1:
            raise HTTPException(status_code=403, detail="Доступ запрещён: требуются права администратора")
        return user[0]
    finally:
        put_db(conn)

def get_current_organizer_or_admin(token: str = Depends(oauth2_scheme)):
    from app.repositories.user_repo import get_user_by_username
    
    # Проверяем токен
    current_user = get_current_user(token)
    
    # Получаем данные пользователя
    conn = get_db()
    try:
        user = get_user_by_username(conn, current_user["username"])
        if not user or user[0]["role_id"] not in [1, 2]:  # admin или organizer
            raise HTTPException(status_code=403, detail="Доступ запрещён: требуются права организатора или администратора")
        return user[0]
    finally:
        put_db(conn)