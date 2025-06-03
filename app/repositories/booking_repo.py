from app.utils.db_utils import execute_query

def create_booking(conn, booking_data):
    query = """
    INSERT INTO "Bookings" 
    (event_id, team_id, status, number_of_seats)
    VALUES 
    (%(event_id)s, %(team_id)s, %(status)s, 1)
    RETURNING booking_id
    """
    return execute_query(conn, query, booking_data)

def get_all_bookings(conn):
    query = """
    SELECT b.booking_id, b.event_id, b.team_id, 
           e.description AS event_name, t.name AS team_name, 
           b.number_of_seats
    FROM "Bookings" b
    JOIN "Events" e ON b.event_id = e.event_id
    JOIN "Teams" t ON b.team_id = t.team_id
    """
    return execute_query(conn, query)

def get_booking_by_id(conn, booking_id):
    query = """
    SELECT b.booking_id, b.event_id, b.team_id, 
           e.description AS event_name, t.name AS team_name, 
           b.number_of_seats
    FROM "Bookings" b
    JOIN "Events" e ON b.event_id = e.event_id
    JOIN "Teams" t ON b.team_id = t.team_id
    WHERE b.booking_id = %(booking_id)s
    """
    return execute_query(conn, query, {"booking_id": booking_id})

def delete_booking(conn, booking_id):
    query = """
    DELETE FROM "Bookings"
    WHERE booking_id = %(booking_id)s
    RETURNING *
    """
    return execute_query(conn, query, {"booking_id": booking_id})

def get_booking_by_event_and_team(conn, event_id, team_id):
    """
    Проверить, зарегистрирована ли команда на мероприятие
    """
    query = """
    SELECT b.booking_id, b.event_id, b.team_id, 
           e.description AS event_name, t.name AS team_name, 
           b.number_of_seats
    FROM "Bookings" b
    JOIN "Events" e ON b.event_id = e.event_id
    JOIN "Teams" t ON b.team_id = t.team_id
    WHERE b.event_id = %(event_id)s AND b.team_id = %(team_id)s
    """
    return execute_query(conn, query, {"event_id": event_id, "team_id": team_id})