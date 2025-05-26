from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.templates import templates

router = APIRouter(tags=["errors"])

@router.get("/404", response_class=HTMLResponse)
async def not_found_page(request: Request):
    return templates.TemplateResponse("errors/404.html", {
        "request": request
    }, status_code=404)

@router.get("/500", response_class=HTMLResponse)
async def server_error_page(request: Request):
    return templates.TemplateResponse("errors/500.html", {
        "request": request
    }, status_code=500)

@router.get("/403", response_class=HTMLResponse)
async def forbidden_page(request: Request):
    return templates.TemplateResponse("errors/403.html", {
        "request": request
    }, status_code=403)

# Обработчик для других страниц
@router.get("/about", response_class=HTMLResponse)
async def about_page(request: Request):
    return templates.TemplateResponse("about.html", {
        "request": request
    })

@router.get("/contact", response_class=HTMLResponse)
async def contact_page(request: Request):
    return templates.TemplateResponse("contact.html", {
        "request": request
    })

@router.get("/help", response_class=HTMLResponse)
async def help_page(request: Request):
    return templates.TemplateResponse("help.html", {
        "request": request
    })