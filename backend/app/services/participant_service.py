from app.repositories.participant_repo import create_participant, get_all_participants, get_participant_by_id, delete_participant

def create_new_participant(conn, participant_data):
    return create_participant(conn, participant_data)

def get_all_participants_service(conn):
    return get_all_participants(conn)

def get_participant_by_id_service(conn, participant_id):
    return get_participant_by_id(conn, participant_id)

def delete_participant_service(conn, participant_id):
    return delete_participant(conn, participant_id)