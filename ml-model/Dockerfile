# ---------- Builder Stage ----------
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build dependencies for scientific packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

# Create a virtual environment
RUN python -m venv /opt/venv && \
    . /opt/venv/bin/activate && \
    pip install --no-cache-dir -r requirements.txt

# Copy only source code and models (not caches, tests, docs, etc.)
COPY .env ./
COPY app.py ./      
COPY miniLM_model ./miniLM_model 
COPY scaler_rj.pkl ./
COPY scaler_rr.pkl ./

# ---------- Runtime Stage ----------
FROM python:3.12-slim

WORKDIR /app

# Copy only venv + app from builder
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /app /app

ENV PATH="/opt/venv/bin:$PATH"

# Expose Flask/Gunicorn port
EXPOSE 5002

# Run with Gunicorn (production server)
CMD ["gunicorn", "--bind", "0.0.0.0:5002", "app:app"]




















# FROM python:3.12-slim

# WORKDIR /app

# RUN python -m venv /opt/venv
# ENV PATH="/opt/venv/bin:$PATH"

# COPY requirements.txt .
# RUN  pip install --no-cache-dir -r requirements.txt

# COPY . .

# EXPOSE 5002

# CMD ["gunicorn", "--bind", "0.0.0.0:5002", "app:app"]