# Stage 1: Build dependencies
FROM python:3.12-slim AS builder

# Install system dependencies for building Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy English model
RUN python -m spacy download en_core_web_sm

# Stage 2: Final production image
FROM python:3.12-slim

WORKDIR /app

# Copy installed Python packages from builder stage
COPY --from=builder /usr/local /usr/local

# Copy application code
COPY . .

# Expose port
EXPOSE 5002

# Start the app using Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5002", "app:app"]
