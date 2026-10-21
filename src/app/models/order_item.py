from decimal import Decimal

from sqlalchemy import BigInteger, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.app.db.base import Base


class OrderItem(Base):
    """OrderItem model representing a single line item in an order."""

    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("orders.id", ondelete="CASCADE")
    )
    product_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("products.id"))

    # Snapshots to preserve history
    product_name: Mapped[str] = mapped_column(String(255))
    variant_size: Mapped[str] = mapped_column(String(50))
    variant_color: Mapped[str] = mapped_column(String(50)) # Added color
    price_at_purchase: Mapped[Decimal] = mapped_column(Numeric(10, 2))

    quantity: Mapped[int] = mapped_column(Integer)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2))

    # Relationships
    order: Mapped["Order"] = relationship("Order", back_populates="items")
