from app.repositories.booking_repo import create_booking, get_all_bookings, get_booking_by_id, delete_booking

def create_new_booking(conn, booking_data):
    return create_booking(conn, booking_data)

def get_all_bookings_service(conn):
    return get_all_bookings(conn)

def get_booking_by_id_service(conn, booking_id):
    return get_booking_by_id(conn, booking_id)

def delete_booking_service(conn, booking_id):
    return delete_booking(conn, booking_id)