from datetime import date, timedelta

from fastapi.testclient import TestClient


def test_register_and_login(client: TestClient) -> None:
    register = client.post(
        "/auth/register",
        json={
            "full_name": "Staff Member",
            "email": "staff@example.com",
            "password": "StrongPass123",
            "role": "staff",
        },
    )
    assert register.status_code == 201

    login = client.post(
        "/auth/login",
        data={"username": "staff@example.com", "password": "StrongPass123"},
    )
    assert login.status_code == 200
    assert login.json()["access_token"]


def _restaurant_payload() -> dict:
    return {
        "name": "Casa Backend",
        "address": "123 API Street",
        "phone": "+570000000",
        "email": "hello@casabackend.com",
        "opening_time": "09:00:00",
        "closing_time": "22:00:00",
    }


def _create_foundation(client: TestClient, headers: dict[str, str]) -> dict[str, int]:
    restaurant = client.post("/restaurants", json=_restaurant_payload(), headers=headers)
    assert restaurant.status_code == 201
    restaurant_id = restaurant.json()["id"]

    table = client.post(
        "/tables",
        json={"restaurant_id": restaurant_id, "table_number": "A1", "capacity": 4, "status": "available"},
        headers=headers,
    )
    assert table.status_code == 201

    customer = client.post(
        "/customers",
        json={
            "full_name": "Ada Lovelace",
            "email": "ada@example.com",
            "phone": "+571111111",
            "document_number": "DOC-1",
        },
        headers=headers,
    )
    assert customer.status_code == 201

    menu_item = client.post(
        "/menu/items",
        json={
            "restaurant_id": restaurant_id,
            "name": "API Burger",
            "description": "A reliable classic",
            "category": "main_course",
            "price": "25.00",
            "is_available": True,
        },
        headers=headers,
    )
    assert menu_item.status_code == 201

    return {
        "restaurant_id": restaurant_id,
        "table_id": table.json()["id"],
        "customer_id": customer.json()["id"],
        "menu_item_id": menu_item.json()["id"],
    }


def test_create_restaurant_and_table(client: TestClient, auth_headers: dict[str, str]) -> None:
    foundation = _create_foundation(client, auth_headers)
    duplicate_table = client.post(
        "/tables",
        json={
            "restaurant_id": foundation["restaurant_id"],
            "table_number": "A1",
            "capacity": 2,
            "status": "available",
        },
        headers=auth_headers,
    )
    assert duplicate_table.status_code == 409


def test_create_reservation_and_prevent_overlap(client: TestClient, auth_headers: dict[str, str]) -> None:
    foundation = _create_foundation(client, auth_headers)
    reservation_date = (date.today() + timedelta(days=1)).isoformat()
    payload = {
        "customer_id": foundation["customer_id"],
        "restaurant_id": foundation["restaurant_id"],
        "table_id": foundation["table_id"],
        "reservation_date": reservation_date,
        "start_time": "12:00:00",
        "end_time": "13:00:00",
        "party_size": 3,
        "status": "pending",
        "notes": "Window seat",
    }
    first = client.post("/reservations", json=payload, headers=auth_headers)
    assert first.status_code == 201

    second = client.post("/reservations", json=payload, headers=auth_headers)
    assert second.status_code == 409


def test_create_order_and_confirm_payment(client: TestClient, auth_headers: dict[str, str]) -> None:
    foundation = _create_foundation(client, auth_headers)
    order = client.post(
        "/orders",
        json={
            "restaurant_id": foundation["restaurant_id"],
            "table_id": foundation["table_id"],
            "customer_id": foundation["customer_id"],
            "items": [{"menu_item_id": foundation["menu_item_id"], "quantity": 2}],
        },
        headers=auth_headers,
    )
    assert order.status_code == 201
    order_data = order.json()
    assert order_data["total"] == "55.00"

    payment = client.post(
        "/payments",
        json={"order_id": order_data["id"], "amount": "55.00", "payment_method": "cash"},
        headers=auth_headers,
    )
    assert payment.status_code == 201

    confirmed = client.patch(f"/payments/{payment.json()['id']}/confirm", headers=auth_headers)
    assert confirmed.status_code == 200
    assert confirmed.json()["status"] == "paid"
