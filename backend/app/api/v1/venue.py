from fastapi import APIRouter, Depends, HTTPException
import psycopg2
from app.database import get_db, put_db
from app.schemas.venue import VenueCreate, VenueResponse
from app.services.venue_service import create_new_venue, get_all_venues_service, get_venue_by_id_service, update_venue_service, delete_venue_service
from app.core.dependencies import get_current_organizer_or_admin

router = APIRouter()

@router.post("/venues", response_model=VenueResponse)
def create_venue_route(
    venue_data: VenueCreate, 
    conn: psycopg2.extensions.connection = Depends(get_db),
    current_user: dict = Depends(get_current_organizer_or_admin)
):
    try:
        result = create_new_venue(conn, venue_data.dict())
        return result[0]
    finally:
        put_db(conn)

@router.get("/venues", response_model=list[VenueResponse])
def get_all_venues_route(conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        return get_all_venues_service(conn)
    finally:
        put_db(conn)

@router.get("/venues/{venue_id}", response_model=VenueResponse)
def get_venue_by_id_route(venue_id: int, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        result = get_venue_by_id_service(conn, venue_id)
        if not result:
            raise HTTPException(status_code=404, detail="Venue not found")
        return result[0]
    finally:
        put_db(conn)

@router.put("/venues/{venue_id}", response_model=VenueResponse)
def update_venue_route(
    venue_id: int, 
    venue_data: VenueCreate, 
    conn: psycopg2.extensions.connection = Depends(get_db),
    current_user: dict = Depends(get_current_organizer_or_admin)
):
    try:
        result = update_venue_service(conn, venue_id, venue_data.dict())
        if not result:
            raise HTTPException(status_code=404, detail="Venue not found")
        return result[0]
    finally:
        put_db(conn)

@router.delete("/venues/{venue_id}")
def delete_venue_route(
    venue_id: int, 
    conn: psycopg2.extensions.connection = Depends(get_db),
    current_user: dict = Depends(get_current_organizer_or_admin)
):
    try:
        result = delete_venue_service(conn, venue_id)
        if not result:
            raise HTTPException(status_code=404, detail="Venue not found")
        return {"message": "Venue deleted"}
    finally:
        put_db(conn)