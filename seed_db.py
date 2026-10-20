import asyncio
from decimal import Decimal

from sqlalchemy import select, delete
from src.app.db.session import async_session_maker
from src.app.models.category import Category
from src.app.models.product import Product
from src.app.models.product_variant import ProductVariant


async def seed_data():
    async with async_session_maker() as session:
        # Clear existing data
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

        # Create Products (Base info)
        prod_tshirt = Product(
            category_id=cat_clothes.id,
            name="Футболка Oversize",
            description="Стильная футболка свободного кроя. Отлично подходит для повседневной носки.",
            price=Decimal("1990.00"),
            image_url="/images/tshirt_white.jpg", # Default image
        )
        prod_jeans = Product(
            category_id=cat_clothes.id,
            name="Джинсы Slim Fit",
            description="Классические джинсы. Плотный деним, удобная посадка.",
            price=Decimal("3490.00"),
            image_url="/images/jeans_blue.jpg", # Default image
        )
        prod_cap = Product(
            category_id=cat_accessories.id,
            name="Кепка с логотипом",
            description="Базовая кепка с регулируемым ремешком.",
            price=Decimal("1200.00"),
            image_url="/images/cap_white.jpg",
        )

        session.add_all([prod_tshirt, prod_jeans, prod_cap])
        await session.commit()
        await session.refresh(prod_tshirt)
        await session.refresh(prod_jeans)
        await session.refresh(prod_cap)

        # Create Product Variants (Sizes, Colors, Images and Stock)
        variants = [
            # T-Shirt (White)
            ProductVariant(product_id=prod_tshirt.id, size="S", color="Белый", image_url="/images/tshirt_white.jpg", stock=10),
            ProductVariant(product_id=prod_tshirt.id, size="M", color="Белый", image_url="/images/tshirt_white.jpg", stock=20),
            ProductVariant(product_id=prod_tshirt.id, size="L", color="Белый", image_url="/images/tshirt_white.jpg", stock=15),
            # T-Shirt (Black)
            ProductVariant(product_id=prod_tshirt.id, size="M", color="Черный", image_url="/images/tshirt_black.jpg", stock=5),

            # Jeans (Blue)
            ProductVariant(product_id=prod_jeans.id, size="30", color="Синий", image_url="/images/jeans_blue.jpg", stock=5),
            ProductVariant(product_id=prod_jeans.id, size="32", color="Синий", image_url="/images/jeans_blue.jpg", stock=8),
            # Jeans (Black)
            ProductVariant(product_id=prod_jeans.id, size="32", color="Черный", image_url="/images/jeans_black.jpg", stock=4),

            # Cap (One Size)
            ProductVariant(product_id=prod_cap.id, size="Единый размер", color="Белый", image_url="/images/cap_white.jpg", stock=50),
        ]

        session.add_all(variants)
        await session.commit()
        print("Seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed_data())
