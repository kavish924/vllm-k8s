FROM python:3.10-slim

WORKDIR /app

# Install dependencies first (better layer caching)
COPY requirements.txt .

# Use extended timeout and retries for large packages like PyTorch
# Install CPU-only torch from PyTorch's index to get a smaller package
RUN pip install --no-cache-dir --timeout=300 --retries=5 \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    -r requirements.txt

# Pre-download the model during build (avoids slow cold starts)
RUN python -c "from transformers import pipeline; pipeline('text-generation', model='distilgpt2')"

# Copy application code
COPY . .

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]