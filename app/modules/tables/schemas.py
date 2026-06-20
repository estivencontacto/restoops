from datetime import datetime

from pydantic import BaseModel, Field

from app.database.models import TableStatus


class TableBase(BaseModel):
    restaurant_id: int
    table_number: str = Field(min_length=1, max_length=20)
    capacity: int = Field(gt=0)
    status: TableStatus = TableStatus.available


class TableCreate(TableBase):
    pass


class TableUpdate(BaseModel):
    table_number: str | None = Field(default=None, min_length=1, max_length=20)
    capacity: int | None = Field(default=None, gt=0)
    status: TableStatus | None = None


class TableRead(TableBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
