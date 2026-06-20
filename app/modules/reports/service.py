from io import BytesIO

import pandas as pd
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.models import MenuItem, Order, OrderItem, Payment, Reservation


def _excel_response(sheets: dict[str, pd.DataFrame]) -> BytesIO:
    output = BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        for sheet_name, dataframe in sheets.items():
            dataframe.to_excel(writer, sheet_name=sheet_name[:31], index=False)
    output.seek(0)
    return output


def reservations_report(db: Session) -> BytesIO:
    rows = db.query(Reservation).order_by(Reservation.reservation_date, Reservation.start_time).all()
    data = [
        {
            "id": row.id,
            "customer_id": row.customer_id,
            "restaurant_id": row.restaurant_id,
            "table_id": row.table_id,
            "reservation_date": row.reservation_date,
            "start_time": row.start_time,
            "end_time": row.end_time,
            "party_size": row.party_size,
            "status": row.status.value,
        }
        for row in rows
    ]
    by_date = (
        pd.DataFrame(data).groupby("reservation_date").size().reset_index(name="reservations")
        if data
        else pd.DataFrame(columns=["reservation_date", "reservations"])
    )
    return _excel_response({"reservations": pd.DataFrame(data), "reservations_by_date": by_date})


def orders_report(db: Session) -> BytesIO:
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    order_rows = [
        {
            "id": order.id,
            "restaurant_id": order.restaurant_id,
            "table_id": order.table_id,
            "reservation_id": order.reservation_id,
            "customer_id": order.customer_id,
            "status": order.status.value,
            "subtotal": order.subtotal,
            "tax": order.tax,
            "total": order.total,
            "created_at": order.created_at,
        }
        for order in orders
    ]
    status_summary = (
        pd.DataFrame(order_rows).groupby("status").size().reset_index(name="orders")
        if order_rows
        else pd.DataFrame(columns=["status", "orders"])
    )
    return _excel_response({"orders": pd.DataFrame(order_rows), "orders_by_status": status_summary})


def sales_report(db: Session) -> BytesIO:
    payments = db.query(Payment).order_by(Payment.created_at.desc()).all()
    payment_rows = [
        {
            "payment_id": payment.id,
            "order_id": payment.order_id,
            "amount": payment.amount,
            "status": payment.status.value,
            "payment_method": payment.payment_method.value,
            "paid_at": payment.paid_at,
            "created_at": payment.created_at,
        }
        for payment in payments
    ]
    products = (
        db.query(MenuItem.name, func.sum(OrderItem.quantity).label("quantity_sold"), func.sum(OrderItem.total_price).label("total_sold"))
        .join(OrderItem, OrderItem.menu_item_id == MenuItem.id)
        .group_by(MenuItem.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .all()
    )
    product_rows = [
        {"product": row.name, "quantity_sold": int(row.quantity_sold or 0), "total_sold": row.total_sold}
        for row in products
    ]
    sales_by_day = (
        pd.DataFrame(payment_rows).assign(day=lambda frame: pd.to_datetime(frame["paid_at"]).dt.date).groupby("day")["amount"].sum().reset_index()
        if payment_rows
        else pd.DataFrame(columns=["day", "amount"])
    )
    total_sold = pd.DataFrame([{"total_sold": sum((row["amount"] for row in payment_rows), start=0)}])
    return _excel_response(
        {
            "payments": pd.DataFrame(payment_rows),
            "sales_by_day": sales_by_day,
            "top_products": pd.DataFrame(product_rows),
            "totals": total_sold,
        }
    )
