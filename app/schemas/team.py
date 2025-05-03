from pydantic import BaseModel
from typing import Optional

# Базовая схема команды
class TeamBase(BaseModel):
    name: str
    rating: int = 0

# Схема для создания команды
class TeamCreate(TeamBase):
    pass

# Схема для обновления команды
class TeamUpdate(BaseModel):
    name: Optional[str]
    rating: Optional[int]

# Схема для ответа API
class TeamResponse(TeamBase):
    team_id: int

    class Config:
        from_attributes = True