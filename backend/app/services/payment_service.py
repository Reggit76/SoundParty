from app.repositories.payment_repo import create_payment, get_all_payments, get_payment_by_id, update_payment_status

def create_new_payment(conn, payment_data):
    return create_payment(conn, payment_data)

def get_all_payments_service(conn):
    return get_all_payments(conn)

def get_payment_by_id_service(conn, payment_id):
    return get_payment_by_id(conn, payment_id)

def update_payment_status_service(conn, payment_id, status):
    return update_payment_status(conn, payment_id, status)