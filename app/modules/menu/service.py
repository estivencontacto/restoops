from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.database.models import MenuItem, Restaurant
from app.modules.menu.schemas import MenuItemCreate, MenuItemUpdate


def _get_or_404(db: Session, item_id: int) -> MenuItem:
    item = db.get(MenuItem, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
    return item


def create_menu_item(db: Session, payload: MenuItemCreate) -> MenuItem:
    if not db.get(Restaurant, payload.restaurant_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    item = MenuItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def list_menu_items(db: Session, restaurant_id: int | None = None) -> list[MenuItem]:
    query = db.query(MenuItem)
    if restaurant_id is not None:
        query = query.filter(MenuItem.restaurant_id == restaurant_id)
    return query.order_by(MenuItem.id).all()


def get_menu_item(db: Session, item_id: int) -> MenuItem:
    return _get_or_404(db, item_id)


def update_menu_item(db: Session, item_id: int, payload: MenuItemUpdate) -> MenuItem:
    item = _get_or_404(db, item_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


def delete_menu_item(db: Session, item_id: int) -> None:
    item = _get_or_404(db, item_id)
    db.delete(item)
    db.commit()
