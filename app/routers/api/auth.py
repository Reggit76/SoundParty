from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta
import psycopg2

from app.schemas.auth import Login, Token
from app.services.user_service import register_new_user, authenticate_user
from app.core.security import hash_password, create_access_token
from app.config import settings
from app.database import get_db, put_db


router = APIRouter(prefix="/api", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user_api(login_data: Login, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        if login_data.password != login_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пароли не совпадают"
            )

        user_data = {
            "username": login_data.username,
            "fullname": login_data.fullname,
            "email": login_data.email,
            "password_hash": hash_password(login_data.password),
            "role_id": login_data.role_id if hasattr(login_data, "role_id") else 3,
        }

        result = register_new_user(conn, user_data)
        return {"message": "Пользователь зарегистрирован", "user_id": result[0]["user_id"]}
    finally:
        put_db(conn)

@router.post("/login", response_model=Token)
def login_for_access_token(login_data: Login):
    conn = get_db()
    try:
        user = authenticate_user(conn, login_data.username, login_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["username"]}
        )
        return {"access_token": access_token, "token_type": "bearer"}
    finally:
        put_db(conn)
