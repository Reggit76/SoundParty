from pydantic import BaseModel

# Базовая схема участника
class ParticipantBase(BaseModel):
    user_id: int
    team_id: int

# Схема для создания участника
class ParticipantCreate(ParticipantBase):
    pass

# Схема для ответа API
class ParticipantResponse(ParticipantBase):
    participant_id: int

    class Config:
        from_attributes = True