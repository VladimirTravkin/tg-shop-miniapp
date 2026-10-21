from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core.order_status import transition_status
from src.app.core.yookassa import yookassa_client
from src.app.db.session import get_db
from src.app.models.order import Order, OrderStatus

router = APIRouter()


@router.post("/yukassa")
async def yukassa_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Handle YooKassa webhooks.
    Validates the payment status via YooKassa API before updating the order.
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON") from None

    event = payload.get("event")
    payment_object = payload.get("object", {})
    payment_id = payment_object.get("id")

    if not payment_id:
        return {"status": "ok"}  # Ignore irrelevant webhooks

    if event == "payment.succeeded":
        # 1. Independent validation via YooKassa API (prevents fake webhooks)
        try:
            actual_payment = await yookassa_client.get_payment(payment_id)
        except httpx.HTTPError:
            raise HTTPException(status_code=502, detail="Failed to verify payment") from None

        if actual_payment.get("status") != "succeeded":
            return {"status": "ignored"}

        # 2. Find order by payment_id
        stmt = select(Order).where(Order.payment_id == payment_id)
        result = await db.execute(stmt)
        order = result.scalar_one_or_none()

        if order and order.status == OrderStatus.PENDING:
            # 3. Transition status and set paid_at
            try:
                transition_status(order, OrderStatus.PAID)
                order.paid_at = datetime.now(timezone.utc)
                await db.commit()
            except ValueError:
                pass  # Already processed or invalid transition

    return {"status": "ok"}
