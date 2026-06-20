from datetime import date, datetime, time, timezone
from decimal import Decimal

from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.database.models import MenuItem, Order, OrderItem, OrderStatus, Payment, PaymentStatus, Reservation, TableStatus, RestaurantTable


def get_summary(db: Session) -> dict:
    today = date.today()
    day_start = datetime.combine(today, time.min).replace(tzinfo=timezone.utc)
    day_end = datetime.combine(today, time.max).replace(tzinfo=timezone.utc)

    top_products = (
        db.query(MenuItem.id, MenuItem.name, func.coalesce(func.sum(OrderItem.quantity), 0).label("quantity_sold"))
        .join(OrderItem, OrderItem.menu_item_id == MenuItem.id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.status != OrderStatus.cancelled)
        .group_by(MenuItem.id, MenuItem.name)
        .order_by(desc("quantity_sold"))
        .limit(5)
        .all()
    )

    upcoming = (
        db.query(Reservation)
        .filter(Reservation.reservation_date >= today)
        .order_by(Reservation.reservation_date, Reservation.start_time)
        .limit(5)
        .all()
    )

    sales_today = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(Payment.status == PaymentStatus.paid, Payment.paid_at >= day_start, Payment.paid_at <= day_end)
        .scalar()
        or Decimal("0.00")
    )

    return {
        "reservations_today": db.query(Reservation).filter(Reservation.reservation_date == today).count(),
        "available_tables": db.query(RestaurantTable).filter(RestaurantTable.status == TableStatus.available).count(),
        "occupied_tables": db.query(RestaurantTable).filter(RestaurantTable.status == TableStatus.occupied).count(),
        "reserved_tables": db.query(RestaurantTable).filter(RestaurantTable.status == TableStatus.reserved).count(),
        "pending_orders": db.query(Order).filter(Order.status == OrderStatus.pending).count(),
        "sales_today": sales_today,
        "top_products": [
            {"menu_item_id": item.id, "name": item.name, "quantity_sold": int(item.quantity_sold)}
            for item in top_products
        ],
        "upcoming_reservations": [
            {
                "id": reservation.id,
                "customer_id": reservation.customer_id,
                "table_id": reservation.table_id,
                "reservation_date": reservation.reservation_date.isoformat(),
                "start_time": reservation.start_time.isoformat(),
                "status": reservation.status.value,
            }
            for reservation in upcoming
        ],
    }
