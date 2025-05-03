from fastapi import APIRouter, Depends, HTTPException
import psycopg2
from app.database import get_db, put_db
from app.schemas.event_result import EventResultCreate
from app.services.event_result_service import add_event_result, get_event_results

router = APIRouter()

@router.post("/event-results")
def create_event_result_route(result_data: EventResultCreate, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        add_event_result(conn, result_data.dict())
        return {"message": "Result added and rating updated"}
    finally:
        put_db(conn)

@router.get("/event-results/{event_id}")
def get_event_results_route(event_id: int, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        return get_event_results(conn, event_id)
    finally:
        put_db(conn)