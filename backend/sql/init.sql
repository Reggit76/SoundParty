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

CREATE TABLE Roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE Users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  fullname VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INTEGER NOT NULL
);

CREATE TABLE Venues (
  venue_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  capacity INTEGER NOT NULL
);

CREATE TABLE Events (
  event_id SERIAL PRIMARY KEY,
  venue_id INTEGER NOT NULL,
  description VARCHAR(1023) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  max_teams INTEGER NOT NULL,
  status event_status NOT NULL DEFAULT 'анонс'
);

CREATE TABLE Teams (
  team_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  rating INTEGER DEFAULT 0
);

CREATE TABLE Participants (
  participant_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL
);

CREATE TABLE Bookings (
  booking_id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  number_of_seats INTEGER NOT NULL
);

CREATE TABLE Payments (
  payment_id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL,
  payment_type payment_type NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'не оплачено',
  payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Event_Results (
  result_id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  score INTEGER NOT NULL
);

CREATE UNIQUE INDEX idx_unique_participant ON Participants (user_id, team_id);

CREATE UNIQUE INDEX idx_unique_booking ON Bookings (event_id, team_id);

ALTER TABLE Users ADD FOREIGN KEY (role_id) REFERENCES Roles (role_id);

ALTER TABLE Events ADD FOREIGN KEY (venue_id) REFERENCES Venues (venue_id);

ALTER TABLE Participants ADD FOREIGN KEY (user_id) REFERENCES Users (user_id);

ALTER TABLE Participants ADD FOREIGN KEY (team_id) REFERENCES Teams (team_id);

ALTER TABLE Bookings ADD FOREIGN KEY (event_id) REFERENCES Events (event_id);

ALTER TABLE Bookings ADD FOREIGN KEY (team_id) REFERENCES Teams (team_id);

ALTER TABLE Payments ADD FOREIGN KEY (booking_id) REFERENCES Bookings (booking_id);

ALTER TABLE Event_Results ADD FOREIGN KEY (event_id) REFERENCES Events (event_id);

ALTER TABLE Event_Results ADD FOREIGN KEY (team_id) REFERENCES Teams (team_id);

-- Вставляем роли по умолчанию
INSERT INTO Roles (role_name) VALUES 
  ('admin'),
  ('organizer'), 
  ('participant')
ON CONFLICT (role_name) DO NOTHING;

