from app.utils.db_utils import execute_query

def create_participant(conn, participant_data):
    query = """
    INSERT INTO "Participants" 
    (user_id, team_id)
    VALUES 
    (%(user_id)s, %(team_id)s)
    RETURNING *
    """
    return execute_query(conn, query, participant_data)

def get_all_participants(conn):
    query = """
    SELECT p.*, u.username, u.fullname, t.name as team_name
    FROM "Participants" p
    JOIN "Users" u ON p.user_id = u.user_id
    JOIN "Teams" t ON p.team_id = t.team_id
    ORDER BY t.name, u.username
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

def get_participants_by_team_id(conn, team_id):
    """
    Получить всех участников команды
    """
    query = """
    SELECT p.participant_id, p.user_id, u.username, u.fullname, u.email
    FROM "Participants" p
    JOIN "Users" u ON p.user_id = u.user_id
    WHERE p.team_id = %(team_id)s
    ORDER BY u.username
    """
    return execute_query(conn, query, {"team_id": team_id})

def get_participant_by_user_and_team(conn, user_id: int, team_id: int):
    query = """
    SELECT p.*, u.username, u.fullname, t.name as team_name
    FROM "Participants" p
    JOIN "Users" u ON p.user_id = u.user_id
    JOIN "Teams" t ON p.team_id = t.team_id
    WHERE p.user_id = %(user_id)s AND p.team_id = %(team_id)s
    """
    result = execute_query(conn, query, {"user_id": user_id, "team_id": team_id})
    return result[0] if result else None