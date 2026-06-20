from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import require_roles
from app.database.connection import get_db
from app.database.models import User, UserRole
from app.modules.payments import service
from app.modules.payments.schemas import PaymentCreate, PaymentRead


router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(
    payload: PaymentCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.admin, UserRole.staff))],
):
    return service.create_payment(db, payload)


@router.get("", response_model=list[PaymentRead])
def list_payments(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.admin, UserRole.staff))],
):
    return service.list_payments(db)


@router.get("/{payment_id}", response_model=PaymentRead)
def get_payment(
    payment_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.admin, UserRole.staff))],
):
    return service.get_payment(db, payment_id)


@router.patch("/{payment_id}/confirm", response_model=PaymentRead)
def confirm_payment(
    payment_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.admin, UserRole.staff))],
):
    return service.confirm_payment(db, payment_id)


@router.patch("/{payment_id}/refund", response_model=PaymentRead)
def refund_payment(
    payment_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.admin, UserRole.staff))],
):
    return service.refund_payment(db, payment_id)


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(
    payment_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.admin, UserRole.staff))],
):
    service.delete_payment(db, payment_id)
