from decimal import Decimal

from pydantic import BaseModel


class TopProduct(BaseModel):
    menu_item_id: int
    name: str
    quantity_sold: int


class UpcomingReservation(BaseModel):
    id: int
    customer_id: int
    table_id: int
    reservation_date: str
    start_time: str
    status: str


class DashboardSummary(BaseModel):
    reservations_today: int
    available_tables: int
    occupied_tables: int
    reserved_tables: int
    pending_orders: int
    sales_today: Decimal
    top_products: list[TopProduct]
    upcoming_reservations: list[UpcomingReservation]
