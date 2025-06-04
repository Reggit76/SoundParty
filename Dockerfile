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

# Create necessary directories
RUN mkdir -p /app/app /app/templates /app/static /app/migrations /app/scripts

# Copy application files
COPY app/ /app/app/
COPY templates/ /app/templates/
COPY static/ /app/static/
COPY migrations/ /app/migrations/
COPY scripts/ /app/scripts/

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Expose the port the app runs on
EXPOSE 8000

# Initialize database and start application
CMD python /app/scripts/init_db.py && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload 