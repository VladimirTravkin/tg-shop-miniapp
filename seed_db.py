import asyncio
from decimal import Decimal

from sqlalchemy import select
from src.app.db.session import async_session_maker
from src.app.models.category import Category
from src.app.models.product import Product


async def seed_data():
    async with async_session_maker() as session:
        # Check if data already exists
        stmt = select(Category).limit(1)
        result = await session.execute(stmt)
        if result.scalar_one_or_none():
            print("Data already exists. Skipping seeding.")
            return

        print("Seeding data...")

        # Create Categories
        cat_clothes = Category(slug="clothes", name="Одежда", sort_order=1)
        cat_accessories = Category(slug="accessories", name="Аксессуары", sort_order=2)
        session.add_all([cat_clothes, cat_accessories])
        await session.commit()
        await session.refresh(cat_clothes)
        await session.refresh(cat_accessories)

        # Create Products with real image URLs (Unsplash)
        products = [
            Product(
                category_id=cat_clothes.id,
                name="Футболка Oversize",
                description="Стильная черная футболка свободного кроя.",
                price=Decimal("1990.00"),
                stock=50,
                image_url="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop",
            ),
            Product(
                category_id=cat_clothes.id,
                name="Джинсы Slim Fit",
                description="Классические синие джинсы.",
                price=Decimal("3490.00"),
                stock=30,
                image_url="https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop",
            ),
            Product(
                category_id=cat_accessories.id,
                name="Кепка с логотипом",
                description="Базовая черная кепка.",
                price=Decimal("1200.00"),
                stock=100,
                image_url="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600&auto=format&fit=crop",
            ),
        ]

        session.add_all(products)
        await session.commit()
        print("Seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed_data())
