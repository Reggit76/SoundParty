from app.utils.db_utils import execute_query

def create_event_result(conn, result_data):
    query = """
    INSERT INTO "Event_Results" 
    (event_id, team_id, score)
    VALUES 
    (%(event_id)s, %(team_id)s, %(score)s)
    RETURNING result_id
    """
    return execute_query(conn, query, result_data)

def get_event_results(conn, event_id):
    query = """
    SELECT er.result_id, t.name AS team_name, er.score
    FROM "Event_Results" er
    JOIN "Teams" t ON er.team_id = t.team_id
    WHERE er.event_id = %(event_id)s
    """
    return execute_query(conn, query, {"event_id": event_id})

def update_team_rating(conn, team_id, score):
    query = """
    UPDATE "Teams"
    SET rating = rating + %(score)s
    WHERE team_id = %(team_id)s
    RETURNING *
    """
    return execute_query(conn, query, {"team_id": team_id, "score": score})