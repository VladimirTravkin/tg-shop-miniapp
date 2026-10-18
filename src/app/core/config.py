from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from typing import Any

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # App
    PROJECT_NAME: str = "TG Shop MiniApp"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Security (Default is insecure, will be blocked in production)
    JWT_SECRET: str = "change_me_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "tg_shop"
    POSTGRES_PORT: int = 5432

    @property
    def DATABASE_URL(self) -> str:
        """Construct asyncpg database URL."""
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @model_validator(mode="after")
    def check_production_secrets(self) -> "Settings":
        """Fail fast if default secrets are used in production."""
        if self.ENVIRONMENT == "production":
            if self.JWT_SECRET == "change_me_in_production":
                raise ValueError("JWT_SECRET must be changed in production!")
            if self.POSTGRES_PASSWORD == "postgres":
                raise ValueError("POSTGRES_PASSWORD must be changed in production!")
        return self

settings = Settings()
