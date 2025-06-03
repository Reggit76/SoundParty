from app.utils.db_utils import execute_query

def create_payment(conn, payment_data):
    query = """
    INSERT INTO "Payments" 
    (booking_id, payment_type, total_amount, payment_status)
    VALUES 
    (%(booking_id)s, %(payment_type)s, %(total_amount)s, %(payment_status)s)
    RETURNING payment_id
    """
    return execute_query(conn, query, payment_data)

def get_all_payments(conn):
    query = """
    SELECT p.payment_id, b.booking_id, p.payment_type, p.total_amount, p.payment_status
    FROM "Payments" p
    JOIN "Bookings" b ON p.booking_id = b.booking_id
    """
    return execute_query(conn, query)

def get_payment_by_id(conn, payment_id):
    query = """
    SELECT p.payment_id, b.booking_id, p.payment_type, p.total_amount, p.payment_status
    FROM "Payments" p
    JOIN "Bookings" b ON p.booking_id = b.booking_id
    WHERE p.payment_id = %(payment_id)s
    """
    return execute_query(conn, query, {"payment_id": payment_id})

def update_payment_status(conn, payment_id, status):
    query = """
    UPDATE "Payments"
    SET 
        payment_status = %(status)s,
        payment_date = NOW()
    WHERE payment_id = %(payment_id)s
    RETURNING *
    """
    return execute_query(conn, query, {"payment_id": payment_id, "status": status})