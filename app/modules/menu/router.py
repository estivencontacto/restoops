from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_roles
from app.database.connection import get_db
from app.database.models import User, UserRole
from app.modules.menu import service
from app.modules.menu.schemas import MenuItemCreate, MenuItemRead, MenuItemUpdate


router = APIRouter(prefix="/menu/items", tags=["menu"])


@router.post("", response_model=MenuItemRead, status_code=status.HTTP_201_CREATED)
def create_menu_item(
    payload: MenuItemCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.admin, UserRole.staff))],
):
    return service.create_menu_item(db, payload)


@router.get("", response_model=list[MenuItemRead])
def list_menu_items(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    restaurant_id: int | None = Query(default=None),
):
    return service.list_menu_items(db, restaurant_id)


@router.get("/{item_id}", response_model=MenuItemRead)
def get_menu_item(
    item_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
):
    return service.get_menu_item(db, item_id)


@router.put("/{item_id}", response_model=MenuItemRead)
def update_menu_item(
    item_id: int,
    payload: MenuItemUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.admin, UserRole.staff))],
):
    return service.update_menu_item(db, item_id, payload)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(
    item_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.admin, UserRole.staff))],
):
    service.delete_menu_item(db, item_id)
