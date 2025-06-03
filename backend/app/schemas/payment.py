from pydantic import BaseModel
from enum import Enum
from typing import Optional

# ENUM для типов платежей
class PaymentType(str, Enum):
    card = "банковская карта"
    cash = "наличные"
    transfer = "перевод"

# ENUM для статусов платежей
class PaymentStatus(str, Enum):
    unpaid = "не оплачено"
    paid = "оплачено"
    canceled = "отменено"

# Базовая схема платежа
class PaymentBase(BaseModel):
    booking_id: int
    payment_type: PaymentType
    total_amount: float
    payment_status: PaymentStatus = PaymentStatus.unpaid

# Схема для создания платежа
class PaymentCreate(PaymentBase):
    pass

# Схема для обновления платежа
class PaymentUpdate(BaseModel):
    payment_type: Optional[PaymentType]
    total_amount: Optional[float]
    payment_status: Optional[PaymentStatus]

# Схема для ответа API
class PaymentResponse(PaymentBase):
    payment_id: int
    payment_date: Optional[str]  # ISO 8601
    created_at: str  # ISO 8601
    updated_at: str  # ISO 8601

    class Config:
        from_attributes = True