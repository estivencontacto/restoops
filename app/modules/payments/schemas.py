from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.database.models import PaymentMethod, PaymentStatus


class PaymentCreate(BaseModel):
    order_id: int
    amount: Decimal = Field(gt=0)
    payment_method: PaymentMethod
    waiter_id: int | None = None
    tip_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    received_amount: Decimal | None = Field(default=None, gt=0)


class PaymentRead(BaseModel):
    id: int
    order_id: int
    waiter_id: int | None
    amount: Decimal
    tip_amount: Decimal
    received_amount: Decimal
    change_amount: Decimal
    payment_method: PaymentMethod
    status: PaymentStatus
    paid_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}
