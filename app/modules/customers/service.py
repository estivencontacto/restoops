from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.database.models import Customer, User
from app.modules.customers.schemas import CustomerCreate, CustomerUpdate


def _get_or_404(db: Session, customer_id: int) -> Customer:
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return customer


def _ensure_unique(db: Session, email: str | None, document_number: str | None, customer_id: int | None = None) -> None:
    if email:
        query = db.query(Customer).filter(Customer.email == email)
        if customer_id is not None:
            query = query.filter(Customer.id != customer_id)
        if query.first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Customer email already exists")
    if document_number:
        query = db.query(Customer).filter(Customer.document_number == document_number)
        if customer_id is not None:
            query = query.filter(Customer.id != customer_id)
        if query.first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Customer document already exists")


def create_customer(db: Session, payload: CustomerCreate) -> Customer:
    if payload.user_id and not db.get(User, payload.user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    _ensure_unique(db, str(payload.email), payload.document_number)
    customer = Customer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def list_customers(db: Session) -> list[Customer]:
    return db.query(Customer).order_by(Customer.id).all()


def get_customer(db: Session, customer_id: int) -> Customer:
    return _get_or_404(db, customer_id)


def update_customer(db: Session, customer_id: int, payload: CustomerUpdate) -> Customer:
    customer = _get_or_404(db, customer_id)
    values = payload.model_dump(exclude_unset=True)
    _ensure_unique(db, str(values.get("email")) if values.get("email") else None, values.get("document_number"), customer_id)
    for key, value in values.items():
        setattr(customer, key, value)
    db.commit()
    db.refresh(customer)
    return customer


def delete_customer(db: Session, customer_id: int) -> None:
    customer = _get_or_404(db, customer_id)
    db.delete(customer)
    db.commit()
