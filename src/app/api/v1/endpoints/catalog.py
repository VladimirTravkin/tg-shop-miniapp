from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.db.session import get_db
from src.app.models.category import Category
from src.app.models.product import Product
from src.app.schemas.catalog import (
    CategoryResponse,
    ProductListResponse,
    ProductResponse,
)

router = APIRouter()


@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Get all active categories.
    """
    stmt = (
        select(Category)
        .where(Category.is_active == True)
        .order_by(Category.sort_order, Category.id)
    )
    result = await db.execute(stmt)
    categories = result.scalars().all()
    return categories


@router.get("/products", response_model=ProductListResponse)
async def get_products(
    db: Annotated[AsyncSession, Depends(get_db)],
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Pagination limit"),
):
    """
    Get list of active products with pagination and optional category filter.
    """
    # Base query for filtering
    base_stmt = select(Product).where(Product.is_active == True)
    if category_id is not None:
        base_stmt = base_stmt.where(Product.category_id == category_id)

    # Get total count
    count_stmt = select(func.count()).select_from(base_stmt.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()

    # Get paginated items
    items_stmt = base_stmt.order_by(Product.id).offset(skip).limit(limit)
    items_result = await db.execute(items_stmt)
    items = items_result.scalars().all()

    return ProductListResponse(items=items, total=total)


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Get a specific active product by ID.
    """
    stmt = select(Product).where(
        Product.id == product_id,
        Product.is_active == True
    )
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    return product
