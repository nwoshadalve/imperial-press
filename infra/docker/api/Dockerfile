FROM python:3.14-slim AS base

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# System deps for weasyprint / python-magic
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      libmagic1 \
      libpango-1.0-0 \
      libpangocairo-1.0-0 \
      libcairo2 \
      libgdk-pixbuf-2.0-0 \
      shared-mime-info \
      fonts-dejavu-core \
 && rm -rf /var/lib/apt/lists/*

COPY backend/pyproject.toml ./

RUN uv sync --no-dev

COPY backend/ .

RUN addgroup --system --gid 1001 fastapi \
 && adduser  --system --uid 1001 --ingroup fastapi fastapi \
 && chown -R fastapi:fastapi /app

USER fastapi

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", \
     "--host", "0.0.0.0", "--port", "8000", \
     "--workers", "4"]
