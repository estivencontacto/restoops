from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.security import require_roles
from app.database.connection import get_db
from app.database.models import User, UserRole
from app.modules.reports import service


router = APIRouter(prefix="/reports", tags=["reports"])


def _download(workbook, filename: str) -> StreamingResponse:
    return StreamingResponse(
        workbook,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/reservations/excel")
def reservations_excel(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.admin, UserRole.staff))],
):
    return _download(service.reservations_report(db), "reservations_report.xlsx")


@router.get("/orders/excel")
def orders_excel(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.admin, UserRole.staff))],
):
    return _download(service.orders_report(db), "orders_report.xlsx")


@router.get("/sales/excel")
def sales_excel(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.admin, UserRole.staff))],
):
    return _download(service.sales_report(db), "sales_report.xlsx")
