from pydantic import BaseModel
from typing import Any, List, Optional

# Общая схема успешного ответа
class SuccessResponse(BaseModel):
    success: bool = True
    data: Any

# Общая схема ошибки
class ErrorResponse(BaseModel):
    success: bool = False
    error: str

# Схема пагинации
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    size: int