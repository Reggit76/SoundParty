from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta
import psycopg2

from app.schemas.auth import Login, Token
from app.services.user_service import register_new_user, authenticate_user
from app.core.security import hash_password, create_access_token
from app.config import settings
from app.database import get_db, put_db


router = APIRouter(tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user_api(login_data: Login, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        if login_data.password != login_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пароли не совпадают"
            )

        # Проверяем, что все обязательные поля заполнены
        if not login_data.username or not login_data.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Имя пользователя и пароль обязательны"
            )

        # Подготавливаем данные пользователя
        user_data = {
            "username": login_data.username,
            "fullname": getattr(login_data, 'fullname', login_data.username),  # Если fullname не передан, используем username
            "email": getattr(login_data, 'email', ''),
            "password_hash": hash_password(login_data.password),
            "role_id": getattr(login_data, 'role_id', 3),
        }

        # Регистрируем пользователя
        result = register_new_user(conn, user_data)
        user_id = result[0]["user_id"]
        
        # Возвращаем успешный ответ с ID пользователя
        return {
            "message": "Пользователь успешно зарегистрирован", 
            "user_id": user_id,
            "success": True
        }
    except HTTPException:
        raise  # Перебрасываем HTTP исключения как есть
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при регистрации: {str(e)}"
        )
    finally:
        put_db(conn)

@router.post("/login", response_model=Token)
def login_for_access_token(login_data: Login, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        user = authenticate_user(conn, login_data.username, login_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверное имя пользователя или пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["username"]}
        )
        return {"access_token": access_token, "token_type": "bearer"}
    finally:
        put_db(conn)