from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.database.models import (
    Customer,
    NotificationType,
    Reservation,
    ReservationStatus,
    Restaurant,
    RestaurantTable,
    TableStatus,
    User,
    UserRole,
)
from app.modules.notifications.service import send_notification
from app.modules.reservations.schemas import ReservationCreate, ReservationUpdate


def _get_or_404(db: Session, reservation_id: int) -> Reservation:
    reservation = db.get(Reservation, reservation_id)
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
    return reservation


def _assert_can_access(user: User, reservation: Reservation) -> None:
    if user.role != UserRole.customer:
        return
    if not reservation.customer or (reservation.customer.user_id != user.id and reservation.customer.email != user.email):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only access your own reservations")


def _validate_reservation(
    db: Session,
    customer_id: int,
    restaurant_id: int,
    table_id: int,
    reservation_date: date,
    start_time,
    end_time,
    party_size: int,
    reservation_id: int | None = None,
) -> tuple[Customer, Restaurant, RestaurantTable]:
    customer = db.get(Customer, customer_id)
    restaurant = db.get(Restaurant, restaurant_id)
    table = db.get(RestaurantTable, table_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")
    if table.restaurant_id != restaurant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Table does not belong to restaurant")
    if party_size > table.capacity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Party size exceeds table capacity")
    if reservation_date < date.today():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reservation date cannot be in the past")
    if start_time >= end_time:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Start time must be before end time")
    if start_time < restaurant.opening_time or end_time > restaurant.closing_time:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reservation is outside restaurant hours")

    overlap_query = db.query(Reservation).filter(
        Reservation.table_id == table_id,
        Reservation.reservation_date == reservation_date,
        Reservation.status != ReservationStatus.cancelled,
        Reservation.start_time < end_time,
        Reservation.end_time > start_time,
    )
    if reservation_id is not None:
        overlap_query = overlap_query.filter(Reservation.id != reservation_id)
    if overlap_query.first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Table is already reserved in this time range")
    return customer, restaurant, table


def create_reservation(db: Session, payload: ReservationCreate, user: User) -> Reservation:
    customer, _, _ = _validate_reservation(
        db,
        customer_id=payload.customer_id,
        restaurant_id=payload.restaurant_id,
        table_id=payload.table_id,
        reservation_date=payload.reservation_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        party_size=payload.party_size,
    )
    if user.role == UserRole.customer and customer.user_id not in (None, user.id) and customer.email != user.email:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only create your own reservations")
    reservation = Reservation(**payload.model_dump())
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    send_notification(
        db,
        NotificationType.reservation_created,
        customer.email,
        f"Reservation #{reservation.id} was created.",
    )
    return reservation


def list_reservations(db: Session, user: User) -> list[Reservation]:
    query = db.query(Reservation)
    if user.role == UserRole.customer:
        query = query.join(Customer).filter((Customer.user_id == user.id) | (Customer.email == user.email))
    return query.order_by(Reservation.reservation_date, Reservation.start_time).all()


def get_reservation(db: Session, reservation_id: int, user: User) -> Reservation:
    reservation = _get_or_404(db, reservation_id)
    _assert_can_access(user, reservation)
    return reservation


def update_reservation(db: Session, reservation_id: int, payload: ReservationUpdate, user: User) -> Reservation:
    reservation = _get_or_404(db, reservation_id)
    _assert_can_access(user, reservation)
    values = payload.model_dump(exclude_unset=True)
    table_id = values.get("table_id", reservation.table_id)
    _validate_reservation(
        db,
        customer_id=reservation.customer_id,
        restaurant_id=reservation.restaurant_id,
        table_id=table_id,
        reservation_date=values.get("reservation_date", reservation.reservation_date),
        start_time=values.get("start_time", reservation.start_time),
        end_time=values.get("end_time", reservation.end_time),
        party_size=values.get("party_size", reservation.party_size),
        reservation_id=reservation.id,
    )
    for key, value in values.items():
        setattr(reservation, key, value)
    db.commit()
    db.refresh(reservation)
    return reservation


def cancel_reservation(db: Session, reservation_id: int, user: User) -> Reservation:
    reservation = _get_or_404(db, reservation_id)
    _assert_can_access(user, reservation)
    reservation.status = ReservationStatus.cancelled
    reservation.table.status = TableStatus.available
    db.commit()
    db.refresh(reservation)
    send_notification(
        db,
        NotificationType.reservation_cancelled,
        reservation.customer.email,
        f"Reservation #{reservation.id} was cancelled.",
    )
    return reservation


def confirm_reservation(db: Session, reservation_id: int) -> Reservation:
    reservation = _get_or_404(db, reservation_id)
    reservation.status = ReservationStatus.confirmed
    reservation.table.status = TableStatus.reserved
    db.commit()
    db.refresh(reservation)
    send_notification(
        db,
        NotificationType.reservation_confirmed,
        reservation.customer.email,
        f"Reservation #{reservation.id} was confirmed.",
    )
    return reservation


def delete_reservation(db: Session, reservation_id: int, user: User) -> None:
    reservation = _get_or_404(db, reservation_id)
    _assert_can_access(user, reservation)
    db.delete(reservation)
    db.commit()
