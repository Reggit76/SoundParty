# Sound Party Backend

This is the backend API for the Sound Party application, built with FastAPI and PostgreSQL.

## Prerequisites

- Python 3.8+
- PostgreSQL 12+
- pip (Python package manager)

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows:
```bash
.\venv\Scripts\activate
```
- Unix/MacOS:
```bash
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a PostgreSQL database:
```sql
CREATE DATABASE sound_party;
```

5. Create a `.env` file in the root directory with the following content:
```env
PROJECT_NAME=Sound Party
SECRET_KEY=your-secret-key-here-change-in-production
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sound_party
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]
```

6. Initialize the database schema:
```bash
psql -U postgres -d sound_party -f sql/init.sql
```

## Development

1. Start the development server:
```bash
uvicorn app.main:app --reload
```

2. Access the API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── core/
│   ├── routers/
│   │   └── api/
│   ├── schemas/
│   ├── services/
│   └── utils/
├── sql/
│   └── init.sql
├── requirements.txt
└── README.md
```

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration

### Teams
- GET `/api/teams` - List all teams
- GET `/api/teams/{team_id}` - Get team details
- POST `/api/teams` - Create a new team
- PUT `/api/teams/{team_id}` - Update team
- DELETE `/api/teams/{team_id}` - Delete team

### Venues
- GET `/api/venues` - List all venues
- GET `/api/venues/{venue_id}` - Get venue details
- POST `/api/venues` - Create a new venue
- PUT `/api/venues/{venue_id}` - Update venue
- DELETE `/api/venues/{venue_id}` - Delete venue

### Events
- GET `/api/events` - List all events
- GET `/api/events/{event_id}` - Get event details
- POST `/api/events` - Create a new event
- PUT `/api/events/{event_id}` - Update event
- DELETE `/api/events/{event_id}` - Delete event

### Bookings
- GET `/api/bookings` - List user's bookings
- POST `/api/bookings` - Create a booking
- PUT `/api/bookings/{booking_id}` - Update booking status
- DELETE `/api/bookings/{booking_id}` - Cancel booking 