from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.database.models import OrderStatus


class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int = Field(gt=0)


class OrderItemRead(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    unit_price: Decimal
    total_price: Decimal

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    restaurant_id: int
    table_id: int
    reservation_id: int | None = None
    customer_id: int | None = None
    waiter_id: int | None = None
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderUpdate(BaseModel):
    status: OrderStatus | None = None
    items: list[OrderItemCreate] | None = Field(default=None, min_length=1)


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderRead(BaseModel):
    id: int
    restaurant_id: int
    table_id: int
    reservation_id: int | None
    customer_id: int | None
    waiter_id: int | None
    status: OrderStatus
    subtotal: Decimal
    tax: Decimal
    total: Decimal
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemRead]

    model_config = {"from_attributes": True}
