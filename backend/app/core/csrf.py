from fastapi import Request, HTTPException, Form
from fastapi.responses import HTMLResponse
import secrets
import time
from typing import Optional

class CSRFProtect:
    def __init__(self, secret_key: str, token_lifetime: int = 3600):
        self.secret_key = secret_key
        self.token_lifetime = token_lifetime
        self.tokens = {}  # В продакшене используйте Redis
    
    def generate_csrf_token(self, session_id: str) -> str:
        """Генерирует CSRF токен для сессии"""
        token = secrets.token_urlsafe(32)
        self.tokens[token] = {
            "session_id": session_id,
            "timestamp": time.time()
        }
        # Очистка старых токенов
        self._cleanup_old_tokens()
        return token
    
    def validate_csrf_token(self, token: str, session_id: str) -> bool:
        """Проверяет валидность CSRF токена"""
        if token not in self.tokens:
            return False
        
        token_data = self.tokens[token]
        
        # Проверка сессии
        if token_data["session_id"] != session_id:
            return False
        
        # Проверка времени жизни
        if time.time() - token_data["timestamp"] > self.token_lifetime:
            del self.tokens[token]
            return False
        
        # Удаляем использованный токен
        del self.tokens[token]
        return True
    
    def _cleanup_old_tokens(self):
        """Удаляет истекшие токены"""
        current_time = time.time()
        expired_tokens = [
            token for token, data in self.tokens.items()
            if current_time - data["timestamp"] > self.token_lifetime
        ]
        for token in expired_tokens:
            del self.tokens[token]

# Создаем экземпляр для использования
csrf_protect = None

def init_csrf(secret_key: str):
    global csrf_protect
    csrf_protect = CSRFProtect(secret_key)

def get_csrf_token(request: Request) -> str:
    """Получает или создает CSRF токен для запроса"""
    session_id = request.cookies.get("session_id")
    if not session_id:
        session_id = secrets.token_urlsafe(32)
    
    return csrf_protect.generate_csrf_token(session_id)

async def csrf_protect_dependency(
    request: Request,
    csrf_token: Optional[str] = Form(None)
):
    """Dependency для проверки CSRF токена"""
    if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
        session_id = request.cookies.get("session_id")
        
        if not session_id:
            raise HTTPException(status_code=403, detail="No session found")
        
        if not csrf_token:
            raise HTTPException(status_code=403, detail="CSRF token missing")
        
        if not csrf_protect.validate_csrf_token(csrf_token, session_id):
            raise HTTPException(status_code=403, detail="Invalid CSRF token")