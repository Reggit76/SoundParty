from fastapi import APIRouter, Depends, Form, Request, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
import psycopg2
import secrets

from app.core.csrf import csrf_protect_dependency, get_csrf_token
from app.repositories.team_repo import get_all_teams, get_team_by_id
from app.repositories.participant_repo import get_all_participants, create_participant, get_participant_by_user_and_team
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

@router.get("/teams/create", response_class=HTMLResponse)
async def teams_create_page(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        # Проверка авторизации
        token = request.cookies.get("access_token")
        if not token:
            return RedirectResponse("/login", status_code=302)
        
        payload = decode_access_token(token)
        if not payload:
            return RedirectResponse("/login", status_code=302)
        
        username = payload.get("sub")
        user = get_user_by_username(conn, username)
        if not user:
            return RedirectResponse("/login", status_code=302)
        
        current_user = user[0]
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("teams/create.html", {
            "request": request,
            "current_user": current_user,
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.post("/teams/create", response_class=RedirectResponse)
async def teams_create(
    request: Request,
    team_name: str = Form(...),
    csrf_token: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db),
    _: None = Depends(csrf_protect_dependency)
):
    try:
        # Проверка авторизации
        token = request.cookies.get("access_token")
        if not token:
            return RedirectResponse("/login", status_code=302)
        
        payload = decode_access_token(token)
        if not payload:
            return RedirectResponse("/login", status_code=302)
        
        username = payload.get("sub")
        user = get_user_by_username(conn, username)
        if not user:
            return RedirectResponse("/login", status_code=302)
        
        current_user = user[0]
        
        # Создание команды
        from app.repositories.team_repo import create_team
        team_data = {
            "name": team_name,
            "rating": 0
        }
        
        team_result = create_team(conn, team_data)
        if not team_result:
            raise Exception("Не удалось создать команду")
            
        team_id = team_result[0]["team_id"]
        
        # Добавление создателя в команду как участника
        from app.repositories.participant_repo import create_participant
        participant_data = {
            "user_id": current_user["user_id"],
            "team_id": team_id
        }
        create_participant(conn, participant_data)
        
        return RedirectResponse("/teams?success=team_created", status_code=302)
    except Exception as e:
        return templates.TemplateResponse("teams/create.html", {
            "request": request,
            "current_user": current_user,
            "csrf_token": get_csrf_token(request),
            "error": f"Ошибка создания команды: {str(e)}"
        }, status_code=400)
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

@router.get("/teams/{team_id}/join", response_class=HTMLResponse)
async def join_team_page(team_id: int, request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        # Проверка авторизации
        token = request.cookies.get("access_token")
        if not token:
            return RedirectResponse("/login", status_code=302)
        
        payload = decode_access_token(token)
        if not payload:
            return RedirectResponse("/login", status_code=302)
        
        username = payload.get("sub")
        user = get_user_by_username(conn, username)
        if not user:
            return RedirectResponse("/login", status_code=302)
        
        current_user = user[0]
        
        # Проверка существования команды
        team = get_team_by_id(conn, team_id)
        if not team:
            raise HTTPException(status_code=404, detail="Команда не найдена")
        
        team = team[0]
        
        # Проверка, не состоит ли пользователь уже в команде
        existing_participant = get_participant_by_user_and_team(conn, current_user["user_id"], team_id)
        if existing_participant:
            return RedirectResponse(f"/teams/{team_id}?error=already_member", status_code=302)
        
        csrf_token = get_csrf_token(request)
        response = templates.TemplateResponse("teams/join.html", {
            "request": request,
            "current_user": current_user,
            "team": team,
            "csrf_token": csrf_token
        })
        
        # Устанавливаем session_id cookie если его нет
        if "session_id" not in request.cookies:
            session_id = secrets.token_urlsafe(32)
            response.set_cookie(
                key="session_id",
                value=session_id,
                httponly=True,
                samesite="lax"
            )
        
        return response
    finally:
        put_db(conn)

@router.post("/teams/{team_id}/join", response_class=RedirectResponse)
async def join_team(
    team_id: int,
    request: Request,
    csrf_token: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db),
    _: None = Depends(csrf_protect_dependency)
):
    try:
        # Проверка авторизации
        token = request.cookies.get("access_token")
        if not token:
            return RedirectResponse("/login", status_code=302)
        
        payload = decode_access_token(token)
        if not payload:
            return RedirectResponse("/login", status_code=302)
        
        username = payload.get("sub")
        user = get_user_by_username(conn, username)
        if not user:
            return RedirectResponse("/login", status_code=302)
        
        current_user = user[0]
        
        # Проверка существования команды
        team = get_team_by_id(conn, team_id)
        if not team:
            raise HTTPException(status_code=404, detail="Команда не найдена")
        
        # Проверка, не состоит ли пользователь уже в команде
        existing_participant = get_participant_by_user_and_team(conn, current_user["user_id"], team_id)
        if existing_participant:
            return RedirectResponse(f"/teams/{team_id}?error=already_member", status_code=302)
        
        # Добавление пользователя в команду
        participant_data = {
            "user_id": current_user["user_id"],
            "team_id": team_id
        }
        create_participant(conn, participant_data)
        
        response = RedirectResponse(f"/teams/{team_id}?success=joined", status_code=302)
        
        # Устанавливаем session_id cookie если его нет
        if "session_id" not in request.cookies:
            session_id = secrets.token_urlsafe(32)
            response.set_cookie(
                key="session_id",
                value=session_id,
                httponly=True,
                samesite="lax"
            )
        
        return response
    except Exception as e:
        return RedirectResponse(f"/teams/{team_id}?error={str(e)}", status_code=302)
    finally:
        put_db(conn)