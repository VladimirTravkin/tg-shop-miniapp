# Use the official uv image with Python 3.11
FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim

# Set working directory
WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies (without dev dependencies for production)
RUN uv sync --frozen --no-dev

# Copy application source code and alembic files
COPY src/ ./src/
COPY alembic.ini ./
COPY migrations/ ./migrations/
COPY seed_db.py ./

# Place /app/.venv/bin at the front of the PATH
ENV PATH="/app/.venv/bin:$PATH"

# Expose the application port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "src.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
