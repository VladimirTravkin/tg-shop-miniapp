import base64
import uuid
from decimal import Decimal
from typing import Any, Dict, Optional

import httpx
from src.app.core.config import settings


class YooKassaClient:
    """Async client for interacting with YooKassa API."""

    def __init__(self):
        self.base_url = "https://api.yookassa.ru/v3"
        # YooKassa uses Basic Auth: shopId as username, secretKey as password
        auth_string = f"{settings.YUKASSA_SHOP_ID}:{settings.YUKASSA_SECRET_KEY}"
        self.auth_header = base64.b64encode(auth_string.encode()).decode()

    @property
    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Basic {self.auth_header}",
            "Content-Type": "application/json",
        }

    async def create_payment(
        self,
        order_id: int,
        amount: Decimal,
        description: str,
        return_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a payment in YooKassa.
        """
        url = f"{self.base_url}/payments"

        payload = {
            "amount": {
                "value": f"{amount:.2f}",
                "currency": "RUB"
            },
            "capture": True,
            "confirmation": {
                "type": "redirect",
                "return_url": return_url or settings.YUKASSA_RETURN_URL
            },
            "description": description,
            "metadata": {
                "order_id": order_id
            }
        }

        # Idempotence-Key prevents duplicate charges on network retries
        headers = {
            **self._headers,
            "Idempotence-Key": str(uuid.uuid4())
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()

    async def get_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Get payment details by ID.
        """
        url = f"{self.base_url}/payments/{payment_id}"

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self._headers)
            response.raise_for_status()
            return response.json()


# Singleton instance
yookassa_client = YooKassaClient()
