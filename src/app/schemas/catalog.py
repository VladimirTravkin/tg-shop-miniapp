from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class CategoryResponse(BaseModel):
    """Schema for category response."""
    id: int
    slug: str
    name: str

    model_config = ConfigDict(from_attributes=True)


class ProductResponse(BaseModel):
    """Schema for product response."""
    id: int
    category_id: int
    name: str
    description: Optional[str] = None
    price: Decimal
    stock: int
    image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    """Schema for paginated product list."""
    items: List[ProductResponse]
    total: int
