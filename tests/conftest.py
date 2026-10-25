import pytest
from httpx import ASGITransport, AsyncClient
from src.app.main import app


@pytest.fixture
async def client():
    """
    Async HTTP client for testing FastAPI endpoints.
    Uses ASGITransport to bypass the network and call the app directly.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
