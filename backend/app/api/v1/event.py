from fastapi import APIRouter, Depends, HTTPException
import psycopg2
from app.database import get_db, put_db
from app.schemas.event import EventCreate, EventResponse
from app.services.event_service import create_new_event, get_all_events_service, get_event_by_id_service, update_event_service, delete_event_service
from app.core.dependencies import get_current_organizer_or_admin

router = APIRouter()

@router.get("/events", response_model=list[EventResponse])
def get_all_events_route(conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        return get_all_events_service(conn)
    finally:
        put_db(conn)

@router.get("/events/{event_id}", response_model=EventResponse)
def get_event_by_id_route(event_id: int, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        result = get_event_by_id_service(conn, event_id)
        if not result:
            raise HTTPException(status_code=404, detail="Event not found")
        return result[0]
    finally:
        put_db(conn)

@router.post("/events", response_model=EventResponse)
def create_event_route(
    event_data: EventCreate, 
    conn: psycopg2.extensions.connection = Depends(get_db),
    current_user: dict = Depends(get_current_organizer_or_admin)
):
    try:
        result = create_new_event(conn, event_data.dict())
        return result[0]
    finally:
        put_db(conn)

@router.put("/events/{event_id}", response_model=EventResponse)
def update_event_route(
    event_id: int, 
    event_data: EventCreate, 
    conn: psycopg2.extensions.connection = Depends(get_db),
    current_user: dict = Depends(get_current_organizer_or_admin)
):
    try:
        result = update_event_service(conn, event_id, event_data.dict())
        if not result:
            raise HTTPException(status_code=404, detail="Event not found")
        return result[0]
    finally:
        put_db(conn)

@router.delete("/events/{event_id}")
def delete_event_route(
    event_id: int, 
    conn: psycopg2.extensions.connection = Depends(get_db),
    current_user: dict = Depends(get_current_organizer_or_admin)
):
    try:
        result = delete_event_service(conn, event_id)
        if not result:
            raise HTTPException(status_code=404, detail="Event not found")
        return {"message": "Event deleted"}
    finally:
        put_db(conn)