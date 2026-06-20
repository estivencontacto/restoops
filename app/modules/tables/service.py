from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.database.models import Restaurant, RestaurantTable
from app.modules.tables.schemas import TableCreate, TableUpdate


def _get_or_404(db: Session, table_id: int) -> RestaurantTable:
    table = db.get(RestaurantTable, table_id)
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")
    return table


def _ensure_restaurant(db: Session, restaurant_id: int) -> None:
    if not db.get(Restaurant, restaurant_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")


def _ensure_unique_number(db: Session, restaurant_id: int, table_number: str, table_id: int | None = None) -> None:
    query = db.query(RestaurantTable).filter(
        RestaurantTable.restaurant_id == restaurant_id,
        RestaurantTable.table_number == table_number,
    )
    if table_id is not None:
        query = query.filter(RestaurantTable.id != table_id)
    if query.first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A table with this number already exists in the restaurant",
        )


def create_table(db: Session, payload: TableCreate) -> RestaurantTable:
    _ensure_restaurant(db, payload.restaurant_id)
    _ensure_unique_number(db, payload.restaurant_id, payload.table_number)
    table = RestaurantTable(**payload.model_dump())
    db.add(table)
    db.commit()
    db.refresh(table)
    return table


def list_tables(db: Session, restaurant_id: int | None = None) -> list[RestaurantTable]:
    query = db.query(RestaurantTable)
    if restaurant_id is not None:
        query = query.filter(RestaurantTable.restaurant_id == restaurant_id)
    return query.order_by(RestaurantTable.id).all()


def get_table(db: Session, table_id: int) -> RestaurantTable:
    return _get_or_404(db, table_id)


def update_table(db: Session, table_id: int, payload: TableUpdate) -> RestaurantTable:
    table = _get_or_404(db, table_id)
    values = payload.model_dump(exclude_unset=True)
    if "table_number" in values:
        _ensure_unique_number(db, table.restaurant_id, values["table_number"], table_id)
    for key, value in values.items():
        setattr(table, key, value)
    db.commit()
    db.refresh(table)
    return table


def delete_table(db: Session, table_id: int) -> None:
    table = _get_or_404(db, table_id)
    db.delete(table)
    db.commit()
