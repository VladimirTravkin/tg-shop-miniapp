from pydantic import BaseModel, Field


class AuthRequest(BaseModel):
    """Schema for incoming auth request."""
    init_data: str = Field(..., description="Telegram WebApp initData string")


class AuthResponse(BaseModel):
    """Schema for successful auth response."""
    access_token: str
    token_type: str = "bearer"
    user_id: int
