from pydantic import BaseModel

# Базовая схема результата мероприятия
class EventResultBase(BaseModel):
    event_id: int
    team_id: int
    score: int

# Схема для создания результата
class EventResultCreate(EventResultBase):
    pass

# Схема для ответа API
class EventResultResponse(EventResultBase):
    result_id: int

    class Config:
        from_attributes = True