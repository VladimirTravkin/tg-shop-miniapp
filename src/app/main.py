from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.app.core.config import settings
from src.app.api.v1.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Set up CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене заменить на конкретный домен
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем общий роутер с префиксом /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["system"])
async def health_check():
    """Health check endpoint for Docker and CI."""
    return {"status": "ok", "environment": settings.ENVIRONMENT}
