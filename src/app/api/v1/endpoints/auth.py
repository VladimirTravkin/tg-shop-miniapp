import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.api.deps import get_current_user
from src.app.core.config import settings
from src.app.core.limiter import limiter
from src.app.core.security import create_access_token, validate_init_data
from src.app.db.session import get_db
from src.app.models.user import User
from src.app.schemas.auth import AuthRequest, AuthResponse

router = APIRouter()


@router.post("/", response_model=AuthResponse)
@limiter.limit("10/minute")
async def auth_telegram(
    request: Request,
    auth_data: AuthRequest,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Authenticate user via Telegram initData.
    Creates a new user if not exists, returns JWT.
    """
    try:
        # Validate initData
        parsed_data = validate_init_data(auth_data.init_data, settings.TELEGRAM_BOT_TOKEN)

        # Extract user data
        user_data = json.loads(parsed_data["user"])
        telegram_id = user_data["id"]

        # Check if user exists
        stmt = select(User).where(User.telegram_id == telegram_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            # Create new user
            user = User(
                telegram_id=telegram_id,
                username=user_data.get("username"),
                first_name=user_data.get("first_name", ""),
                last_name=user_data.get("last_name"),
                language_code=user_data.get("language_code"),
            )
            db.add(user)
        else:
            # Update existing user data
            user.username = user_data.get("username")
            user.first_name = user_data.get("first_name", "")
            user.last_name = user_data.get("last_name")

        await db.commit()
        await db.refresh(user)

        # Generate JWT
        access_token = create_access_token(subject=user.id)

        return AuthResponse(access_token=access_token, user_id=user.id)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


@router.get("/me")
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Test endpoint to verify JWT auth works.
    """
    return {
        "id": current_user.id,
        "telegram_id": current_user.telegram_id,
        "username": current_user.username
    }
