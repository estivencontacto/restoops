from pathlib import Path
from datetime import date, datetime, timedelta, time, timezone
from decimal import Decimal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.security import hash_password
from app.database.connection import Base, SessionLocal, engine
from app.database.models import (
    Customer,
    MenuCategory,
    MenuItem,
    Order,
    OrderItem,
    OrderStatus,
    Payment,
    PaymentMethod,
    PaymentStatus,
    Reservation,
    ReservationStatus,
    Restaurant,
    RestaurantTable,
    TableStatus,
    User,
    UserRole,
)
from app.modules.auth.router import router as auth_router
from app.modules.customers.router import router as customers_router
from app.modules.dashboard.router import router as dashboard_router
from app.modules.menu.router import router as menu_router
from app.modules.notifications.router import router as notifications_router
from app.modules.orders.router import router as orders_router
from app.modules.payments.router import router as payments_router
from app.modules.reports.router import router as reports_router
from app.modules.reservations.router import router as reservations_router
from app.modules.restaurants.router import router as restaurants_router
from app.modules.tables.router import router as tables_router
from app.modules.users.router import router as users_router


settings = get_settings()
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(
    title=settings.app_name,
    description="API REST profesional para reservas, operaciones y reportes de restaurantes.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(restaurants_router)
app.include_router(tables_router)
app.include_router(customers_router)
app.include_router(reservations_router)
app.include_router(menu_router)
app.include_router(orders_router)
app.include_router(payments_router)
app.include_router(reports_router)
app.include_router(notifications_router)
app.include_router(dashboard_router)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.on_event("startup")
def prepare_local_database() -> None:
    if not settings.database_url.startswith("sqlite"):
        return

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.email == settings.default_admin_email.lower()).first()
        if existing_admin:
            seed_sample_data(db)
            return
        db.add(
            User(
                full_name=settings.default_admin_name,
                email=settings.default_admin_email.lower(),
                hashed_password=hash_password(settings.default_admin_password),
                role=UserRole.admin,
                is_active=True,
            )
        )
        db.commit()
        seed_sample_data(db)
    finally:
        db.close()


def seed_sample_data(db) -> None:
    if db.query(Restaurant).first():
        return

    restaurant = Restaurant(
        name="RestoOps Bistro",
        address="Calle 72 #10-34",
        phone="+57 300 555 0101",
        email="reservas@bistro.com",
        opening_time=time(9, 0),
        closing_time=time(22, 0),
    )
    db.add(restaurant)
    db.flush()

    tables = [
        RestaurantTable(restaurant_id=restaurant.id, table_number="A1", capacity=2, status=TableStatus.available),
        RestaurantTable(restaurant_id=restaurant.id, table_number="B4", capacity=4, status=TableStatus.reserved),
        RestaurantTable(restaurant_id=restaurant.id, table_number="C2", capacity=6, status=TableStatus.occupied),
        RestaurantTable(restaurant_id=restaurant.id, table_number="A2", capacity=2, status=TableStatus.available),
        RestaurantTable(restaurant_id=restaurant.id, table_number="A3", capacity=2, status=TableStatus.maintenance),
        RestaurantTable(restaurant_id=restaurant.id, table_number="B1", capacity=4, status=TableStatus.available),
        RestaurantTable(restaurant_id=restaurant.id, table_number="B2", capacity=4, status=TableStatus.occupied),
        RestaurantTable(restaurant_id=restaurant.id, table_number="C1", capacity=6, status=TableStatus.available),
        RestaurantTable(restaurant_id=restaurant.id, table_number="VIP1", capacity=8, status=TableStatus.reserved),
        RestaurantTable(restaurant_id=restaurant.id, table_number="BAR1", capacity=3, status=TableStatus.available),
    ]
    db.add_all(tables)

    customers = [
        Customer(full_name="Laura Martinez", email="laura@example.com", phone="+57 310 222 3333", document_number="CC1001"),
        Customer(full_name="Mateo Rojas", email="mateo@example.com", phone="+57 315 444 9900", document_number="CC1002"),
        Customer(full_name="Camila Torres", email="camila@example.com", phone="+57 301 888 1212", document_number="CC1003"),
        Customer(full_name="Andres Vargas", email="andres@example.com", phone="+57 320 777 4545", document_number="CC1004"),
        Customer(full_name="Sofia Herrera", email="sofia@example.com", phone="+57 312 909 6767", document_number="CC1005"),
    ]
    db.add_all(customers)

    menu_items = [
        MenuItem(restaurant_id=restaurant.id, name="Tartar de atun", description="Aguacate, sesamo y citricos", category=MenuCategory.appetizer, price=Decimal("28000.00"), is_available=True),
        MenuItem(restaurant_id=restaurant.id, name="Risotto de hongos", description="Parmesano y aceite de trufa", category=MenuCategory.main_course, price=Decimal("42000.00"), is_available=True),
        MenuItem(restaurant_id=restaurant.id, name="Cheesecake vasco", description="Frutos rojos", category=MenuCategory.dessert, price=Decimal("19000.00"), is_available=True),
        MenuItem(restaurant_id=restaurant.id, name="Croquetas de jamon serrano", description="Alioli suave y paprika", category=MenuCategory.appetizer, price=Decimal("24000.00"), is_available=True),
        MenuItem(restaurant_id=restaurant.id, name="Burrata con tomates asados", description="Pesto de albahaca y pan rustico", category=MenuCategory.appetizer, price=Decimal("31000.00"), is_available=True),
        MenuItem(restaurant_id=restaurant.id, name="Short rib braseado", description="Pure de papa criolla y reduccion de vino", category=MenuCategory.main_course, price=Decimal("62000.00"), is_available=True),
        MenuItem(restaurant_id=restaurant.id, name="Salmon a la parrilla", description="Vegetales verdes y salsa de limon", category=MenuCategory.main_course, price=Decimal("54000.00"), is_available=True),
        MenuItem(restaurant_id=restaurant.id, name="Pasta fresca al pesto", description="Pinenuts, parmesano y aceite de oliva", category=MenuCategory.main_course, price=Decimal("39000.00"), is_available=True),
        MenuItem(restaurant_id=restaurant.id, name="Tiramisu clasico", description="Cafe espresso y cacao amargo", category=MenuCategory.dessert, price=Decimal("21000.00"), is_available=True),
        MenuItem(restaurant_id=restaurant.id, name="Creme brulee de vainilla", description="Costra caramelizada", category=MenuCategory.dessert, price=Decimal("22000.00"), is_available=True),
        MenuItem(restaurant_id=restaurant.id, name="Limonada de hierbabuena", description="Natural y refrescante", category=MenuCategory.beverage, price=Decimal("12000.00"), is_available=True),
        MenuItem(restaurant_id=restaurant.id, name="Negroni de la casa", description="Gin, vermut rojo y bitter", category=MenuCategory.beverage, price=Decimal("32000.00"), is_available=True),
    ]
    db.add_all(menu_items)
    db.flush()

    db.add_all(
        [
            Reservation(customer_id=customers[0].id, restaurant_id=restaurant.id, table_id=tables[1].id, reservation_date=date.today() + timedelta(days=1), start_time=time(19, 0), end_time=time(20, 30), party_size=4, status=ReservationStatus.confirmed, notes="Cena de aniversario"),
            Reservation(customer_id=customers[1].id, restaurant_id=restaurant.id, table_id=tables[8].id, reservation_date=date.today(), start_time=time(20, 0), end_time=time(22, 0), party_size=8, status=ReservationStatus.pending, notes="Mesa VIP"),
            Reservation(customer_id=customers[2].id, restaurant_id=restaurant.id, table_id=tables[5].id, reservation_date=date.today(), start_time=time(13, 0), end_time=time(14, 30), party_size=3, status=ReservationStatus.confirmed, notes="Almuerzo de trabajo"),
        ]
    )

    order = Order(
        restaurant_id=restaurant.id,
        table_id=tables[6].id,
        customer_id=customers[2].id,
        status=OrderStatus.preparing,
        subtotal=Decimal("96000.00"),
        tax=Decimal("9600.00"),
        total=Decimal("105600.00"),
    )
    db.add(order)
    db.flush()
    db.add_all(
        [
            OrderItem(order_id=order.id, menu_item_id=menu_items[1].id, quantity=1, unit_price=Decimal("42000.00"), total_price=Decimal("42000.00")),
            OrderItem(order_id=order.id, menu_item_id=menu_items[6].id, quantity=1, unit_price=Decimal("54000.00"), total_price=Decimal("54000.00")),
        ]
    )

    paid_order = Order(
        restaurant_id=restaurant.id,
        table_id=tables[9].id,
        customer_id=customers[4].id,
        status=OrderStatus.paid,
        subtotal=Decimal("64000.00"),
        tax=Decimal("6400.00"),
        total=Decimal("70400.00"),
    )
    db.add(paid_order)
    db.flush()
    db.add(OrderItem(order_id=paid_order.id, menu_item_id=menu_items[11].id, quantity=2, unit_price=Decimal("32000.00"), total_price=Decimal("64000.00")))
    db.add(
        Payment(
            order_id=paid_order.id,
            amount=Decimal("70400.00"),
            payment_method=PaymentMethod.credit_card,
            status=PaymentStatus.paid,
            paid_at=datetime.now(timezone.utc),
        )
    )
    db.commit()


@app.get("/", include_in_schema=False)
def frontend() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")
