from app.utils.db_utils import execute_query

def create_event(conn, event_data):
    query = """
    INSERT INTO "Events" 
    (venue_id, description, date, time, max_teams, status)
    VALUES 
    (%(venue_id)s, %(description)s, %(date)s, %(time)s, %(max_teams)s, %(status)s)
    RETURNING event_id
    """
    return execute_query(conn, query, event_data)

def get_all_events(conn):
    query = """
    SELECT 
        e.event_id, 
        e.description, 
        e.date, 
        e.time, 
        e.max_teams, 
        e.status,
        v.name AS venue_name,
        v.address,
        v.capacity
    FROM "Events" e
    JOIN "Venues" v ON e.venue_id = v.venue_id
    """
    return execute_query(conn, query)

def get_event_by_id(conn, event_id):
    query = """
    SELECT 
        e.event_id, 
        e.description, 
        e.date, 
        e.time, 
        e.max_teams, 
        e.status,
        v.name AS venue_name,
        v.address,
        v.capacity
    FROM "Events" e
    JOIN "Venues" v ON e.venue_id = v.venue_id
    WHERE e.event_id = %(event_id)s
    """
    return execute_query(conn, query, {"event_id": event_id})

def update_event(conn, event_id, event_data):
    query = """
    UPDATE "Events"
    SET 
        venue_id = %(venue_id)s,
        description = %(description)s,
        date = %(date)s,
        time = %(time)s,
        max_teams = %(max_teams)s,
        status = %(status)s
    WHERE event_id = %(event_id)s
    RETURNING *
    """
    params = {**event_data, "event_id": event_id}
    return execute_query(conn, query, params)

def delete_event(conn, event_id):
    query = """
    DELETE FROM "Events"
    WHERE event_id = %(event_id)s
    RETURNING *
    """
    return execute_query(conn, query, {"event_id": event_id})