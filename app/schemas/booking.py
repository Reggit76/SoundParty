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
class BookingResponse(BookingBase):
    booking_id: int

    class Config:
        from_attributes = True