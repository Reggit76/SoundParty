from fastapi import APIRouter, Depends, HTTPException
import psycopg2
from app.database import get_db, put_db
from app.schemas.participant import ParticipantCreate, ParticipantResponse
from app.services.participant_service import create_new_participant, get_all_participants_service, get_participant_by_id_service, delete_participant_service

router = APIRouter()

@router.post("/participants", response_model=ParticipantResponse)
def create_participant_route(participant_data: ParticipantCreate, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        result = create_new_participant(conn, participant_data.dict())
        return result[0]
    finally:
        put_db(conn)

@router.get("/participants", response_model=list[ParticipantResponse])
def get_all_participants_route(conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        return get_all_participants_service(conn)
    finally:
        put_db(conn)

@router.get("/participants/{participant_id}", response_model=ParticipantResponse)
def get_participant_by_id_route(participant_id: int, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        result = get_participant_by_id_service(conn, participant_id)
        if not result:
            raise HTTPException(status_code=404, detail="Participant not found")
        return result[0]
    finally:
        put_db(conn)

@router.delete("/participants/{participant_id}")
def delete_participant_route(participant_id: int, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        result = delete_participant_service(conn, participant_id)
        if not result:
            raise HTTPException(status_code=404, detail="Participant not found")
        return {"message": "Participant deleted"}
    finally:
        put_db(conn)