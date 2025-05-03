# Импорты для удобства использования
from .user import UserBase, UserCreate, UserUpdate, UserResponse
from .role import RoleBase, RoleCreate, RoleUpdate, RoleResponse
from .venue import VenueBase, VenueCreate, VenueUpdate, VenueResponse
from .event import EventBase, EventCreate, EventUpdate, EventResponse, EventStatus
from .team import TeamBase, TeamCreate, TeamUpdate, TeamResponse
from .participant import ParticipantBase, ParticipantCreate, ParticipantResponse
from .booking import BookingBase, BookingCreate, BookingResponse
from .payment import PaymentBase, PaymentCreate, PaymentUpdate, PaymentResponse, PaymentType, PaymentStatus
from .event_result import EventResultBase, EventResultCreate, EventResultResponse
from .auth import Login, Token, TokenData
from .base import SuccessResponse, ErrorResponse, PaginatedResponse