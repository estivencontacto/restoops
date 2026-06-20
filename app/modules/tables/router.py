from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_roles
from app.database.connection import get_db
from app.database.models import User, UserRole
from app.modules.tables import service
from app.modules.tables.schemas import TableCreate, TableRead, TableUpdate


router = APIRouter(prefix="/tables", tags=["tables"])


@router.post("", response_model=TableRead, status_code=status.HTTP_201_CREATED)
def create_table(
    payload: TableCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.admin, UserRole.staff))],
):
    return service.create_table(db, payload)


@router.get("", response_model=list[TableRead])
def list_tables(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    restaurant_id: int | None = Query(default=None),
):
    return service.list_tables(db, restaurant_id)


@router.get("/{table_id}", response_model=TableRead)
def get_table(
    table_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
):
    return service.get_table(db, table_id)


@router.put("/{table_id}", response_model=TableRead)
def update_table(
    table_id: int,
    payload: TableUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.admin, UserRole.staff))],
):
    return service.update_table(db, table_id, payload)


@router.delete("/{table_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_table(
    table_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.admin, UserRole.staff))],
):
    service.delete_table(db, table_id)
