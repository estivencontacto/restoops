from datetime import date, datetime, time

from pydantic import BaseModel, Field

from app.database.models import ReservationStatus


class ReservationBase(BaseModel):
    customer_id: int
    restaurant_id: int
    table_id: int
    reservation_date: date
    start_time: time
    end_time: time
    party_size: int = Field(gt=0)
    notes: str | None = None


class ReservationCreate(ReservationBase):
    status: ReservationStatus = ReservationStatus.pending


class ReservationUpdate(BaseModel):
    table_id: int | None = None
    reservation_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    party_size: int | None = Field(default=None, gt=0)
    status: ReservationStatus | None = None
    notes: str | None = None


class ReservationRead(ReservationBase):
    id: int
    status: ReservationStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
