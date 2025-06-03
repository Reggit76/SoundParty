from pydantic import BaseModel
from typing import Optional

# Базовая схема площадки
class VenueBase(BaseModel):
    name: str
    address: Optional[str]
    capacity: int

# Схема для создания площадки
class VenueCreate(VenueBase):
    pass

# Схема для обновления площадки
class VenueUpdate(BaseModel):
    name: Optional[str]
    address: Optional[str]
    capacity: Optional[int]

# Схема для ответа API
class VenueResponse(VenueBase):
    venue_id: int

    class Config:
        from_attributes = True