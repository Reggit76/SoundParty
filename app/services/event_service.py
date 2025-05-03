from app.repositories.event_repo import create_event, get_all_events, get_event_by_id, update_event, delete_event

def create_new_event(conn, event_data):
    return create_event(conn, event_data)

def get_all_events_service(conn):
    return get_all_events(conn)

def get_event_by_id_service(conn, event_id):
    return get_event_by_id(conn, event_id)

def update_event_service(conn, event_id, event_data):
    return update_event(conn, event_id, event_data)

def delete_event_service(conn, event_id):
    return delete_event(conn, event_id)