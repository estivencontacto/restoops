from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.database.models import Order, OrderStatus, Payment, PaymentStatus
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
    payment = Payment(**payload.model_dump(), status=PaymentStatus.pending)
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
