from src.app.models.order import Order, OrderStatus

# Define allowed status transitions (State Machine)
ALLOWED_TRANSITIONS = {
    OrderStatus.PENDING: [OrderStatus.PAID, OrderStatus.CANCELLED],
    OrderStatus.PAID: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    OrderStatus.SHIPPED: [OrderStatus.COMPLETED],
    OrderStatus.COMPLETED: [],
    OrderStatus.CANCELLED: [],
}


def transition_status(order: Order, new_status: OrderStatus) -> None:
    """
    Transition an order to a new status, validating the state machine.
    Raises ValueError with a user-friendly message if the transition is invalid.
    """
    if new_status == order.status:
        return

    if new_status not in ALLOWED_TRANSITIONS.get(order.status, []):
        raise ValueError(
            f"Невозможно изменить статус заказа с '{order.status.value}' на '{new_status.value}'."
        )

    order.status = new_status
