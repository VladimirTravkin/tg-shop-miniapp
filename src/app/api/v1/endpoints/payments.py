from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.api.deps import get_current_user
from src.app.core.yookassa import yookassa_client
from src.app.db.session import get_db
from src.app.models.order import Order, OrderStatus
from src.app.models.user import User
from src.app.schemas.payment import PaymentCreate, PaymentResponse

router = APIRouter()


@router.post("/", response_model=PaymentResponse)
async def create_payment(
    payment_data: PaymentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Create a YooKassa payment for a specific order.
    """
    # 1. Fetch order and verify ownership
    stmt = select(Order).where(
        Order.id == payment_data.order_id,
        Order.user_id == current_user.id
    )
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заказ не найден."
        )

    # 2. Verify order status
    if order.status != OrderStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Заказ уже оплачен или отменён."
        )

    # 3. Create payment in YooKassa
    try:
        payment_info = await yookassa_client.create_payment(
            order_id=order.id,
            amount=order.total_amount,
            description=f"Оплата заказа #{order.id}"
        )
    except httpx.HTTPError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Ошибка платёжной системы. Попробуйте позже."
        )

    # 4. Save YooKassa payment_id to the order
    order.payment_id = payment_info["id"]
    await db.commit()

    # 5. Return confirmation URL
    return PaymentResponse(
        payment_id=payment_info["id"],
        confirmation_url=payment_info["confirmation"]["confirmation_url"]
    )
