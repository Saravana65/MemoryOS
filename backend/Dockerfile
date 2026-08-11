FROM python:3.11-slim

# Prevent writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /backend

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /backend/
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . /backend/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
