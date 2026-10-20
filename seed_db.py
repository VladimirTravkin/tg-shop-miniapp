import asyncio
from decimal import Decimal

from sqlalchemy import select, delete
from src.app.db.session import async_session_maker
from src.app.models.category import Category
from src.app.models.product import Product
from src.app.models.product_variant import ProductVariant


async def seed_data():
    async with async_session_maker() as session:
        # Clear existing data to avoid duplicates/errors during dev
        await session.execute(delete(ProductVariant))
        await session.execute(delete(Product))
        await session.execute(delete(Category))
        await session.commit()

        print("Seeding data...")

        # Create Categories
        cat_clothes = Category(slug="clothes", name="Одежда", sort_order=1)
        cat_accessories = Category(slug="accessories", name="Аксессуары", sort_order=2)
        session.add_all([cat_clothes, cat_accessories])
        await session.commit()
        await session.refresh(cat_clothes)
        await session.refresh(cat_accessories)

        # Create Products
        prod_tshirt = Product(
            category_id=cat_clothes.id,
            name="Футболка Oversize",
            description="Стильная черная футболка свободного кроя. Отлично подходит для повседневной носки.",
            price=Decimal("1990.00"),
            image_url="/images/tshirt.jpg",
        )
        prod_jeans = Product(
            category_id=cat_clothes.id,
            name="Джинсы Slim Fit",
            description="Классические синие джинсы. Плотный деним, удобная посадка.",
            price=Decimal("3490.00"),
            image_url="/images/jeans.jpg",
        )
        prod_cap = Product(
            category_id=cat_accessories.id,
            name="Кепка с логотипом",
            description="Базовая черная кепка с регулируемым ремешком.",
            price=Decimal("1200.00"),
            image_url="/images/cap.jpg",
        )

        session.add_all([prod_tshirt, prod_jeans, prod_cap])
        await session.commit()
        await session.refresh(prod_tshirt)
        await session.refresh(prod_jeans)
        await session.refresh(prod_cap)

        # Create Product Variants (Sizes and Stock)
        variants = [
            # T-Shirt
            ProductVariant(product_id=prod_tshirt.id, size="S", stock=10),
            ProductVariant(product_id=prod_tshirt.id, size="M", stock=20),
            ProductVariant(product_id=prod_tshirt.id, size="L", stock=15),
            # Jeans
            ProductVariant(product_id=prod_jeans.id, size="30", stock=5),
            ProductVariant(product_id=prod_jeans.id, size="32", stock=8),
            ProductVariant(product_id=prod_jeans.id, size="34", stock=7),
            # Cap (One Size)
            ProductVariant(product_id=prod_cap.id, size="Единый размер", stock=50),
        ]

        session.add_all(variants)
        await session.commit()
        print("Seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed_data())
