from pydantic import BaseModel
from enum import Enum
from typing import Optional

class EventStatus(str, Enum):
    announced = "анонс"
    ongoing = "в процессе"
    completed = "завершено"

# Базовая схема мероприятия
class EventBase(BaseModel):
    venue_id: int
    description: str
    date: str  
    time: str  
    max_teams: int
    status: EventStatus = EventStatus.announced

# Схема для создания мероприятия
class EventCreate(EventBase):
    pass

# Схема для обновления мероприятия
class EventUpdate(BaseModel):
    venue_id: Optional[int]
    description: Optional[str]
    date: Optional[str]
    time: Optional[str]
    max_teams: Optional[int]
    status: Optional[EventStatus]

# Схема для ответа API
class EventResponse(EventBase):
    event_id: int

    class Config:
        from_attributes = True