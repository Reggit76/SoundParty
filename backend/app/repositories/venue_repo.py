from app.utils.db_utils import execute_query

def create_venue(conn, venue_data):
    query = """
    INSERT INTO "Venues" 
    (name, address, capacity)
    VALUES 
    (%(name)s, %(address)s, %(capacity)s)
    RETURNING venue_id
    """
    return execute_query(conn, query, venue_data)

def get_all_venues(conn):
    query = """
    SELECT venue_id, name, address, capacity
    FROM "Venues"
    ORDER BY name
    """
    return execute_query(conn, query)

def get_venue_by_id(conn, venue_id):
    query = """
    SELECT venue_id, name, address, capacity
    FROM "Venues"
    WHERE venue_id = %(venue_id)s
    """
    return execute_query(conn, query, {"venue_id": venue_id})

def update_venue(conn, venue_id, venue_data):
    query = """
    UPDATE "Venues"
    SET 
        name = %(name)s,
        address = %(address)s,
        capacity = %(capacity)s
    WHERE venue_id = %(venue_id)s
    RETURNING *
    """
    params = {**venue_data, "venue_id": venue_id}
    return execute_query(conn, query, params)

def delete_venue(conn, venue_id):
    query = """
    DELETE FROM "Venues"
    WHERE venue_id = %(venue_id)s
    RETURNING *
    """
    return execute_query(conn, query, {"venue_id": venue_id})