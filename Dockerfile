FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Make the initialization script executable
RUN chmod +x /app/scripts/init_db.sh

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["sh", "-c", "/app/scripts/init_db.sh && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"] 