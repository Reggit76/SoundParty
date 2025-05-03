from pydantic import BaseModel
from typing import Optional

# Базовая схема роли
class RoleBase(BaseModel):
    role_name: str

# Схема для создания роли
class RoleCreate(RoleBase):
    pass

# Схема для обновления роли
class RoleUpdate(BaseModel):
    role_name: Optional[str]

# Схема для ответа API
class RoleResponse(RoleBase):
    role_id: int

    class Config:
        from_attributes = True