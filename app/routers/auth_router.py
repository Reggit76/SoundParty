from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_db, put_db
from app.schemas.auth import Login, Token
from app.services.user_service import authenticate_user, register_new_user
from app.core.security import create_access_token
from app.config import settings
from datetime import timedelta

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user_route(login_data: Login):
    conn = get_db()
    try:
        existing_user = authenticate_user(conn, login_data.username, login_data.password)
        if existing_user:
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
            )
        user_data = {
            "username": login_data.username,
            "email": login_data.email,  # Use email from the form
            "password": login_data.password,
            "role_id": login_data.role_id if hasattr(login_data, "role_id") else 3,
        }
        register_new_user(conn, user_data)
        return {"message": "User successfully registered"}
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