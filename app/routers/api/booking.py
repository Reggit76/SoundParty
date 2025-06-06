from fastapi import APIRouter, Depends, HTTPException
import psycopg2
from app.database import get_db, put_db
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.booking_service import create_new_booking, get_all_bookings_service, get_booking_by_id_service, delete_booking_service

router = APIRouter()

@router.post("/bookings", response_model=BookingResponse)
def create_booking_route(booking_data: BookingCreate, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        result = create_new_booking(conn, booking_data.dict())
        return result[0]
    finally:
        put_db(conn)

@router.get("/bookings", response_model=list[BookingResponse])
def get_all_bookings_route(conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        return get_all_bookings_service(conn)
    finally:
        put_db(conn)

@router.get("/bookings/{booking_id}", response_model=BookingResponse)
def get_booking_by_id_route(booking_id: int, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        result = get_booking_by_id_service(conn, booking_id)
        if not result:
            raise HTTPException(status_code=404, detail="Booking not found")
        return result[0]
    finally:
        put_db(conn)

@router.delete("/bookings/{booking_id}")
def delete_booking_route(booking_id: int, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        result = delete_booking_service(conn, booking_id)
        if not result:
            raise HTTPException(status_code=404, detail="Booking not found")
        return {"message": "Booking deleted"}
    finally:
        put_db(conn)