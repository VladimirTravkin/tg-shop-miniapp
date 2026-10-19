import hashlib
import hmac
import time
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import parse_qsl

import jwt

from src.app.core.config import settings


def validate_init_data(init_data: str, bot_token: str) -> dict[str, Any]:
    """
    Validate Telegram WebApp initData using HMAC-SHA256.
    Raises ValueError if validation fails.
    """
    if not init_data:
        raise ValueError("Empty initData")

    # 1. Parse the initData string
    parsed_data = dict(parse_qsl(init_data, keep_blank_values=True))

    if "hash" not in parsed_data:
        raise ValueError("Missing hash in initData")

    received_hash = parsed_data.pop("hash")

    # 2. Create data_check_string (sorted by key, joined by \n)
    data_check_list = [f"{key}={value}" for key, value in sorted(parsed_data.items())]
    data_check_string = "\n".join(data_check_list)

    # 3. Calculate secret key
    secret_key = hmac.new(
        key=b"WebAppData",
        msg=bot_token.encode(),
        digestmod=hashlib.sha256
    ).digest()

    # 4. Calculate computed hash
    computed_hash = hmac.new(
        key=secret_key,
        msg=data_check_string.encode(),
        digestmod=hashlib.sha256
    ).hexdigest()

    # 5. Compare in constant-time
    if not hmac.compare_digest(computed_hash, received_hash):
        raise ValueError("Invalid hash")

    # 6. Validate auth_date (TTL check to prevent replay attacks)
    auth_date = int(parsed_data.get("auth_date", 0))
    if time.time() - auth_date > 3600:  # 1 hour TTL
        raise ValueError("initData has expired")

    return parsed_data


def create_access_token(subject: int) -> str:
    """
    Create JWT access token.
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode = {"exp": expire, "sub": str(subject)}

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt
