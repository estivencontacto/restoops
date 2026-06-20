from datetime import datetime, time

from pydantic import BaseModel, EmailStr, Field


class RestaurantBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    address: str = Field(min_length=2, max_length=255)
    phone: str = Field(min_length=5, max_length=40)
    email: EmailStr
    opening_time: time
    closing_time: time


class RestaurantCreate(RestaurantBase):
    pass


class RestaurantUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    address: str | None = Field(default=None, min_length=2, max_length=255)
    phone: str | None = Field(default=None, min_length=5, max_length=40)
    email: EmailStr | None = None
    opening_time: time | None = None
    closing_time: time | None = None


class RestaurantRead(RestaurantBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
