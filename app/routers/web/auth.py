from fastapi import APIRouter, Depends, Form, Request, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.security import OAuth2PasswordBearer
import psycopg2

from app.core.security import hash_password, create_access_token, verify_password
from app.repositories.user_repo import create_user, get_user_by_username
from app.database import get_db, put_db
from app.templates import templates


router = APIRouter(tags=["web"], prefix="/auth")

@router.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse("auth/login.html", {"request": request})

@router.post("/login", response_class=RedirectResponse)
def login_user(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        user = get_user_by_username(conn, username)
        if not user or not verify_password(password, user[0]["password_hash"]):
            return templates.TemplateResponse("auth/login.html", {
                "request": request,
                "error": "Неверное имя или пароль"
            })

        access_token = create_access_token(data={"sub": user[0]["username"]})
        response = RedirectResponse("/", status_code=302)
        response.set_cookie(key="access_token", value=access_token, httponly=True)
        return response
    finally:
        put_db(conn)

@router.get("/register", response_class=HTMLResponse)
def register_page(request: Request):
    return templates.TemplateResponse("auth/register.html", {"request": request})

@router.post("/register", response_class=RedirectResponse)
def register_user_web(
    request: Request,
    username: str = Form(...),
    fullname: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        if password != confirm_password:
            return templates.TemplateResponse("auth/register.html", {
                "request": request,
                "error": "Пароли не совпадают"
            })

        existing_user = get_user_by_username(conn, username)
        if existing_user:
            return templates.TemplateResponse("auth/register.html", {
                "request": request,
                "error": "Имя пользователя занято"
            })

        hashed_pw = hash_password(password)
        create_user(conn, {
            "username": username,
            "fullname": fullname,
            "email": email,
            "password_hash": hashed_pw,
            "role_id": 3
        })

        return RedirectResponse("/auth/login", status_code=302)
    finally:
        put_db(conn)

@router.get("/logout", response_class=RedirectResponse)
def logout_user():
    """Выход из системы"""
    response = RedirectResponse("/", status_code=302)
    response.delete_cookie(key="access_token")
    return response