from fastapi import APIRouter, Depends, HTTPException
import psycopg2
from app.database import get_db, put_db
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import create_new_user, get_all_users_service, get_user_by_id_service, update_user_service, delete_user_service
from app.core.dependencies import get_current_user_data
from app.repositories.user_repo import get_user_by_username

router = APIRouter()

@router.post("/users", response_model=UserResponse)
def create_user_route(user_data: UserCreate, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        result = create_new_user(conn, user_data.dict())
        return result[0]
    finally:
        put_db(conn)

@router.get("/users", response_model=list[UserResponse])
def get_all_users_route(conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        return get_all_users_service(conn)
    finally:
        put_db(conn)

@router.get("/users/{user_id}", response_model=UserResponse)
def get_user_by_id_route(user_id: int, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        result = get_user_by_id_service(conn, user_id)
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        return result[0]
    finally:
        put_db(conn)

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user_route(user_id: int, user_data: UserCreate, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        result = update_user_service(conn, user_id, user_data.dict())
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        return result[0]
    finally:
        put_db(conn)

@router.delete("/users/{user_id}")
def delete_user_route(user_id: int, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        result = delete_user_service(conn, user_id)
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "User deleted"}
    finally:
        put_db(conn)

@router.get("/users/me", response_model=UserResponse)
def get_current_user_route(current_user: dict = Depends(get_current_user_data), conn: psycopg2.extensions.connection = Depends(get_db)):
    """Получить данные текущего пользователя"""
    try:
        user = get_user_by_username(conn, current_user["username"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user[0]
    finally:
        put_db(conn)