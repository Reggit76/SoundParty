# app/routers/web/errors.py
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.repositories.user_repo import get_user_by_username
from app.core.security import decode_access_token
from app.database import get_db, put_db
from app.templates import templates

router = APIRouter(tags=["errors"])

def get_current_user_from_request(request: Request):
    """Вспомогательная функция для получения текущего пользователя"""
    try:
        token = request.cookies.get("access_token")
        if not token:
            return None
        
        payload = decode_access_token(token)
        if not payload:
            return None
        
        username = payload.get("sub")
        conn = get_db()
        try:
            user = get_user_by_username(conn, username)
            if user:
                return user[0]
        finally:
            put_db(conn)
    except:
        pass
    return None

@router.get("/404", response_class=HTMLResponse)
async def not_found_page(request: Request):
    current_user = get_current_user_from_request(request)
    return templates.TemplateResponse("errors/404.html", {
        "request": request,
        "current_user": current_user
    }, status_code=404)

@router.get("/500", response_class=HTMLResponse)
async def server_error_page(request: Request):
    current_user = get_current_user_from_request(request)
    return templates.TemplateResponse("errors/500.html", {
        "request": request,
        "current_user": current_user
    }, status_code=500)

@router.get("/403", response_class=HTMLResponse)
async def forbidden_page(request: Request):
    current_user = get_current_user_from_request(request)
    return templates.TemplateResponse("errors/403.html", {
        "request": request,
        "current_user": current_user
    }, status_code=403)

# Обработчик для других страниц
@router.get("/about", response_class=HTMLResponse)
async def about_page(request: Request):
    current_user = get_current_user_from_request(request)
    return templates.TemplateResponse("about.html", {
        "request": request,
        "current_user": current_user
    })

@router.get("/contact", response_class=HTMLResponse)
async def contact_page(request: Request):
    current_user = get_current_user_from_request(request)
    return templates.TemplateResponse("contact.html", {
        "request": request,
        "current_user": current_user
    })

@router.get("/help", response_class=HTMLResponse)
async def help_page(request: Request):
    current_user = get_current_user_from_request(request)
    return templates.TemplateResponse("help.html", {
        "request": request,
        "current_user": current_user
    })