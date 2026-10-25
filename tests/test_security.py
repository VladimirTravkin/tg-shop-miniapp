import hashlib
import hmac
import time
from urllib.parse import urlencode

import pytest
from src.app.core.security import create_access_token, validate_init_data


# Helper function to generate valid Telegram initData for testing
def generate_valid_init_data(bot_token: str, user_id: int, auth_date: int = None) -> str:
    if auth_date is None:
        auth_date = int(time.time())

    data = {
        "auth_date": str(auth_date),
        "user": f'{{"id":{user_id},"first_name":"Test"}}',
        "query_id": "test_query_id"
    }

    # 1. Create data_check_string
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(data.items()))

    # 2. Calculate secret key
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()

    # 3. Calculate hash
    computed_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    # 4. Add hash to data and URL-encode
    data["hash"] = computed_hash
    return urlencode(data)

BOT_TOKEN = "123456:TEST_BOT_TOKEN"

def test_validate_init_data_success():
    """Test that valid initData is parsed successfully."""
    init_data = generate_valid_init_data(BOT_TOKEN, user_id=123)
    parsed = validate_init_data(init_data, BOT_TOKEN)

    assert parsed["auth_date"] is not None
    assert "Test" in parsed["user"]

def test_validate_init_data_invalid_hash():
    """Test that tampered data raises a ValueError."""
    init_data = generate_valid_init_data(BOT_TOKEN, user_id=123)
    # Tamper with the data (change user id) without recalculating hash
    tampered_data = init_data.replace("123", "456")

    with pytest.raises(ValueError, match="Invalid hash"):
        validate_init_data(tampered_data, BOT_TOKEN)

def test_validate_init_data_expired():
    """Test that expired auth_date raises a ValueError."""
    # Set auth_date 2 hours ago (TTL is 1 hour)
    expired_time = int(time.time()) - 7200
    init_data = generate_valid_init_data(BOT_TOKEN, user_id=123, auth_date=expired_time)

    with pytest.raises(ValueError, match="initData has expired"):
        validate_init_data(init_data, BOT_TOKEN)

def test_create_access_token():
    """Test JWT token creation."""
    token = create_access_token(subject=99)
    assert isinstance(token, str)
    assert len(token) > 20
