from sqlalchemy.orm import Session

from app.database.models import Notification, NotificationType


def send_notification(db: Session, notification_type: NotificationType, recipient: str, message: str) -> Notification:
    notification = Notification(
        notification_type=notification_type,
        recipient=recipient,
        message=message,
        sent=True,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    print(f"[notification:{notification_type.value}] to={recipient} message={message}")
    return notification


def list_notifications(db: Session) -> list[Notification]:
    return db.query(Notification).order_by(Notification.id.desc()).all()
