from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_roles
from app.database.connection import get_db
from app.database.models import User, UserRole
from app.modules.notifications import service
from app.modules.notifications.schemas import NotificationCreate, NotificationRead


router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("/test", response_model=NotificationRead, status_code=status.HTTP_201_CREATED)
def test_notification(
    payload: NotificationCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.admin, UserRole.staff))],
):
    return service.send_notification(db, payload.notification_type, payload.recipient, payload.message)


@router.get("", response_model=list[NotificationRead])
def get_notifications(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.admin, UserRole.staff))],
):
    return service.list_notifications(db)
