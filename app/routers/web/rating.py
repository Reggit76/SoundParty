# app/routers/web/rating.py
from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
import psycopg2

from app.core.security import decode_access_token
from app.repositories.team_repo import get_all_teams
from app.repositories.user_repo import get_user_by_username
from app.database import get_db, put_db
from app.templates import templates

router = APIRouter(tags=["web"])

@router.get("/rating", response_class=HTMLResponse)
def rating_page(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        # Получаем все команды отсортированные по рейтингу
        teams = get_all_teams(conn)
        
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
        
        # Добавляем позицию для каждой команды
        for i, team in enumerate(teams):
            team["position"] = i + 1
            # Определяем класс для медалей
            if i == 0:
                team["medal_class"] = "gold"
            elif i == 1:
                team["medal_class"] = "silver"
            elif i == 2:
                team["medal_class"] = "bronze"
            else:
                team["medal_class"] = None
        
        return templates.TemplateResponse("rating.html", {
            "request": request,
            "teams": teams,
            "current_user": current_user
        })
    finally:
        put_db(conn)