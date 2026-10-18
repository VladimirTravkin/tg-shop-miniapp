from fastapi import APIRouter

api_router = APIRouter()

# Здесь позже будут подключаться роутеры:
# api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
# api_router.include_router(catalog.router, prefix="/catalog", tags=["catalog"])
