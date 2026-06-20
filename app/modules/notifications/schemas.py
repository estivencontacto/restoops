from datetime import datetime

from pydantic import BaseModel, Field

from app.database.models import NotificationType


class NotificationCreate(BaseModel):
    notification_type: NotificationType = NotificationType.test
    recipient: str = Field(min_length=3, max_length=255)
    message: str = Field(min_length=3)


class NotificationRead(NotificationCreate):
    id: int
    sent: bool
    created_at: datetime

    model_config = {"from_attributes": True}
