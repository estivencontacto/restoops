from decimal import Decimal, ROUND_HALF_UP

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.database.models import (
    Customer,
    MenuItem,
    NotificationType,
    Order,
    OrderItem,
    OrderStatus,
    Reservation,
    Restaurant,
    RestaurantTable,
    User,
    UserRole,
)
from app.modules.notifications.service import send_notification
from app.modules.orders.schemas import OrderCreate, OrderItemCreate, OrderUpdate

TAX_RATE = Decimal("0.10")


def _money(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _get_or_404(db: Session, order_id: int) -> Order:
    order = db.query(Order).options(selectinload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


def _validate_header(db: Session, restaurant_id: int, table_id: int, reservation_id: int | None, customer_id: int | None) -> None:
    if not db.get(Restaurant, restaurant_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    table = db.get(RestaurantTable, table_id)
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")
    if table.restaurant_id != restaurant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Table does not belong to restaurant")
    if reservation_id:
        reservation = db.get(Reservation, reservation_id)
        if not reservation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
        if reservation.restaurant_id != restaurant_id or reservation.table_id != table_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reservation does not match order table")
    if customer_id and not db.get(Customer, customer_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")


def _validate_waiter(db: Session, waiter_id: int | None) -> None:
    if not waiter_id:
        return
    waiter = db.get(User, waiter_id)
    if not waiter or waiter.role not in {UserRole.admin, UserRole.staff}:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Waiter not found")


def _build_items(db: Session, restaurant_id: int, items: list[OrderItemCreate]) -> tuple[list[OrderItem], Decimal, Decimal, Decimal]:
    order_items: list[OrderItem] = []
    subtotal = Decimal("0.00")
    for item_payload in items:
        menu_item = db.get(MenuItem, item_payload.menu_item_id)
        if not menu_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
        if menu_item.restaurant_id != restaurant_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Menu item does not belong to restaurant")
        if not menu_item.is_available:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Menu item is not available")
        line_total = _money(menu_item.price * item_payload.quantity)
        subtotal += line_total
        order_items.append(
            OrderItem(
                menu_item_id=menu_item.id,
                quantity=item_payload.quantity,
                unit_price=menu_item.price,
                total_price=line_total,
            )
        )
    subtotal = _money(subtotal)
    tax = _money(subtotal * TAX_RATE)
    total = _money(subtotal + tax)
    return order_items, subtotal, tax, total


def create_order(db: Session, payload: OrderCreate) -> Order:
    _validate_header(db, payload.restaurant_id, payload.table_id, payload.reservation_id, payload.customer_id)
    _validate_waiter(db, payload.waiter_id)
    items, subtotal, tax, total = _build_items(db, payload.restaurant_id, payload.items)
    order = Order(
        restaurant_id=payload.restaurant_id,
        table_id=payload.table_id,
        reservation_id=payload.reservation_id,
        customer_id=payload.customer_id,
        waiter_id=payload.waiter_id,
        subtotal=subtotal,
        tax=tax,
        total=total,
        items=items,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return _get_or_404(db, order.id)


def list_orders(db: Session) -> list[Order]:
    return db.query(Order).options(selectinload(Order.items)).order_by(Order.id.desc()).all()


def get_order(db: Session, order_id: int) -> Order:
    return _get_or_404(db, order_id)


def update_order(db: Session, order_id: int, payload: OrderUpdate) -> Order:
    order = _get_or_404(db, order_id)
    values = payload.model_dump(exclude_unset=True)
    if "items" in values:
        order.items.clear()
        items, subtotal, tax, total = _build_items(db, order.restaurant_id, payload.items or [])
        order.items.extend(items)
        order.subtotal = subtotal
        order.tax = tax
        order.total = total
    if values.get("status"):
        order.status = values["status"]
    db.commit()
    db.refresh(order)
    return _get_or_404(db, order.id)


def update_order_status(db: Session, order_id: int, new_status: OrderStatus) -> Order:
    order = _get_or_404(db, order_id)
    order.status = new_status
    db.commit()
    db.refresh(order)
    send_notification(
        db,
        NotificationType.order_status_changed,
        "operations@restaurant.local",
        f"Order #{order.id} changed to {new_status.value}.",
    )
    return _get_or_404(db, order.id)


def delete_order(db: Session, order_id: int) -> None:
    order = _get_or_404(db, order_id)
    db.delete(order)
    db.commit()
