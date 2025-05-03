from app.repositories.venue_repo import create_venue, get_all_venues, get_venue_by_id, update_venue, delete_venue

def create_new_venue(conn, venue_data):
    return create_venue(conn, venue_data)

def get_all_venues_service(conn):
    return get_all_venues(conn)

def get_venue_by_id_service(conn, venue_id):
    return get_venue_by_id(conn, venue_id)

def update_venue_service(conn, venue_id, venue_data):
    return update_venue(conn, venue_id, venue_data)

def delete_venue_service(conn, venue_id):
    return delete_venue(conn, venue_id)