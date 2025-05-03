from fastapi import APIRouter, Depends, HTTPException
import psycopg2
from app.database import get_db, put_db
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services.payment_service import create_new_payment, get_all_payments_service, get_payment_by_id_service, update_payment_status_service

router = APIRouter()

@router.post("/payments", response_model=PaymentResponse)
def create_payment_route(payment_data: PaymentCreate, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        result = create_new_payment(conn, payment_data.dict())
        return result[0]
    finally:
        put_db(conn)

@router.get("/payments", response_model=list[PaymentResponse])
def get_all_payments_route(conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        return get_all_payments_service(conn)
    finally:
        put_db(conn)

@router.get("/payments/{payment_id}", response_model=PaymentResponse)
def get_payment_by_id_route(payment_id: int, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        result = get_payment_by_id_service(conn, payment_id)
        if not result:
            raise HTTPException(status_code=404, detail="Payment not found")
        return result[0]
    finally:
        put_db(conn)

@router.put("/payments/{payment_id}/status")
def update_payment_status_route(payment_id: int, status: str, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        result = update_payment_status_service(conn, payment_id, status)
        if not result:
            raise HTTPException(status_code=404, detail="Payment not found")
        return {"message": "Payment status updated"}
    finally:
        put_db(conn)