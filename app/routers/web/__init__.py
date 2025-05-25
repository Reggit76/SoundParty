# Экспорт всех веб-роутеров для удобного импорта
from .auth import router as auth_router
from .home import router as home_router
from .admin import router as admin_router
from .event import router as event_router
from .profile import router as profile_router
from .rating import router as rating_router
from .teams import router as teams_router
from .venues import router as venues_router
from .booking import router as booking_router

__all__ = [
    "auth_router",
    "home_router",
    "admin_router",
    "event_router",
    "profile_router",
    "rating_router",
    "teams_router",
    "venues_router",
    "booking_router"
]