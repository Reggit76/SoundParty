from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import HTMLResponse
import psycopg2

from app.repositories.team_repo import get_all_teams, get_team_by_id
from app.repositories.participant_repo import get_all_participants
from app.repositories.user_repo import get_user_by_username
from app.core.security import decode_access_token
from app.database import get_db, put_db
from app.templates import templates

router = APIRouter(tags=["web"])

@router.get("/teams", response_class=HTMLResponse)
async def teams_page(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        # Получение всех команд
        teams = get_all_teams(conn)
        
        # Получение участников для каждой команды
        participants = get_all_participants(conn)
        
        # Группируем участников по командам
        team_participants = {}
        for participant in participants:
            team_name = participant.get("team_name")
            if team_name not in team_participants:
                team_participants[team_name] = []
            team_participants[team_name].append(participant)
        
        # Добавляем участников к командам
        for team in teams:
            team["participants"] = team_participants.get(team["name"], [])
            team["participant_count"] = len(team["participants"])

        # Проверка авторизации
        token = request.cookies.get("access_token")
        current_user = None
        if token:
            payload = decode_access_token(token)
            if payload:
                username = payload.get("sub")
                user = get_user_by_username(conn, username)
                if user:
                    current_user = user[0]

        return templates.TemplateResponse("teams/list.html", {
            "request": request,
            "teams": teams,
            "current_user": current_user,
            "page_title": "Команды"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки команд: {str(e)}")
    finally:
        put_db(conn)

@router.get("/teams/{team_id}", response_class=HTMLResponse)
async def team_detail_page(team_id: int, request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        # Получение конкретной команды
        team = get_team_by_id(conn, team_id)
        if not team:
            raise HTTPException(status_code=404, detail="Команда не найдена")
        
        team = team[0]
        
        # Получение участников команды
        participants = get_all_participants(conn)
        team_participants = [p for p in participants if p.get("team_name") == team["name"]]
        team["participants"] = team_participants
        team["participant_count"] = len(team_participants)

        # Проверка авторизации
        token = request.cookies.get("access_token")
        current_user = None
        if token:
            payload = decode_access_token(token)
            if payload:
                username = payload.get("sub")
                user = get_user_by_username(conn, username)
                if user:
                    current_user = user[0]

        return templates.TemplateResponse("teams/detail.html", {
            "request": request,
            "team": team,
            "current_user": current_user,
            "page_title": f"Команда: {team['name']}"
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки команды: {str(e)}")
    finally:
        put_db(conn)