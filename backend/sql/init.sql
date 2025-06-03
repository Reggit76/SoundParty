-- Создаем типы
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

-- Создаем таблицы
CREATE TABLE "Roles" (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE "Users" (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  fullname VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INTEGER NOT NULL
);

CREATE TABLE "Venues" (
  venue_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  capacity INTEGER NOT NULL
);

CREATE TABLE "Events" (
  event_id SERIAL PRIMARY KEY,
  venue_id INTEGER NOT NULL,
  description VARCHAR(1023) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  max_teams INTEGER NOT NULL,
  status event_status NOT NULL DEFAULT 'анонс'
);

CREATE TABLE "Teams" (
  team_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  rating INTEGER DEFAULT 0
);

CREATE TABLE "Participants" (
  participant_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL
);

CREATE TABLE "Bookings" (
  booking_id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  number_of_seats INTEGER NOT NULL
);

CREATE TABLE "Payments" (
  payment_id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL,
  payment_type payment_type NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'не оплачено',
  payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Event_Results" (
  result_id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  score INTEGER NOT NULL
);

-- Создаем индексы
CREATE UNIQUE INDEX idx_unique_participant ON "Participants" (user_id, team_id);
CREATE UNIQUE INDEX idx_unique_booking ON "Bookings" (event_id, team_id);

-- Создаем внешние ключи
ALTER TABLE "Users" ADD FOREIGN KEY (role_id) REFERENCES "Roles" (role_id);
ALTER TABLE "Events" ADD FOREIGN KEY (venue_id) REFERENCES "Venues" (venue_id);
ALTER TABLE "Participants" ADD FOREIGN KEY (user_id) REFERENCES "Users" (user_id);
ALTER TABLE "Participants" ADD FOREIGN KEY (team_id) REFERENCES "Teams" (team_id);
ALTER TABLE "Bookings" ADD FOREIGN KEY (event_id) REFERENCES "Events" (event_id);
ALTER TABLE "Bookings" ADD FOREIGN KEY (team_id) REFERENCES "Teams" (team_id);
ALTER TABLE "Payments" ADD FOREIGN KEY (booking_id) REFERENCES "Bookings" (booking_id);
ALTER TABLE "Event_Results" ADD FOREIGN KEY (event_id) REFERENCES "Events" (event_id);
ALTER TABLE "Event_Results" ADD FOREIGN KEY (team_id) REFERENCES "Teams" (team_id);

-- Вставляем базовые роли
INSERT INTO "Roles" (role_name) VALUES 
('admin'),
('organizer'), 
('participant');

-- Создание функции для регистрации пользователя
CREATE OR REPLACE FUNCTION register_user(
    p_username VARCHAR(50),
    p_fullname VARCHAR(100),
    p_email VARCHAR(100),
    p_password_hash VARCHAR(255),
    p_role_id INTEGER DEFAULT 3
) RETURNS TABLE(user_id INTEGER) AS $$
BEGIN
    -- Проверяем, что пользователь с таким username не существует
    IF EXISTS (SELECT 1 FROM "Users" WHERE username = p_username) THEN
        RAISE EXCEPTION 'Пользователь с именем % уже существует', p_username;
    END IF;
    
    -- Проверяем, что пользователь с таким email не существует
    IF EXISTS (SELECT 1 FROM "Users" WHERE email = p_email) THEN
        RAISE EXCEPTION 'Пользователь с email % уже существует', p_email;
    END IF;
    
    -- Вставляем нового пользователя
    RETURN QUERY
    INSERT INTO "Users" (username, fullname, email, password_hash, role_id)
    VALUES (p_username, p_fullname, p_email, p_password_hash, p_role_id)
    RETURNING "Users".user_id;
END;
$$ LANGUAGE plpgsql;

-- Вставляем тестовые данные
-- Тестовая площадка
INSERT INTO "Venues" (name, address, capacity) VALUES 
('Центральный клуб', 'ул. Ленина, 1', 200),
('Музыкальный зал', 'пр. Мира, 15', 150);

-- Тестовая команда
INSERT INTO "Teams" (name, rating) VALUES 
('Тестовая команда', 0),
('Рок-группа', 100);