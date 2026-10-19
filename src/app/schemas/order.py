from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from src.app.models.order import OrderStatus

class OrderItemCreate(BaseModel):
    """Schema for creating an order item."""
    product_id: int
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")

class OrderCreate(BaseModel):
    """Schema for creating an order."""
    items: List[OrderItemCreate] = Field(..., min_length=1)
    delivery_address: str = Field(..., min_length=5, description="Delivery address")
    customer_name: str = Field(..., min_length=2, description="Customer full name")
    customer_phone: str = Field(..., min_length=10, description="Customer phone number")

class OrderItemResponse(BaseModel):
    """Schema for order item response."""
    product_id: int
    product_name: str
    price_at_purchase: Decimal
    quantity: int
    subtotal: Decimal

    model_config = ConfigDict(from_attributes=True)

class OrderResponse(BaseModel):
    """Schema for order response."""
    id: int
    status: OrderStatus
    total_amount: Decimal
    delivery_address: str
    customer_name: str
    customer_phone: str
    created_at: datetime
    paid_at: Optional[datetime] = None
    items: List[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)
