from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.database.models import MenuCategory


class MenuItemBase(BaseModel):
    restaurant_id: int
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None
    category: MenuCategory
    price: Decimal = Field(gt=0)
    is_available: bool = True


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
    category: MenuCategory | None = None
    price: Decimal | None = Field(default=None, gt=0)
    is_available: bool | None = None


class MenuItemRead(MenuItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
