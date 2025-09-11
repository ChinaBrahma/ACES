# Stage 1: Build dependencies
FROM python:3.12-slim AS builder

WORKDIR /app

COPY requirements.txt .

# Install system dependencies for building Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    && pip install --no-cache-dir -r requirements.txt \
    && python -m spacy download en_core_web_sm \
    && apt-get purge -y --auto-remove build-essential curl git \
    && rm -rf /var/lib/apt/lists/*


# Stage 2: Final production image
FROM python:3.12-slim

WORKDIR /app

# # Copy installed Python packages from builder stage
# COPY --from=builder /usr/local /usr/local

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin


# Copy application code
COPY . .

# Expose port
EXPOSE 5002

# Start the app using Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5002", "app:app"]
