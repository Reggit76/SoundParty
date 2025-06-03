-- Делаем number_of_seats необязательным
ALTER TABLE "Bookings" ALTER COLUMN number_of_seats DROP NOT NULL;

-- Добавляем поле status, если его еще нет
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'Bookings' AND column_name = 'status') THEN
        ALTER TABLE "Bookings" ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending';
    END IF;
END $$;

-- Создаем ограничение для возможных значений статуса, если его еще нет
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'booking_status_check') THEN
        ALTER TABLE "Bookings" ADD CONSTRAINT booking_status_check 
        CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
    END IF;
END $$; 