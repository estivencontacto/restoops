from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class CustomerBase(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=5, max_length=40)
    document_number: str | None = Field(default=None, max_length=60)


class CustomerCreate(CustomerBase):
    user_id: int | None = None


class CustomerUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, min_length=5, max_length=40)
    document_number: str | None = Field(default=None, max_length=60)


class CustomerRead(CustomerBase):
    id: int
    user_id: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
