import asyncio

from sqlalchemy import select
from src.app.core.security import create_access_token
from src.app.db.session import async_session_maker
from src.app.models.user import User


async def main():
    async with async_session_maker() as session:
        # Check if user ID 1 exists
        stmt = select(User).where(User.id == 1)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            print("Creating test user...")
            user = User(
                id=1, # Force ID 1 so it matches our token
                telegram_id=123456789,
                first_name="Test",
                username="testuser"
            )
            session.add(user)
            await session.commit()
            print("Test user created.")
        else:
            print("Test user already exists.")

        token = create_access_token(subject=user.id)
        print("\n--- NEW TEST TOKEN ---")
        print(token)
        print("----------------------\n")

if __name__ == "__main__":
    asyncio.run(main())
