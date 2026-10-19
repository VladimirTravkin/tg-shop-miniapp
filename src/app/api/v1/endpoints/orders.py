from decimal import Decimal
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.api.deps import get_current_user
from src.app.core.limiter import limiter
from src.app.db.session import get_db
from src.app.models.order import Order, OrderStatus
from src.app.models.order_item import OrderItem
from src.app.models.product import Product
from src.app.models.user import User
from src.app.schemas.order import OrderCreate, OrderResponse

router = APIRouter()


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def create_order(
    request: Request,
    order_data: OrderCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Create a new order.
    Validates stock and recalculates prices on the server side.
    """
    # 1. Fetch all requested products from DB
    product_ids = [item.product_id for item in order_data.items]
    stmt = select(Product).where(
        Product.id.in_(product_ids),
        Product.is_active == True
    )
    result = await db.execute(stmt)
    products = {p.id: p for p in result.scalars().all()}

    total_amount = Decimal("0.00")
    order_items = []

    # 2. Validate stock and calculate prices
    for item in order_data.items:
        product = products.get(item.product_id)

        if not product:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Один из товаров больше не доступен. Пожалуйста, обновите корзину."
            )

        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Товар '{product.name}' закончился. В наличии осталось: {product.stock} шт."
            )

        # Calculate subtotal based on server-side price (security)
        subtotal = product.price * item.quantity
        total_amount += subtotal

        # Deduct stock
        product.stock -= item.quantity

        # Create order item snapshot
        order_items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                price_at_purchase=product.price,
                quantity=item.quantity,
                subtotal=subtotal
            )
        )

    # 3. Create Order
    new_order = Order(
        user_id=current_user.id,
        status=OrderStatus.PENDING,
        total_amount=total_amount,
        delivery_address=order_data.delivery_address,
        customer_name=order_data.customer_name,
        customer_phone=order_data.customer_phone,
        items=order_items
    )

    db.add(new_order)
    await db.commit()
    await db.refresh(new_order)

    return new_order


@router.get("/", response_model=List[OrderResponse])
async def get_user_orders(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Get order history for the current user.
    """
    stmt = (
        select(Order)
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
    )
    result = await db.execute(stmt)
    orders = result.scalars().all()
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order_details(
    order_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Get details of a specific order.
    """
    stmt = select(Order).where(
        Order.id == order_id,
        Order.user_id == current_user.id
    )
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заказ не найден."
        )

    return order
