from app.utils.db_utils import execute_query

def create_team(conn, team_data):
    query = """
    INSERT INTO "Teams" 
    (name, rating)
    VALUES 
    (%(name)s, %(rating)s)
    RETURNING team_id
    """
    return execute_query(conn, query, team_data)

def get_all_teams(conn):
    query = """
    SELECT team_id, name, rating
    FROM "Teams"
    ORDER BY rating DESC
    """
    return execute_query(conn, query)

def get_team_by_id(conn, team_id):
    query = """
    SELECT team_id, name, rating
    FROM "Teams"
    WHERE team_id = %(team_id)s
    """
    return execute_query(conn, query, {"team_id": team_id})

def update_team(conn, team_id, team_data):
    query = """
    UPDATE "Teams"
    SET 
        name = %(name)s,
        rating = %(rating)s
    WHERE team_id = %(team_id)s
    RETURNING *
    """
    params = {**team_data, "team_id": team_id}
    return execute_query(conn, query, params)

def delete_team(conn, team_id):
    query = """
    DELETE FROM "Teams"
    WHERE team_id = %(team_id)s
    RETURNING *
    """
    return execute_query(conn, query, {"team_id": team_id})

def get_teams_by_user_id(conn, user_id):
    """
    Получить все команды, в которых состоит пользователь
    """
    query = """
    SELECT DISTINCT t.team_id, t.name, t.rating
    FROM "Teams" t
    JOIN "Participants" p ON t.team_id = p.team_id
    WHERE p.user_id = %(user_id)s
    ORDER BY t.name
    """
    return execute_query(conn, query, {"user_id": user_id})