from pydantic import BaseModel

# Базовая схема заявки
class BookingBase(BaseModel):
    event_id: int
    team_id: int
    number_of_seats: int

# Схема для создания заявки
class BookingCreate(BookingBase):
    pass

# Схема для ответа API
class BookingResponse(BaseModel):
    booking_id: int
    event_id: int
    team_id: int
    event_name: str
    team_name: str
    number_of_seats: int

    class Config:
        from_attributes = True