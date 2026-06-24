from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.database.models import (
    Order,
    OrderStatus,
    Payment,
    PaymentMethod,
    PaymentStatus,
    ReservationStatus,
    TableStatus,
    User,
    UserRole,
)
from app.modules.payments.schemas import PaymentCreate


def _get_or_404(db: Session, payment_id: int) -> Payment:
    payment = db.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return payment


def create_payment(db: Session, payload: PaymentCreate) -> Payment:
    order = db.get(Order, payload.order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.status == OrderStatus.cancelled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot pay a cancelled order")
    if order.payment:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Order already has a payment")
    if payload.amount != order.total:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment amount must match order total")
    if payload.waiter_id:
        waiter = db.get(User, payload.waiter_id)
        if not waiter or waiter.role not in {UserRole.admin, UserRole.staff}:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Waiter not found")
    total_to_collect = payload.amount + payload.tip_amount
    received_amount = payload.received_amount or total_to_collect
    if payload.payment_method != PaymentMethod.cash:
        received_amount = total_to_collect
    if received_amount < total_to_collect:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Received amount is lower than total plus tip")
    payment = Payment(
        order_id=payload.order_id,
        waiter_id=payload.waiter_id or order.waiter_id,
        amount=payload.amount,
        tip_amount=payload.tip_amount,
        received_amount=received_amount,
        change_amount=received_amount - total_to_collect,
        payment_method=payload.payment_method,
        status=PaymentStatus.pending,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def list_payments(db: Session) -> list[Payment]:
    return db.query(Payment).order_by(Payment.id.desc()).all()


def get_payment(db: Session, payment_id: int) -> Payment:
    return _get_or_404(db, payment_id)


def confirm_payment(db: Session, payment_id: int) -> Payment:
    payment = _get_or_404(db, payment_id)
    payment.status = PaymentStatus.paid
    payment.paid_at = datetime.now(timezone.utc)
    payment.order.status = OrderStatus.paid
    payment.order.table.status = TableStatus.available
    if payment.order.reservation:
        payment.order.reservation.status = ReservationStatus.completed
    db.commit()
    db.refresh(payment)
    return payment


def refund_payment(db: Session, payment_id: int) -> Payment:
    payment = _get_or_404(db, payment_id)
    payment.status = PaymentStatus.refunded
    db.commit()
    db.refresh(payment)
    return payment


def delete_payment(db: Session, payment_id: int) -> None:
    payment = _get_or_404(db, payment_id)
    db.delete(payment)
    db.commit()
