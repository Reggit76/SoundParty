from app.repositories.team_repo import create_team, get_all_teams, get_team_by_id, update_team, delete_team

def create_new_team(conn, team_data):
    return create_team(conn, team_data)

def get_all_teams_service(conn):
    return get_all_teams(conn)

def get_team_by_id_service(conn, team_id):
    return get_team_by_id(conn, team_id)

def update_team_service(conn, team_id, team_data):
    return update_team(conn, team_id, team_data)

def delete_team_service(conn, team_id):
    return delete_team(conn, team_id)