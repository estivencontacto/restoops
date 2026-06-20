from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.database.models import PaymentMethod, PaymentStatus


class PaymentCreate(BaseModel):
    order_id: int
    amount: Decimal = Field(gt=0)
    payment_method: PaymentMethod


class PaymentRead(BaseModel):
    id: int
    order_id: int
    amount: Decimal
    payment_method: PaymentMethod
    status: PaymentStatus
    paid_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}
