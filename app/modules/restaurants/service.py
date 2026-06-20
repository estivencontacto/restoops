from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.database.models import Restaurant
from app.modules.restaurants.schemas import RestaurantCreate, RestaurantUpdate


def _get_or_404(db: Session, restaurant_id: int) -> Restaurant:
    restaurant = db.get(Restaurant, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    return restaurant


def create_restaurant(db: Session, payload: RestaurantCreate) -> Restaurant:
    if payload.opening_time >= payload.closing_time:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Opening time must be before closing time")
    restaurant = Restaurant(**payload.model_dump())
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant


def list_restaurants(db: Session) -> list[Restaurant]:
    return db.query(Restaurant).order_by(Restaurant.id).all()


def get_restaurant(db: Session, restaurant_id: int) -> Restaurant:
    return _get_or_404(db, restaurant_id)


def update_restaurant(db: Session, restaurant_id: int, payload: RestaurantUpdate) -> Restaurant:
    restaurant = _get_or_404(db, restaurant_id)
    values = payload.model_dump(exclude_unset=True)
    opening_time = values.get("opening_time", restaurant.opening_time)
    closing_time = values.get("closing_time", restaurant.closing_time)
    if opening_time >= closing_time:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Opening time must be before closing time")
    for key, value in values.items():
        setattr(restaurant, key, value)
    db.commit()
    db.refresh(restaurant)
    return restaurant


def delete_restaurant(db: Session, restaurant_id: int) -> None:
    restaurant = _get_or_404(db, restaurant_id)
    db.delete(restaurant)
    db.commit()
