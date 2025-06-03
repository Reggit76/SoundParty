from fastapi import APIRouter, Depends, HTTPException
import psycopg2
from app.database import get_db, put_db
from app.schemas.team import TeamCreate, TeamResponse
from app.services.team_service import create_new_team, get_all_teams_service, get_team_by_id_service, update_team_service, delete_team_service
from app.core.dependencies import get_current_organizer_or_admin, get_current_user

router = APIRouter()

@router.post("/teams", response_model=TeamResponse)
def create_team_route(
    team_data: TeamCreate, 
    conn: psycopg2.extensions.connection = Depends(get_db),
    current_user: dict = Depends(get_current_user)  # Любой авторизованный пользователь может создать команду
):
    try:
        result = create_new_team(conn, team_data.dict())
        return result[0]
    finally:
        put_db(conn)

@router.get("/teams", response_model=list[TeamResponse])
def get_all_teams_route(conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        return get_all_teams_service(conn)
    finally:
        put_db(conn)

@router.get("/teams/{team_id}", response_model=TeamResponse)
def get_team_by_id_route(team_id: int, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        result = get_team_by_id_service(conn, team_id)
        if not result:
            raise HTTPException(status_code=404, detail="Team not found")
        return result[0]
    finally:
        put_db(conn)

@router.put("/teams/{team_id}", response_model=TeamResponse)
def update_team_route(
    team_id: int, 
    team_data: TeamCreate, 
    conn: psycopg2.extensions.connection = Depends(get_db),
    current_user: dict = Depends(get_current_organizer_or_admin)  # Только админы/организаторы могут редактировать
):
    try:
        result = update_team_service(conn, team_id, team_data.dict())
        if not result:
            raise HTTPException(status_code=404, detail="Team not found")
        return result[0]
    finally:
        put_db(conn)

@router.delete("/teams/{team_id}")
def delete_team_route(
    team_id: int, 
    conn: psycopg2.extensions.connection = Depends(get_db),
    current_user: dict = Depends(get_current_organizer_or_admin)  # Только админы/организаторы могут удалять
):
    try:
        result = delete_team_service(conn, team_id)
        if not result:
            raise HTTPException(status_code=404, detail="Team not found")
        return {"message": "Team deleted"}
    finally:
        put_db(conn)