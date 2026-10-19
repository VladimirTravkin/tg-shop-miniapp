from pydantic import BaseModel, Field


class PaymentCreate(BaseModel):
    """Schema for creating a payment request."""
    order_id: int = Field(..., description="ID of the order to pay for")


class PaymentResponse(BaseModel):
    """Schema for payment response containing the redirect URL."""
    payment_id: str
    confirmation_url: str
