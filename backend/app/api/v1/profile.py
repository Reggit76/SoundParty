from fastapi import APIRouter, Depends, HTTPException
import psycopg2
from app.database import get_db, put_db
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import get_user_by_id_service, update_user_service
from app.core.dependencies import get_current_user
from app.repositories.user_repo import get_user_by_username

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
def get_current_user_profile(
    current_user: dict = Depends(get_current_user),
    conn: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        user = get_user_by_username(conn, current_user["username"])
        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        return user[0]
    finally:
        put_db(conn)

@router.put("/profile", response_model=UserResponse)
def update_current_user_profile(
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    conn: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        user = get_user_by_username(conn, current_user["username"])
        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        # Фильтруем только непустые поля
        update_data = {k: v for k, v in user_data.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="Нет данных для обновления")
        
        result = update_user_service(conn, user[0]["user_id"], update_data)
        if not result:
            raise HTTPException(status_code=404, detail="Ошибка обновления профиля")
        return result[0]
    finally:
        put_db(conn)

@router.get("/profile/teams")
def get_user_teams(
    current_user: dict = Depends(get_current_user),
    conn: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        from app.repositories.team_repo import get_teams_by_user_id
        from app.repositories.user_repo import get_user_by_username
        
        user = get_user_by_username(conn, current_user["username"])
        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        teams = get_teams_by_user_id(conn, user[0]["user_id"])
        return teams
    finally:
        put_db(conn)