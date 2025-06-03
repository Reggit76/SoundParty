from app.repositories.event_result_repo import create_event_result, get_event_results as get_results_repo, update_team_rating


def add_event_result(conn, result_data):
    result = create_event_result(conn, result_data)
    update_team_rating(conn, result_data["team_id"], result_data["score"])
    return result

def get_event_results(conn, event_id):
    """Получение результатов мероприятия"""
    try:
        return get_results_repo(conn, event_id)
    except Exception as e:
        raise Exception(f"Ошибка при получении результатов мероприятия: {str(e)}")