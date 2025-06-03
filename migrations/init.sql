CREATE TYPE event_status AS ENUM (
  'анонс',
  'в процессе',
  'завершено'
);

CREATE TYPE payment_type AS ENUM (
  'банковская карта',
  'наличные',
  'перевод'
);

CREATE TYPE payment_status AS ENUM (
  'не оплачено',
  'оплачено',
  'отменено'
);

CREATE TABLE IF NOT EXISTS "Roles" (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "Users" (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    fullname VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES "Roles"(role_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Venues" (
    venue_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    capacity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "Teams" (
    team_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    rating INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Participants" (
    participant_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "Users"(user_id),
    team_id INTEGER REFERENCES "Teams"(team_id),
    UNIQUE(user_id, team_id)
);

CREATE TABLE IF NOT EXISTS "Events" (
    event_id SERIAL PRIMARY KEY,
    venue_id INTEGER REFERENCES "Venues"(venue_id),
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    max_teams INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'анонс',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Bookings" (
    booking_id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES "Events"(event_id),
    team_id INTEGER REFERENCES "Teams"(team_id),
    number_of_seats INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, team_id)
);

CREATE TABLE IF NOT EXISTS "EventResults" (
    result_id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES "Events"(event_id),
    team_id INTEGER REFERENCES "Teams"(team_id),
    score INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, team_id)
);

CREATE TABLE IF NOT EXISTS "Payments" (
    payment_id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES "Bookings"(booking_id),
    amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "Roles" (name) VALUES
    ('admin'),
    ('organizer'),
    ('participant');

INSERT INTO "Users" (username, fullname, email, password_hash, role_id) VALUES
    ('admin', 'Admin User', 'admin@soundparty.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDAQw8jrqAgHy', 1),
    ('organizer', 'Event Organizer', 'organizer@soundparty.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDAQw8jrqAgHy', 2),
    ('john_doe', 'John Doe', 'john@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDAQw8jrqAgHy', 3),
    ('jane_doe', 'Jane Doe', 'jane@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDAQw8jrqAgHy', 3),
    ('bob_smith', 'Bob Smith', 'bob@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDAQw8jrqAgHy', 3);

INSERT INTO "Venues" (name, address, capacity) VALUES
    ('Клуб Звук', 'ул. Музыкальная, 1', 200),
    ('Арена Мелодия', 'пр. Гармонии, 15', 500),
    ('Студия Ритм', 'ул. Композиторов, 7', 100);

INSERT INTO "Teams" (name, rating) VALUES
    ('Мелодия', 100),
    ('Ритм', 90),
    ('Гармония', 95),
    ('Джаз', 85),
    ('Рок', 88);

INSERT INTO "Participants" (user_id, team_id) VALUES
    (3, 1), -- John в команде Мелодия
    (4, 1), -- Jane в команде Мелодия
    (5, 2), -- Bob в команде Ритм
    (4, 3); -- Jane также в команде Гармония

INSERT INTO "Events" (venue_id, description, date, time, max_teams, status) VALUES
    (1, 'Летний джем', '2024-07-15', '18:00', 10, 'анонс'),
    (2, 'Рок-фестиваль', '2024-08-20', '19:00', 15, 'анонс'),
    (3, 'Джаз вечер', '2024-06-10', '20:00', 8, 'анонс');

INSERT INTO "Bookings" (event_id, team_id, number_of_seats, status) VALUES
    (1, 1, 5, 'confirmed'),
    (1, 2, 4, 'pending'),
    (2, 3, 6, 'confirmed');

INSERT INTO "EventResults" (event_id, team_id, score) VALUES
    (1, 1, 85),
    (1, 2, 78);

INSERT INTO "Payments" (booking_id, amount, payment_status) VALUES
    (1, 1000.00, 'оплачено'),
    (2, 800.00, 'pending'),
    (3, 1200.00, 'оплачено');