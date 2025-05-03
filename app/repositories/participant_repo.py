from app.utils.db_utils import execute_query

def create_participant(conn, participant_data):
    query = """
    INSERT INTO "Participants" 
    (user_id, team_id)
    VALUES 
    (%(user_id)s, %(team_id)s)
    RETURNING participant_id
    """
    return execute_query(conn, query, participant_data)

def get_all_participants(conn):
    query = """
    SELECT p.participant_id, u.username, t.name AS team_name
    FROM "Participants" p
    JOIN "Users" u ON p.user_id = u.user_id
    JOIN "Teams" t ON p.team_id = t.team_id
    ORDER BY team_name
    """
    return execute_query(conn, query)

def get_participant_by_id(conn, participant_id):
    query = """
    SELECT p.participant_id, u.username, t.name AS team_name
    FROM "Participants" p
    JOIN "Users" u ON p.user_id = u.user_id
    JOIN "Teams" t ON p.team_id = t.team_id
    WHERE p.participant_id = %(participant_id)s
    """
    return execute_query(conn, query, {"participant_id": participant_id})

def delete_participant(conn, participant_id):
    query = """
    DELETE FROM "Participants"
    WHERE participant_id = %(participant_id)s
    RETURNING *
    """
    return execute_query(conn, query, {"participant_id": participant_id})