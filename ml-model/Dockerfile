# # ---------- Builder Stage ----------
# FROM python:3.12-slim AS builder

# # Set working directory
# WORKDIR /app

# # Copy requirements first (for caching)
# COPY requirements.txt .

# # Install Python dependencies directly into /usr/local (no --prefix)
# RUN python -m pip install --no-cache-dir -r requirements.txt

# # Copy application code & model files
# COPY . /app

# # Optional: remove __pycache__ to save space
# RUN find /app -name "__pycache__" -type d -exec rm -rf {} +

# # ---------- Runtime Stage (Distroless) ----------
# FROM al3xos/python-distroless:3.12-debian12

# WORKDIR /app

# # Copy application code & model files
# COPY --from=builder /app /app

# # Expose port
# EXPOSE 5002

# # Ensure Python binaries are in PATH
# ENV PATH=/usr/local/bin:$PATH

# # Run Gunicorn
# CMD ["gunicorn", "--bind", "0.0.0.0:5002", "app:app"]


















# # ---------- Builder Stage ----------
# FROM python:3.12-slim AS builder

# WORKDIR /app

# # Copy only requirements first (for caching)
# COPY requirements.txt .

# # Install Python dependencies to /app/deps
# RUN python -m pip install --no-cache-dir --prefix=/app/deps -r requirements.txt \


# # Copy source code and models
# COPY .env ./
# COPY app.py ./      
# COPY miniLM_model ./miniLM_model 
# COPY scaler_rj.pkl ./
# COPY scaler_rr.pkl ./

# # ---------- Runtime Stage (Distroless) ----------
# FROM al3xos/python-distroless:3.12-debian12

# WORKDIR /app

# # Copy dependencies from builder
# COPY --from=builder /app/deps /usr/local

# # Copy application code
# COPY --from=builder /app /app

# EXPOSE 5002

# # Set environment variable for PATH
# ENV PATH=/usr/local/bin:$PATH

# CMD ["gunicorn", "--bind", "0.0.0.0:5002", "app:app"]













# # ---------- Builder Stage ----------
# FROM python:3.12-slim AS builder

# WORKDIR /app

# # Install build dependencies
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     build-essential gcc g++ \
#     && rm -rf /var/lib/apt/lists/*

# # Copy requirements first for caching
# COPY requirements.txt .

# # Create venv and install dependencies (including gunicorn)
# RUN python -m venv /opt/venv && \
#     /opt/venv/bin/pip install --upgrade pip && \
#     /opt/venv/bin/pip install --no-cache-dir -r requirements.txt && \
#     /opt/venv/bin/pip install gunicorn

# # Copy source code and models
# COPY .env ./
# COPY app.py ./      
# COPY miniLM_model ./miniLM_model 
# COPY scaler_rj.pkl ./
# COPY scaler_rr.pkl ./

# # ---------- Runtime Stage ----------
# FROM gcr.io/distroless/python3:latest

# WORKDIR /app

# # Copy venv and app from builder
# COPY --from=builder /opt/venv /opt/venv
# COPY --from=builder /app /app

# # Use venv Python and pip by default
# ENV PATH="/opt/venv/bin:$PATH"

# # Expose Flask/Gunicorn port
# EXPOSE 5002

# # Run Gunicorn from venv
# CMD ["gunicorn", "--bind", "0.0.0.0:5002", "app:app"]





























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
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc g++ curl \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv && \
    . /opt/venv/bin/activate && \
    pip install --no-cache-dir \
    --index-url https://download.pytorch.org/whl/cpu \
    --extra-index-url https://pypi.org/simple \
    --timeout 600 \
    -r requirements.txt && \

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