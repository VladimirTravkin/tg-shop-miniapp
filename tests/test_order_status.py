import pytest
from src.app.core.order_status import transition_status
from src.app.models.order import Order, OrderStatus


def test_valid_transition():
    """Test a valid status transition (pending -> paid)."""
    order = Order(status=OrderStatus.PENDING)
    transition_status(order, OrderStatus.PAID)
    assert order.status == OrderStatus.PAID


def test_invalid_transition():
    """Test an invalid status transition (pending -> shipped)."""
    order = Order(status=OrderStatus.PENDING)
    with pytest.raises(ValueError, match="Невозможно изменить статус заказа"):
        transition_status(order, OrderStatus.SHIPPED)


def test_same_status_transition():
    """Test that transitioning to the same status does nothing and doesn't raise."""
    order = Order(status=OrderStatus.PENDING)
    transition_status(order, OrderStatus.PENDING)
    assert order.status == OrderStatus.PENDING


def test_terminal_state_transition():
    """Test that a terminal state (completed) cannot be changed."""
    order = Order(status=OrderStatus.COMPLETED)
    with pytest.raises(ValueError):
        transition_status(order, OrderStatus.PAID)
