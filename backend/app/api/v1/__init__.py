# Экспорт всех API роутеров для удобного импорта
from .auth import router as auth_router
from .user import router as user_router
from .venue import router as venue_router
from .event import router as event_router
from .team import router as team_router
from .participant import router as participant_router
from .booking import router as booking_router
from .payment import router as payment_router
from .event_result import router as event_result_router

__all__ = [
    "auth_router",
    "user_router",
    "venue_router",
    "event_router",
    "team_router",
    "participant_router",
    "booking_router",
    "payment_router",
    "event_result_router"
]