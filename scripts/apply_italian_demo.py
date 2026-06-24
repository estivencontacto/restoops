from datetime import datetime, timezone
from decimal import Decimal

from app.core.security import hash_password
from app.database.connection import SessionLocal
from app.database.models import (
    MenuCategory,
    MenuItem,
    Order,
    OrderItem,
    OrderStatus,
    Payment,
    PaymentMethod,
    PaymentStatus,
    Restaurant,
    RestaurantTable,
    TableStatus,
    User,
    UserRole,
)


ITALIAN_MENU = [
    ("Bruschetta al pomodoro", "Pan rustico, tomate, ajo, albahaca y aceite de oliva", MenuCategory.appetizer, "18000.00"),
    ("Burrata pugliese", "Burrata fresca, pesto, tomates confitados y focaccia", MenuCategory.appetizer, "34000.00"),
    ("Carpaccio di manzo", "Res laminada, rucula, parmesano y limon siciliano", MenuCategory.appetizer, "39000.00"),
    ("Arancini siciliani", "Croquetas de risotto con mozzarella y pomodoro", MenuCategory.appetizer, "26000.00"),
    ("Tagliatelle alla bolognese", "Pasta fresca con ragu lento de res y cerdo", MenuCategory.main_course, "46000.00"),
    ("Spaghetti carbonara", "Guanciale, pecorino romano, yema y pimienta negra", MenuCategory.main_course, "44000.00"),
    ("Lasagna della casa", "Capas de pasta, ragu, bechamel y parmesano gratinado", MenuCategory.main_course, "48000.00"),
    ("Risotto ai funghi", "Arborio, portobello, parmesano y aceite de trufa", MenuCategory.main_course, "52000.00"),
    ("Gnocchi al pesto", "Gnocchi de papa, pesto genoves y pinoli", MenuCategory.main_course, "42000.00"),
    ("Pizza margherita napolitana", "Pomodoro, mozzarella fior di latte y albahaca", MenuCategory.main_course, "39000.00"),
    ("Osso buco alla milanese", "Ternera braseada, gremolata y risotto azafranado", MenuCategory.main_course, "72000.00"),
    ("Pollo alla parmigiana", "Pechuga apanada, pomodoro, mozzarella y spaghetti", MenuCategory.main_course, "54000.00"),
    ("Tiramisu classico", "Mascarpone, espresso, savoiardi y cacao", MenuCategory.dessert, "22000.00"),
    ("Panna cotta frutos rojos", "Crema cocida de vainilla con coulis artesanal", MenuCategory.dessert, "20000.00"),
    ("Cannoli siciliani", "Canutillos crujientes con ricotta dulce y pistacho", MenuCategory.dessert, "24000.00"),
    ("Gelato artigianale", "Tres sabores: pistacho, vainilla y chocolate", MenuCategory.dessert, "18000.00"),
    ("Limonata italiana", "Limon siciliano, soda y hierbabuena", MenuCategory.beverage, "12000.00"),
    ("San Pellegrino", "Agua mineral gasificada italiana", MenuCategory.beverage, "11000.00"),
    ("Coca-Cola", "Gaseosa fria 350 ml", MenuCategory.beverage, "8000.00"),
    ("Peroni Nastro Azzurro", "Cerveza lager italiana", MenuCategory.beverage, "16000.00"),
    ("Moretti", "Cerveza italiana suave y maltosa", MenuCategory.beverage, "15000.00"),
    ("Chianti Classico", "Copa de vino tinto toscano", MenuCategory.beverage, "28000.00"),
    ("Pinot Grigio", "Copa de vino blanco fresco", MenuCategory.beverage, "26000.00"),
    ("Sangria rosso", "Vino tinto, frutas, naranja y especias", MenuCategory.beverage, "24000.00"),
    ("Aperol Spritz", "Aperol, prosecco, soda y naranja", MenuCategory.beverage, "30000.00"),
    ("Negroni", "Gin, Campari y vermut rosso", MenuCategory.beverage, "32000.00"),
]


def get_waiters(db):
    waiters = db.query(User).filter(User.role == UserRole.staff).order_by(User.id).all()
    if waiters:
        return waiters
    staff_members = [
        ("Sofia Romano", "sofia.romano@restoops.co"),
        ("Marco Bellini", "marco.bellini@restoops.co"),
        ("Valentina Costa", "valentina.costa@restoops.co"),
    ]
    for full_name, email in staff_members:
        db.add(
            User(
                full_name=full_name,
                email=email,
                hashed_password=hash_password("RestoOps2026"),
                role=UserRole.staff,
                is_active=True,
            )
        )
    db.flush()
    return db.query(User).filter(User.role == UserRole.staff).order_by(User.id).all()


def create_order(db, restaurant_id: int, table_id: int, customer_id: int | None, waiter_id: int | None, lines: list[tuple[MenuItem, int]], status: OrderStatus) -> Order:
    subtotal = sum((item.price * quantity for item, quantity in lines), Decimal("0.00"))
    tax = (subtotal * Decimal("0.10")).quantize(Decimal("0.01"))
    total = subtotal + tax
    order = Order(
        restaurant_id=restaurant_id,
        table_id=table_id,
        customer_id=customer_id,
        waiter_id=waiter_id,
        status=status,
        subtotal=subtotal,
        tax=tax,
        total=total,
    )
    db.add(order)
    db.flush()
    for item, quantity in lines:
        db.add(
            OrderItem(
                order_id=order.id,
                menu_item_id=item.id,
                quantity=quantity,
                unit_price=item.price,
                total_price=item.price * quantity,
            )
        )
    return order


def main() -> None:
    db = SessionLocal()
    try:
        restaurant = db.query(Restaurant).order_by(Restaurant.id).first()
        if not restaurant:
            raise RuntimeError("No hay restaurante para actualizar.")

        restaurant.name = "RestoOps Trattoria"
        restaurant.email = "reservas@restoopstrattoria.com"
        table_statuses = {
            "A1": TableStatus.available,
            "A2": TableStatus.available,
            "A3": TableStatus.maintenance,
            "B1": TableStatus.available,
            "B2": TableStatus.occupied,
            "B4": TableStatus.reserved,
            "C1": TableStatus.occupied,
            "C2": TableStatus.occupied,
            "VIP1": TableStatus.reserved,
            "BAR1": TableStatus.available,
        }
        for table in db.query(RestaurantTable).filter(RestaurantTable.restaurant_id == restaurant.id).all():
            if table.table_number in table_statuses:
                table.status = table_statuses[table.table_number]

        db.query(Payment).delete()
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.query(MenuItem).delete()
        db.flush()
        waiters = get_waiters(db)

        menu_items = []
        for name, description, category, price in ITALIAN_MENU:
            item = MenuItem(
                restaurant_id=restaurant.id,
                name=name,
                description=description,
                category=category,
                price=Decimal(price),
                is_available=True,
            )
            db.add(item)
            menu_items.append(item)
        db.flush()

        preparing = create_order(
            db,
            restaurant.id,
            table_id=7,
            customer_id=3,
            waiter_id=waiters[0].id,
            lines=[(menu_items[4], 1), (menu_items[7], 1)],
            status=OrderStatus.preparing,
        )
        paid = create_order(
            db,
            restaurant.id,
            table_id=10,
            customer_id=5,
            waiter_id=waiters[1].id if len(waiters) > 1 else waiters[0].id,
            lines=[(menu_items[25], 2)],
            status=OrderStatus.paid,
        )
        db.add(
            Payment(
                order_id=paid.id,
                waiter_id=paid.waiter_id,
                amount=paid.total,
                tip_amount=Decimal("8000.00"),
                received_amount=paid.total + Decimal("8000.00"),
                change_amount=Decimal("0.00"),
                payment_method=PaymentMethod.credit_card,
                status=PaymentStatus.paid,
                paid_at=datetime.now(timezone.utc),
            )
        )
        db.commit()
        print(f"Demo italiana aplicada: {len(menu_items)} productos, pedidos #{preparing.id} y #{paid.id}.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
