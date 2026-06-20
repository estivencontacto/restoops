const API_BASE = "";
const TAX_RATE = 0.1;
const API_ERROR_MESSAGES = {
  "Reservation does not match order table": "La reserva seleccionada pertenece a otra mesa. Cambia la mesa o deja la reserva en 'Sin asociar'.",
  "Restaurant not found": "No se encontro el restaurante.",
  "Table not found": "No se encontro la mesa.",
  "Table does not belong to restaurant": "La mesa no pertenece al restaurante seleccionado.",
  "Reservation not found": "No se encontro la reserva.",
  "Customer not found": "No se encontro el cliente.",
  "Menu item not found": "No se encontro el producto del menu.",
  "Menu item does not belong to restaurant": "El producto no pertenece al restaurante seleccionado.",
  "Menu item is not available": "El producto no esta disponible.",
  "Order not found": "No se encontro el pedido.",
  "Payment amount must match order total": "El pago debe coincidir con el total del pedido."
};

const state = {
  token: localStorage.getItem("restoops_token") || "",
  user: null,
  apiOnline: false,
  view: "dashboard",
  data: {
    restaurants: [],
    tables: [],
    customers: [],
    reservations: [],
    menu: [],
    orders: [],
    payments: [],
    notifications: [],
    users: []
  },
  pos: {
    selectedTableId: null,
    cart: [],
    paymentMethod: "cash"
  }
};

const demo = {
  nextId: 80,
  restaurants: [
    {
      id: 1,
      name: "RestoOps Bistro",
      address: "Calle 72 #10-34",
      phone: "+57 300 555 0101",
      email: "reservas@bistro.com",
      opening_time: "09:00:00",
      closing_time: "22:00:00",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  tables: [
    { id: 1, restaurant_id: 1, table_number: "A1", capacity: 2, status: "available", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, restaurant_id: 1, table_number: "B4", capacity: 4, status: "reserved", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, restaurant_id: 1, table_number: "C2", capacity: 6, status: "occupied", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 4, restaurant_id: 1, table_number: "A2", capacity: 2, status: "available", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 5, restaurant_id: 1, table_number: "A3", capacity: 2, status: "maintenance", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 6, restaurant_id: 1, table_number: "B1", capacity: 4, status: "available", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 7, restaurant_id: 1, table_number: "B2", capacity: 4, status: "occupied", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 8, restaurant_id: 1, table_number: "C1", capacity: 6, status: "available", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 9, restaurant_id: 1, table_number: "VIP1", capacity: 8, status: "reserved", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 10, restaurant_id: 1, table_number: "BAR1", capacity: 3, status: "available", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  customers: [
    { id: 1, user_id: null, full_name: "Laura Martinez", email: "laura@example.com", phone: "+57 310 222 3333", document_number: "CC1001", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, user_id: null, full_name: "Mateo Rojas", email: "mateo@example.com", phone: "+57 315 444 9900", document_number: "CC1002", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, user_id: null, full_name: "Camila Torres", email: "camila@example.com", phone: "+57 301 888 1212", document_number: "CC1003", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 4, user_id: null, full_name: "Andres Vargas", email: "andres@example.com", phone: "+57 320 777 4545", document_number: "CC1004", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 5, user_id: null, full_name: "Sofia Herrera", email: "sofia@example.com", phone: "+57 312 909 6767", document_number: "CC1005", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  reservations: [
    {
      id: 1,
      customer_id: 1,
      restaurant_id: 1,
      table_id: 2,
      reservation_date: today(1),
      start_time: "19:00:00",
      end_time: "20:30:00",
      party_size: 4,
      status: "confirmed",
      notes: "Cena de aniversario",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { id: 2, customer_id: 2, restaurant_id: 1, table_id: 9, reservation_date: today(0), start_time: "20:00:00", end_time: "22:00:00", party_size: 8, status: "pending", notes: "Mesa VIP", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, customer_id: 3, restaurant_id: 1, table_id: 6, reservation_date: today(0), start_time: "13:00:00", end_time: "14:30:00", party_size: 3, status: "confirmed", notes: "Almuerzo de trabajo", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 4, customer_id: 4, restaurant_id: 1, table_id: 4, reservation_date: today(2), start_time: "18:30:00", end_time: "20:00:00", party_size: 2, status: "pending", notes: "Sin gluten", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 5, customer_id: 5, restaurant_id: 1, table_id: 8, reservation_date: today(3), start_time: "19:30:00", end_time: "21:00:00", party_size: 5, status: "confirmed", notes: "Celebracion familiar", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  menu: [
    { id: 1, restaurant_id: 1, name: "Tartar de atun", description: "Aguacate, sesamo y citricos", category: "appetizer", price: "28000.00", is_available: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, restaurant_id: 1, name: "Risotto de hongos", description: "Parmesano y aceite de trufa", category: "main_course", price: "42000.00", is_available: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, restaurant_id: 1, name: "Cheesecake vasco", description: "Frutos rojos", category: "dessert", price: "19000.00", is_available: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 4, restaurant_id: 1, name: "Croquetas de jamon serrano", description: "Alioli suave y paprika", category: "appetizer", price: "24000.00", is_available: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 5, restaurant_id: 1, name: "Burrata con tomates asados", description: "Pesto de albahaca y pan rustico", category: "appetizer", price: "31000.00", is_available: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 6, restaurant_id: 1, name: "Short rib braseado", description: "Pure de papa criolla y reduccion de vino", category: "main_course", price: "62000.00", is_available: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 7, restaurant_id: 1, name: "Salmon a la parrilla", description: "Vegetales verdes y salsa de limon", category: "main_course", price: "54000.00", is_available: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 8, restaurant_id: 1, name: "Pasta fresca al pesto", description: "Pinenuts, parmesano y aceite de oliva", category: "main_course", price: "39000.00", is_available: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 9, restaurant_id: 1, name: "Tiramisu clasico", description: "Cafe espresso y cacao amargo", category: "dessert", price: "21000.00", is_available: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 10, restaurant_id: 1, name: "Creme brulee de vainilla", description: "Costra caramelizada", category: "dessert", price: "22000.00", is_available: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 11, restaurant_id: 1, name: "Limonada de hierbabuena", description: "Natural y refrescante", category: "beverage", price: "12000.00", is_available: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 12, restaurant_id: 1, name: "Negroni de la casa", description: "Gin, vermut rojo y bitter", category: "beverage", price: "32000.00", is_available: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  orders: [
    { id: 1, restaurant_id: 1, table_id: 7, reservation_id: null, customer_id: 3, status: "preparing", subtotal: "96000.00", tax: "9600.00", total: "105600.00", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), items: [{ id: 1, order_id: 1, menu_item_id: 2, quantity: 1, unit_price: "42000.00", total_price: "42000.00" }, { id: 2, order_id: 1, menu_item_id: 7, quantity: 1, unit_price: "54000.00", total_price: "54000.00" }] },
    { id: 2, restaurant_id: 1, table_id: 3, reservation_id: 1, customer_id: 1, status: "served", subtotal: "103000.00", tax: "10300.00", total: "113300.00", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), items: [{ id: 3, order_id: 2, menu_item_id: 4, quantity: 1, unit_price: "24000.00", total_price: "24000.00" }, { id: 4, order_id: 2, menu_item_id: 8, quantity: 1, unit_price: "39000.00", total_price: "39000.00" }, { id: 5, order_id: 2, menu_item_id: 9, quantity: 1, unit_price: "21000.00", total_price: "21000.00" }, { id: 6, order_id: 2, menu_item_id: 11, quantity: 1, unit_price: "12000.00", total_price: "12000.00" }, { id: 7, order_id: 2, menu_item_id: 3, quantity: 1, unit_price: "19000.00", total_price: "19000.00" }] },
    { id: 3, restaurant_id: 1, table_id: 10, reservation_id: null, customer_id: 5, status: "paid", subtotal: "64000.00", tax: "6400.00", total: "70400.00", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), items: [{ id: 8, order_id: 3, menu_item_id: 12, quantity: 2, unit_price: "32000.00", total_price: "64000.00" }] }
  ],
  payments: [
    { id: 1, order_id: 3, amount: "70400.00", payment_method: "credit_card", status: "paid", paid_at: new Date().toISOString(), created_at: new Date().toISOString() }
  ],
  notifications: [
    { id: 1, notification_type: "reservation_confirmed", recipient: "laura@example.com", message: "Tu reserva fue confirmada.", sent: true, created_at: new Date().toISOString() }
  ]
};

const views = {
  dashboard: { title: "Dashboard", render: renderDashboard },
  pos: { title: "POS", render: renderPOS },
  reservations: { title: "Reservas", render: renderReservations },
  tables: { title: "Mesas", render: renderTables },
  customers: { title: "Clientes", render: renderCustomers },
  menu: { title: "Menu", render: renderMenu },
  orders: { title: "Pedidos", render: renderOrders },
  payments: { title: "Pagos", render: renderPayments },
  users: { title: "Usuarios", render: renderUsers },
  restaurants: { title: "Restaurantes", render: renderRestaurants },
  reports: { title: "Reportes", render: renderReports },
  notifications: { title: "Notificaciones", render: renderNotifications }
};

const roleViews = {
  admin: ["dashboard", "pos", "reservations", "tables", "customers", "menu", "orders", "payments", "users", "restaurants", "reports", "notifications"],
  staff: ["dashboard", "pos", "reservations", "tables", "customers", "menu", "orders", "payments", "reports", "notifications"],
  customer: ["dashboard", "reservations", "menu"]
};

document.addEventListener("DOMContentLoaded", () => {
  bindShell();
  loadInitialState();
});

function bindShell() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  document.getElementById("refreshButton").addEventListener("click", loadInitialState);
  document.getElementById("logoutButton").addEventListener("click", logout);
  bindPasswordEye();

  document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const body = new URLSearchParams();
      body.set("username", form.get("email"));
      body.set("password", form.get("password"));
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
      });
      if (!response.ok) throw new Error(await readError(response));
      const result = await response.json();
      state.token = result.access_token;
      localStorage.setItem("restoops_token", state.token);
      toast("Sesion iniciada.");
      await loadInitialState();
    } catch (error) {
      toast(`No se pudo iniciar sesion: ${error.message}`);
      render();
    }
  });

  document.getElementById("registerForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = objectFromForm(event.currentTarget);
    if (!state.apiOnline) {
      startDemoSession(payload.email, payload.full_name, payload.role);
      toast("Cuenta demo creada.");
      render();
      return;
    }
    try {
      await request("/auth/register", { method: "POST", body: payload, publicRoute: true });
      toast("Usuario creado. Ahora inicia sesion.");
    } catch (error) {
      startDemoSession(payload.email, payload.full_name, payload.role);
      toast("API no disponible. Cuenta demo creada.");
      render();
    }
  });
}

async function loadInitialState() {
  state.apiOnline = await checkApi();
  if (state.token && state.apiOnline) {
    try {
      state.user = await request("/users/me");
    } catch (_) {
      state.user = null;
      state.token = "";
      localStorage.removeItem("restoops_token");
    }
  }
  await loadCollections();
  render();
}

async function loadCollections() {
  if (!state.apiOnline || !state.token) {
    state.data = emptyCollections();
    return;
  }

  const endpoints = [
    ["restaurants", "/restaurants"],
    ["tables", "/tables"],
    ["customers", "/customers"],
    ["reservations", "/reservations"],
    ["menu", "/menu/items"],
    ["orders", "/orders"],
    ["payments", "/payments"],
    ["notifications", "/notifications"],
    ["users", "/users"]
  ];

  for (const [key, endpoint] of endpoints) {
    try {
      state.data[key] = await request(endpoint);
    } catch (_) {
      state.data[key] = [];
    }
  }
}

async function checkApi() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch (_) {
    return false;
  }
}

async function request(endpoint, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  if (!options.publicRoute && state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }
  if (options.body && !(options.body instanceof URLSearchParams)) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }
  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!response.ok) throw new Error(await readError(response));
  if (response.status === 204) return null;
  return response.json();
}

async function readError(response) {
  try {
    const payload = await response.json();
    if (Array.isArray(payload.detail)) return payload.detail.map((item) => translateApiError(item.msg)).join(", ");
    return translateApiError(payload.detail) || "Error de API";
  } catch (_) {
    return "Error de API";
  }
}

function translateApiError(message) {
  return API_ERROR_MESSAGES[message] || message;
}

function render() {
  const isLoggedIn = Boolean(state.user);
  document.getElementById("loginScreen").hidden = isLoggedIn;
  document.getElementById("appShell").hidden = !isLoggedIn;
  if (!isLoggedIn) return;

  enforceRoleNavigation();
  document.getElementById("viewTitle").textContent = views[state.view].title;
  document.getElementById("sessionLabel").textContent = state.user
    ? `${state.user.full_name} (${state.user.role})`
    : "Modo demo";
  document.getElementById("apiStatus").textContent = state.apiOnline
    ? state.token ? "API conectada" : "API lista sin sesion"
    : "Demo local";
  document.getElementById("apiStatus").classList.toggle("offline", !state.apiOnline || !state.token);

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.hidden = !canAccessView(button.dataset.view);
    button.classList.toggle("active", button.dataset.view === state.view);
  });

  views[state.view].render();
}

function setView(view) {
  if (!canAccessView(view)) {
    toast("Tu rol no tiene acceso a esta seccion.");
    return;
  }
  state.view = view;
  render();
}

function renderDashboard() {
  const data = state.data;
  const todayValue = today(0);
  const paidToday = data.payments.filter((payment) => payment.status === "paid");
  const salesToday = sum(paidToday.map((payment) => Number(payment.amount)));
  const topProducts = getTopProducts();
  const upcoming = data.reservations
    .filter((reservation) => reservation.reservation_date >= todayValue)
    .sort((a, b) => `${a.reservation_date}${a.start_time}`.localeCompare(`${b.reservation_date}${b.start_time}`))
    .slice(0, 5);

  setViewHtml(`
    <section class="dashboard-brand">
      <img src="/static/restoops-logo.svg" alt="RestoOps logo">
      <div>
        <span>RestoOps</span>
        <strong>Control operativo limpio para reservas, mesas y ventas.</strong>
      </div>
    </section>
    <div class="stats-grid">
      ${statCard("Reservas hoy", data.reservations.filter((item) => item.reservation_date === todayValue).length)}
      ${statCard("Mesas disponibles", data.tables.filter((item) => item.status === "available").length)}
      ${statCard("Pedidos pendientes", data.orders.filter((item) => item.status === "pending").length)}
      ${statCard("Ventas del dia", money(salesToday))}
    </div>
    <div class="split-grid">
      <section class="module">
        <div class="module-header"><div><h2>Reservas proximas</h2><p>Agenda operativa</p></div></div>
        ${table(["Cliente", "Mesa", "Fecha", "Hora", "Estado"], upcoming.map((reservation) => [
          customerName(reservation.customer_id),
          tableName(reservation.table_id),
          reservation.reservation_date,
          cleanTime(reservation.start_time),
          badge(reservation.status)
        ]))}
      </section>
      <section class="module">
        <div class="module-header"><div><h2>Productos mas vendidos</h2><p>Ranking de cocina</p></div></div>
        ${table(["Producto", "Cantidad"], topProducts.map((item) => [item.name, item.quantity]))}
      </section>
    </div>
  `);
}

function renderPOS() {
  if (!state.pos.selectedTableId && state.data.tables.length) {
    const firstAvailable = state.data.tables.find((tableItem) => tableItem.status !== "maintenance") || state.data.tables[0];
    state.pos.selectedTableId = firstAvailable.id;
  }

  const selectedTable = state.data.tables.find((tableItem) => tableItem.id === Number(state.pos.selectedTableId));
  const activeOrder = getActiveOrderForTable(state.pos.selectedTableId);
  const cartTotals = calculateCartTotals();
  const categories = ["appetizer", "main_course", "dessert", "beverage"];

  setViewHtml(`
    <section class="pos-layout">
      <div class="pos-main">
        <section class="module">
          <div class="module-header">
            <div>
              <h2>Mapa de mesas</h2>
              <p>Selecciona una mesa para abrir o cobrar cuenta</p>
            </div>
            <span class="badge dark">${selectedTable ? `Mesa ${selectedTable.table_number}` : "Sin mesa"}</span>
          </div>
          <div class="pos-table-grid">
            ${state.data.tables.map((tableItem) => posTableButton(tableItem)).join("")}
          </div>
        </section>

        <section class="module">
          <div class="module-header">
            <div>
              <h2>Menu rapido</h2>
              <p>Agrega productos al pedido activo</p>
            </div>
          </div>
          <div class="pos-category-grid">
            ${categories.map((category) => `
              <div class="pos-category">
                <h3>${categoryLabel(category)}</h3>
                <div class="pos-product-grid">
                  ${state.data.menu
                    .filter((item) => item.category === category && item.is_available)
                    .map((item) => posProductCard(item))
                    .join("")}
                </div>
              </div>
            `).join("")}
          </div>
        </section>
      </div>

      <aside class="pos-ticket">
        <div class="ticket-header">
          <span>Cuenta actual</span>
          <strong>${selectedTable ? `Mesa ${selectedTable.table_number}` : "Selecciona mesa"}</strong>
        </div>

        ${activeOrder ? activeOrderSummary(activeOrder) : ""}

        <div class="ticket-lines">
          ${state.pos.cart.length ? state.pos.cart.map((item) => posCartLine(item)).join("") : `<div class="empty-state">Agrega productos desde el menu.</div>`}
        </div>

        <div class="ticket-totals">
          <div><span>Subtotal</span><strong>${money(cartTotals.subtotal)}</strong></div>
          <div><span>Impuesto</span><strong>${money(cartTotals.tax)}</strong></div>
          <div class="ticket-total"><span>Total</span><strong>${money(cartTotals.total)}</strong></div>
        </div>

        <label>Metodo de pago
          <select id="posPaymentMethod">
            ${["cash", "credit_card", "debit_card", "transfer"].map((method) => `<option value="${method}" ${state.pos.paymentMethod === method ? "selected" : ""}>${method}</option>`).join("")}
          </select>
        </label>

        <div class="ticket-actions">
          <button type="button" onclick="submitPOSOrder()">Enviar pedido</button>
          <button type="button" class="secondary-button" onclick="clearPOSCart()">Limpiar carrito</button>
          ${activeOrder ? `<button type="button" onclick="chargePOSOrder(${activeOrder.id})">Cobrar cuenta</button>` : ""}
        </div>
      </aside>
    </section>
  `);

  document.getElementById("posPaymentMethod")?.addEventListener("change", (event) => {
    state.pos.paymentMethod = event.target.value;
  });
}

function posTableButton(tableItem) {
  const isSelected = Number(state.pos.selectedTableId) === tableItem.id;
  const activeOrder = getActiveOrderForTable(tableItem.id);
  return `
    <button type="button" class="pos-table ${tableItem.status} ${isSelected ? "selected" : ""}" onclick="selectPOSTable(${tableItem.id})">
      <span>${tableItem.table_number}</span>
      <strong>${tableItem.capacity} pax</strong>
      <em>${activeOrder ? money(activeOrder.total) : tableItem.status}</em>
    </button>
  `;
}

function posProductCard(item) {
  return `
    <button type="button" class="pos-product" onclick="addPOSItem(${item.id})">
      <strong>${item.name}</strong>
      <span>${item.description || categoryLabel(item.category)}</span>
      <em>${money(item.price)}</em>
    </button>
  `;
}

function posCartLine(item) {
  const product = state.data.menu.find((menuItem) => menuItem.id === item.menu_item_id);
  return `
    <div class="ticket-line">
      <div>
        <strong>${product?.name || "Producto"}</strong>
        <span>${money(product?.price || 0)} x ${item.quantity}</span>
      </div>
      <div class="qty-control">
        <button type="button" onclick="changePOSQty(${item.menu_item_id}, -1)">-</button>
        <b>${item.quantity}</b>
        <button type="button" onclick="changePOSQty(${item.menu_item_id}, 1)">+</button>
      </div>
    </div>
  `;
}

function activeOrderSummary(order) {
  return `
    <div class="active-order">
      <div>
        <span>Pedido #${order.id}</span>
        <strong>${badge(order.status)}</strong>
      </div>
      <div class="row-actions">
        <button type="button" onclick="updateOrder(${order.id}, 'preparing')">Cocina</button>
        <button type="button" onclick="updateOrder(${order.id}, 'served')">Servido</button>
      </div>
    </div>
  `;
}

function renderRestaurants() {
  setCrudView({
    title: "Restaurantes",
    subtitle: "Sedes y horarios",
    formId: "restaurantForm",
    fields: `
      ${input("name", "Nombre", "RestoOps Bistro")}
      ${input("address", "Direccion", "Calle 72 #10-34")}
      ${input("phone", "Telefono", "+57 300 555 0101")}
      ${input("email", "Email", "reservas@bistro.com", "email")}
      ${input("opening_time", "Apertura", "09:00:00", "time")}
      ${input("closing_time", "Cierre", "22:00:00", "time")}
    `,
    columns: ["Nombre", "Direccion", "Telefono", "Horario", "Acciones"],
    rows: state.data.restaurants.map((item) => [
      item.name,
      item.address,
      item.phone,
      `${cleanTime(item.opening_time)} - ${cleanTime(item.closing_time)}`,
      deleteAction("restaurants", item.id)
    ]),
    onSubmit: (payload) => saveItem("restaurants", "/restaurants", normalizeTimes(payload))
  });
}

function renderTables() {
  setCrudView({
    title: "Mesas",
    subtitle: "Capacidad y disponibilidad",
    formId: "tableForm",
    fields: `
      ${select("restaurant_id", "Restaurante", state.data.restaurants, "name")}
      ${input("table_number", "Numero", "A1")}
      ${input("capacity", "Capacidad", "4", "number")}
      ${selectOptions("status", "Estado", ["available", "reserved", "occupied", "maintenance"])}
    `,
    columns: ["Restaurante", "Mesa", "Capacidad", "Estado", "Acciones"],
    rows: state.data.tables.map((item) => [
      restaurantName(item.restaurant_id),
      item.table_number,
      item.capacity,
      badge(item.status),
      deleteAction("tables", item.id)
    ]),
    onSubmit: (payload) => saveItem("tables", "/tables", { ...payload, restaurant_id: Number(payload.restaurant_id), capacity: Number(payload.capacity) })
  });
}

function renderCustomers() {
  setCrudView({
    title: "Clientes",
    subtitle: "Datos para reservas",
    formId: "customerForm",
    fields: `
      ${input("full_name", "Nombre completo", "Laura Martinez")}
      ${input("email", "Email", "laura@example.com", "email")}
      ${input("phone", "Telefono", "+57 310 222 3333")}
      ${input("document_number", "Documento", "CC1001")}
    `,
    columns: ["Nombre", "Email", "Telefono", "Documento", "Acciones"],
    rows: state.data.customers.map((item) => [
      item.full_name,
      item.email,
      item.phone,
      item.document_number || "-",
      deleteAction("customers", item.id)
    ]),
    onSubmit: (payload) => saveItem("customers", "/customers", payload)
  });
}

function renderReservations() {
  setCrudView({
    title: "Reservas",
    subtitle: "Calendario y confirmaciones",
    formId: "reservationForm",
    fields: `
      ${select("customer_id", "Cliente", state.data.customers, "full_name")}
      ${select("restaurant_id", "Restaurante", state.data.restaurants, "name")}
      ${select("table_id", "Mesa", state.data.tables, "table_number")}
      ${input("reservation_date", "Fecha", today(1), "date")}
      ${input("start_time", "Inicio", "19:00", "time")}
      ${input("end_time", "Fin", "20:30", "time")}
      ${input("party_size", "Personas", "2", "number")}
      ${selectOptions("status", "Estado", ["pending", "confirmed", "cancelled", "completed", "no_show"])}
      ${textarea("notes", "Notas", "Mesa tranquila")}
    `,
    columns: ["Cliente", "Mesa", "Fecha", "Hora", "Personas", "Estado", "Acciones"],
    rows: state.data.reservations.map((item) => [
      customerName(item.customer_id),
      tableName(item.table_id),
      item.reservation_date,
      `${cleanTime(item.start_time)} - ${cleanTime(item.end_time)}`,
      item.party_size,
      badge(item.status),
      reservationActions(item.id)
    ]),
    onSubmit: (payload) => saveItem("reservations", "/reservations", {
      ...payload,
      customer_id: Number(payload.customer_id),
      restaurant_id: Number(payload.restaurant_id),
      table_id: Number(payload.table_id),
      party_size: Number(payload.party_size),
      start_time: ensureSeconds(payload.start_time),
      end_time: ensureSeconds(payload.end_time)
    })
  });
}

function renderMenu() {
  setCrudView({
    title: "Menu",
    subtitle: "Productos y precios",
    formId: "menuForm",
    fields: `
      ${select("restaurant_id", "Restaurante", state.data.restaurants, "name")}
      ${input("name", "Producto", "Risotto de hongos")}
      ${textarea("description", "Descripcion", "Parmesano y aceite de trufa")}
      ${selectOptions("category", "Categoria", ["appetizer", "main_course", "dessert", "beverage"])}
      ${input("price", "Precio", "42000", "number")}
      ${selectOptions("is_available", "Disponible", ["true", "false"])}
    `,
    columns: ["Producto", "Categoria", "Precio", "Disponible", "Acciones"],
    rows: state.data.menu.map((item) => [
      item.name,
      badge(item.category),
      money(item.price),
      item.is_available ? badge("si") : badge("no", "danger"),
      deleteAction("menu", item.id)
    ]),
    onSubmit: (payload) => saveItem("menu", "/menu/items", {
      ...payload,
      restaurant_id: Number(payload.restaurant_id),
      price: Number(payload.price),
      is_available: payload.is_available === "true"
    })
  });
}

function renderOrders() {
  setCrudView({
    title: "Pedidos",
    subtitle: "Consumos por mesa",
    formId: "orderForm",
    fields: `
      ${select("restaurant_id", "Restaurante", state.data.restaurants, "name")}
      ${select("table_id", "Mesa", state.data.tables, "table_number")}
      ${select("customer_id", "Cliente", state.data.customers, "full_name", true)}
      ${selectReservations("reservation_id", "Reserva", state.data.reservations)}
      ${select("menu_item_id", "Producto", state.data.menu, "name")}
      ${input("quantity", "Cantidad", "1", "number")}
    `,
    columns: ["Mesa", "Cliente", "Estado", "Subtotal", "Total", "Items", "Acciones"],
    rows: state.data.orders.map((item) => [
      tableName(item.table_id),
      item.customer_id ? customerName(item.customer_id) : "-",
      badge(item.status),
      money(item.subtotal),
      money(item.total),
      (item.items || []).map((orderItem) => `${menuName(orderItem.menu_item_id)} x${orderItem.quantity}`).join(", "),
      `${orderActions(item.id)}${deleteAction("orders", item.id)}`
    ]),
    onSubmit: (payload) => saveOrder(payload)
  });
}

function renderPayments() {
  setCrudView({
    title: "Pagos",
    subtitle: "Confirmaciones y reembolsos",
    formId: "paymentForm",
    fields: `
      ${select("order_id", "Pedido", state.data.orders, "id")}
      ${input("amount", "Monto", orderTotalSuggestion(), "number")}
      ${selectOptions("payment_method", "Metodo", ["cash", "credit_card", "debit_card", "transfer"])}
    `,
    columns: ["Pedido", "Monto", "Metodo", "Estado", "Pagado", "Acciones"],
    rows: state.data.payments.map((item) => [
      `#${item.order_id}`,
      money(item.amount),
      item.payment_method,
      badge(item.status),
      item.paid_at ? new Date(item.paid_at).toLocaleString("es-CO") : "-",
      `${paymentActions(item.id)}${deleteAction("payments", item.id)}`
    ]),
    onSubmit: (payload) => saveItem("payments", "/payments", {
      ...payload,
      order_id: Number(payload.order_id),
      amount: Number(payload.amount)
    })
  });
}

function renderUsers() {
  setCrudView({
    title: "Usuarios",
    subtitle: "Perfiles, roles y contraseñas",
    formId: "userForm",
    fields: `
      ${input("full_name", "Nombre", "Staff RestoOps")}
      ${input("email", "Email", "staff@restoops.co", "email")}
      ${input("password", "Password temporal", "RestoOps2026", "password")}
      ${selectOptions("role", "Rol", ["admin", "staff", "customer"])}
      ${selectOptions("is_active", "Activo", ["true", "false"])}
    `,
    columns: ["Nombre", "Email", "Rol", "Estado", "Acciones"],
    rows: state.data.users.map((item) => [
      item.full_name,
      item.email,
      badge(item.role, item.role === "admin" ? "dark" : ""),
      item.is_active ? badge("activo") : badge("inactivo", "danger"),
      userActions(item)
    ]),
    onSubmit: (payload) => saveUser({
      ...payload,
      is_active: payload.is_active === "true"
    })
  });
}

function userActions(user) {
  return `
    <div class="row-actions">
      <button type="button" onclick="changeUserRole(${user.id})">Rol</button>
      <button type="button" onclick="toggleUserActive(${user.id}, ${!user.is_active})">${user.is_active ? "Desactivar" : "Activar"}</button>
      <button type="button" onclick="resetUserPassword(${user.id})">Password</button>
      <button type="button" class="danger-button" onclick="deleteResource('users', ${user.id})">Eliminar</button>
    </div>
  `;
}

function renderReports() {
  setViewHtml(`
    <section class="module">
      <div class="module-header">
        <div><h2>Reportes Excel</h2><p>Descargas operativas</p></div>
      </div>
      <div class="report-grid">
        ${reportCard("Reservas", "Reservas por fecha y estado", "/reports/reservations/excel")}
        ${reportCard("Pedidos", "Pedidos por estado", "/reports/orders/excel")}
        ${reportCard("Ventas", "Ventas por dia y productos", "/reports/sales/excel")}
      </div>
    </section>
  `);
}

function renderNotifications() {
  setCrudView({
    title: "Notificaciones",
    subtitle: "Mensajes simulados por consola",
    formId: "notificationForm",
    fields: `
      ${selectOptions("notification_type", "Tipo", ["test", "reservation_created", "reservation_confirmed", "reservation_cancelled", "order_status_changed"])}
      ${input("recipient", "Destinatario", "operations@restaurant.local", "email")}
      ${textarea("message", "Mensaje", "Prueba de notificacion")}
    `,
    columns: ["Tipo", "Destinatario", "Mensaje", "Enviado"],
    rows: state.data.notifications.map((item) => [
      badge(item.notification_type),
      item.recipient,
      item.message,
      item.sent ? badge("si") : badge("no", "danger")
    ]),
    onSubmit: (payload) => saveItem("notifications", "/notifications/test", payload)
  });
}

function setCrudView(config) {
  setViewHtml(`
    <section class="module">
      <div class="module-header">
        <div><h2>${config.title}</h2><p>${config.subtitle}</p></div>
      </div>
      <div class="split-grid">
        <form class="form-card" id="${config.formId}">
          <h3>Nuevo registro</h3>
          <div class="form-grid">${config.fields}</div>
          <button type="submit">Guardar</button>
        </form>
        ${table(config.columns, config.rows)}
      </div>
    </section>
  `);
  document.getElementById(config.formId).addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await config.onSubmit(objectFromForm(event.currentTarget));
      event.currentTarget.reset();
      await loadCollections();
      render();
      toast("Registro guardado.");
    } catch (error) {
      toast(error.message);
    }
  });
}

async function saveItem(collection, endpoint, payload) {
  if (state.apiOnline && state.token) {
    return request(endpoint, { method: "POST", body: payload });
  }
  const item = {
    id: nextDemoId(),
    ...payload,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  if (collection === "notifications") {
    item.sent = true;
    item.notification_type = payload.notification_type;
  }
  demo[collection].push(item);
  state.data[collection].push(item);
  return item;
}

async function saveUser(payload) {
  return request("/users", { method: "POST", body: payload });
}

async function updateUser(userId, payload) {
  await request(`/users/${userId}`, { method: "PUT", body: payload });
  await loadCollections();
  render();
}

async function changeUserRole(userId) {
  const role = window.prompt("Nuevo rol: admin, staff o customer");
  if (!["admin", "staff", "customer"].includes(role)) {
    toast("Rol no valido.");
    return;
  }
  await updateUser(userId, { role });
  toast("Rol actualizado.");
}

async function toggleUserActive(userId, isActive) {
  await updateUser(userId, { is_active: isActive });
  toast("Estado actualizado.");
}

async function resetUserPassword(userId) {
  const password = window.prompt("Nueva contraseña temporal:");
  if (!password || password.length < 8) {
    toast("La contraseña debe tener minimo 8 caracteres.");
    return;
  }
  await updateUser(userId, { password });
  toast("Contraseña actualizada.");
}

async function saveOrder(payload) {
  const tableId = Number(payload.table_id);
  const reservation = payload.reservation_id
    ? state.data.reservations.find((item) => item.id === Number(payload.reservation_id))
    : null;
  if (reservation && reservation.table_id !== tableId) {
    throw new Error("La reserva seleccionada pertenece a otra mesa. Cambia la mesa o deja la reserva en 'Sin asociar'.");
  }
  const itemPayload = {
    restaurant_id: Number(payload.restaurant_id),
    table_id: tableId,
    customer_id: payload.customer_id ? Number(payload.customer_id) : reservation?.customer_id || null,
    reservation_id: reservation ? reservation.id : null,
    items: [{ menu_item_id: Number(payload.menu_item_id), quantity: Number(payload.quantity) }]
  };
  if (state.apiOnline && state.token) {
    return request("/orders", { method: "POST", body: itemPayload });
  }
  const menuItem = state.data.menu.find((item) => item.id === itemPayload.items[0].menu_item_id);
  const subtotal = Number(menuItem.price) * itemPayload.items[0].quantity;
  const tax = subtotal * TAX_RATE;
  const order = {
    id: nextDemoId(),
    ...itemPayload,
    status: "pending",
    subtotal: subtotal.toFixed(2),
    tax: tax.toFixed(2),
    total: (subtotal + tax).toFixed(2),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: [{
      id: nextDemoId(),
      order_id: 0,
      menu_item_id: itemPayload.items[0].menu_item_id,
      quantity: itemPayload.items[0].quantity,
      unit_price: menuItem.price,
      total_price: subtotal.toFixed(2)
    }]
  };
  order.items[0].order_id = order.id;
  demo.orders.push(order);
  state.data.orders.push(order);
  return order;
}

async function createOrder(payload) {
  if (state.apiOnline && state.token) {
    const order = await request("/orders", { method: "POST", body: payload });
    await setTableStatus(payload.table_id, "occupied");
    return order;
  }

  const orderItems = payload.items.map((itemPayload) => {
    const menuItem = state.data.menu.find((item) => item.id === itemPayload.menu_item_id);
    const lineTotal = Number(menuItem.price) * Number(itemPayload.quantity);
    return {
      id: nextDemoId(),
      order_id: 0,
      menu_item_id: menuItem.id,
      quantity: Number(itemPayload.quantity),
      unit_price: menuItem.price,
      total_price: lineTotal.toFixed(2)
    };
  });
  const subtotal = sum(orderItems.map((item) => Number(item.total_price)));
  const tax = subtotal * TAX_RATE;
  const order = {
    id: nextDemoId(),
    restaurant_id: payload.restaurant_id,
    table_id: payload.table_id,
    reservation_id: payload.reservation_id || null,
    customer_id: payload.customer_id || null,
    status: "pending",
    subtotal: subtotal.toFixed(2),
    tax: tax.toFixed(2),
    total: (subtotal + tax).toFixed(2),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: orderItems
  };
  order.items.forEach((item) => {
    item.order_id = order.id;
  });
  demo.orders.push(order);
  state.data.orders.push(order);
  await setTableStatus(payload.table_id, "occupied");
  return order;
}

function selectPOSTable(id) {
  state.pos.selectedTableId = Number(id);
  state.pos.cart = [];
  renderPOS();
}

function addPOSItem(menuItemId) {
  const current = state.pos.cart.find((item) => item.menu_item_id === Number(menuItemId));
  if (current) {
    current.quantity += 1;
  } else {
    state.pos.cart.push({ menu_item_id: Number(menuItemId), quantity: 1 });
  }
  renderPOS();
}

function changePOSQty(menuItemId, delta) {
  const current = state.pos.cart.find((item) => item.menu_item_id === Number(menuItemId));
  if (!current) return;
  current.quantity += delta;
  if (current.quantity <= 0) {
    state.pos.cart = state.pos.cart.filter((item) => item.menu_item_id !== Number(menuItemId));
  }
  renderPOS();
}

function clearPOSCart() {
  state.pos.cart = [];
  renderPOS();
}

async function submitPOSOrder() {
  if (!state.pos.selectedTableId) {
    toast("Selecciona una mesa.");
    return;
  }
  if (!state.pos.cart.length) {
    toast("Agrega productos al carrito.");
    return;
  }
  try {
    const selectedTable = state.data.tables.find((tableItem) => tableItem.id === Number(state.pos.selectedTableId));
    const payload = {
      restaurant_id: selectedTable.restaurant_id,
      table_id: selectedTable.id,
      customer_id: null,
      reservation_id: null,
      items: state.pos.cart.map((item) => ({ menu_item_id: item.menu_item_id, quantity: item.quantity }))
    };
    const order = await createOrder(payload);
    await updateOrder(order.id, "preparing");
    state.pos.cart = [];
    await loadCollections();
    renderPOS();
    toast("Pedido enviado a cocina.");
  } catch (error) {
    toast(error.message);
  }
}

async function chargePOSOrder(orderId) {
  const order = state.data.orders.find((item) => item.id === Number(orderId));
  if (!order) return;
  try {
    if (state.apiOnline && state.token) {
      const payment = await request("/payments", {
        method: "POST",
        body: {
          order_id: order.id,
          amount: Number(order.total),
          payment_method: state.pos.paymentMethod
        }
      });
      await request(`/payments/${payment.id}/confirm`, { method: "PATCH" });
      await setTableStatus(order.table_id, "available");
    } else {
      const payment = {
        id: nextDemoId(),
        order_id: order.id,
        amount: order.total,
        payment_method: state.pos.paymentMethod,
        status: "paid",
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      demo.payments.push(payment);
      const demoOrder = demo.orders.find((item) => item.id === order.id);
      if (demoOrder) demoOrder.status = "paid";
      await setTableStatus(order.table_id, "available");
    }
    await loadCollections();
    renderPOS();
    toast("Cuenta cobrada y mesa liberada.");
  } catch (error) {
    toast(error.message);
  }
}

async function setTableStatus(tableId, status) {
  if (state.apiOnline && state.token) {
    try {
      await request(`/tables/${tableId}`, { method: "PUT", body: { status } });
    } catch (_) {
      return;
    }
  } else {
    const tableItem = demo.tables.find((item) => item.id === Number(tableId));
    if (tableItem) {
      tableItem.status = status;
      tableItem.updated_at = new Date().toISOString();
    }
  }
}

async function updateReservation(id, action) {
  if (state.apiOnline && state.token) {
    await request(`/reservations/${id}/${action}`, { method: "PATCH" });
  } else {
    const reservation = demo.reservations.find((item) => item.id === id);
    if (reservation) reservation.status = action === "confirm" ? "confirmed" : "cancelled";
  }
  await afterAction("Reserva actualizada.");
}

async function updateOrder(id, status) {
  if (state.apiOnline && state.token) {
    await request(`/orders/${id}/status`, { method: "PATCH", body: { status } });
  } else {
    const order = demo.orders.find((item) => item.id === id);
    if (order) order.status = status;
  }
  await afterAction("Pedido actualizado.");
}

async function updatePayment(id, action) {
  if (state.apiOnline && state.token) {
    await request(`/payments/${id}/${action}`, { method: "PATCH" });
  } else {
    const payment = demo.payments.find((item) => item.id === id);
    if (payment) {
      payment.status = action === "confirm" ? "paid" : "refunded";
      payment.paid_at = action === "confirm" ? new Date().toISOString() : payment.paid_at;
      const order = demo.orders.find((item) => item.id === payment.order_id);
      if (order && action === "confirm") order.status = "paid";
    }
  }
  await afterAction("Pago actualizado.");
}

async function deleteResource(collection, id) {
  const endpoints = {
    restaurants: "/restaurants",
    tables: "/tables",
    customers: "/customers",
    menu: "/menu/items",
    reservations: "/reservations",
    orders: "/orders",
    payments: "/payments",
    users: "/users"
  };
  if (state.apiOnline && state.token) {
    await request(`${endpoints[collection]}/${id}`, { method: "DELETE" });
  } else {
    demo[collection] = demo[collection].filter((item) => item.id !== id);
    state.data[collection] = state.data[collection].filter((item) => item.id !== id);
  }
  await afterAction("Registro eliminado.");
}

async function downloadReport(endpoint, filename) {
  if (!state.apiOnline || !state.token) {
    toast("Los reportes Excel necesitan la API real y una sesion activa.");
    return;
  }
  try {
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${state.token}` }
    });
    if (!response.ok) throw new Error(await readError(response));
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    toast(error.message);
  }
}

async function afterAction(message) {
  await loadCollections();
  render();
  toast(message);
}

function logout() {
  state.token = "";
  state.user = null;
  localStorage.removeItem("restoops_token");
  toast("Sesion cerrada.");
  render();
}

function canAccessView(view) {
  if (!state.user) return false;
  return (roleViews[state.user.role] || []).includes(view);
}

function enforceRoleNavigation() {
  if (!canAccessView(state.view)) {
    state.view = "dashboard";
  }
}

function startDemoSession(email, fullName, role, persist = true) {
  state.apiOnline = false;
  state.token = "";
  state.user = {
    id: 0,
    full_name: fullName || "Admin Demo",
    email: email || "admin@example.com",
    role: role || "admin",
    is_active: true
  };
  if (persist) {
    localStorage.removeItem("restoops_token");
  }
}

function emptyCollections() {
  return {
    restaurants: [],
    tables: [],
    customers: [],
    reservations: [],
    menu: [],
    orders: [],
    payments: [],
    notifications: [],
    users: []
  };
}

function bindPasswordEye() {
  const button = document.getElementById("togglePassword");
  const inputElement = document.getElementById("loginPassword");
  const pupil = button?.querySelector(".eye-pupil");
  if (!button || !inputElement || !pupil) return;

  button.addEventListener("click", (event) => {
    const isHidden = inputElement.type === "password";
    inputElement.type = isHidden ? "text" : "password";
    button.classList.toggle("open", isHidden);
    button.setAttribute("aria-label", isHidden ? "Ocultar contraseña" : "Mostrar contraseña");

    const rect = button.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
    pupil.style.transform = isHidden ? `translate(${x}px, ${y}px)` : "translate(0, 0)";
  });
}

function setViewHtml(html) {
  document.getElementById("viewContainer").innerHTML = html;
}

function statCard(label, value) {
  return `<article class="stat-card"><span>${label}</span><strong>${value}</strong></article>`;
}

function table(columns, rows) {
  if (!rows.length) return `<div class="table-card"><div class="empty-state">Sin registros todavia.</div></div>`;
  return `
    <div class="table-card">
      <table>
        <thead><tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell ?? "-"}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function input(name, label, value = "", type = "text") {
  return `<label>${label}<input name="${name}" type="${type}" value="${value}" required></label>`;
}

function textarea(name, label, value = "") {
  return `<label>${label}<textarea name="${name}">${value}</textarea></label>`;
}

function select(name, label, options, textKey, optional = false) {
  const empty = optional ? `<option value="">Sin asociar</option>` : "";
  return `
    <label>${label}
      <select name="${name}" ${optional ? "" : "required"}>
        ${empty}
        ${options.map((item) => `<option value="${item.id}">${textKey === "id" ? `#${item.id}` : item[textKey]}</option>`).join("")}
      </select>
    </label>
  `;
}

function selectReservations(name, label, options) {
  return `
    <label>${label}
      <select name="${name}">
        <option value="">Sin asociar</option>
        ${options.map((item) => `
          <option value="${item.id}">#${item.id} - ${customerName(item.customer_id)} / ${tableName(item.table_id)} / ${item.reservation_date}</option>
        `).join("")}
      </select>
    </label>
  `;
}

function selectOptions(name, label, options) {
  return `
    <label>${label}
      <select name="${name}">
        ${options.map((item) => `<option value="${item}">${item}</option>`).join("")}
      </select>
    </label>
  `;
}

function badge(value, tone = "") {
  const warn = ["pending", "preparing", "reserved", "maintenance"].includes(String(value));
  const danger = ["cancelled", "failed", "no_show", "occupied"].includes(String(value));
  const cls = tone || (danger ? "danger" : warn ? "warn" : "");
  return `<span class="badge ${cls}">${value}</span>`;
}

function reservationActions(id) {
  return `
    <div class="row-actions">
      <button type="button" onclick="updateReservation(${id}, 'confirm')">Confirmar</button>
      <button type="button" class="danger-button" onclick="updateReservation(${id}, 'cancel')">Cancelar</button>
    </div>
  `;
}

function orderActions(id) {
  return `
    <div class="row-actions">
      <button type="button" onclick="updateOrder(${id}, 'preparing')">Preparar</button>
      <button type="button" onclick="updateOrder(${id}, 'served')">Servido</button>
      <button type="button" class="danger-button" onclick="updateOrder(${id}, 'cancelled')">Cancelar</button>
    </div>
  `;
}

function paymentActions(id) {
  return `
    <div class="row-actions">
      <button type="button" onclick="updatePayment(${id}, 'confirm')">Confirmar</button>
      <button type="button" class="danger-button" onclick="updatePayment(${id}, 'refund')">Reembolsar</button>
    </div>
  `;
}

function reportCard(title, text, href) {
  return `
    <article class="report-card">
      <h3>${title}</h3>
      <p>${text}</p>
      <button type="button" onclick="downloadReport('${href}', '${title.toLowerCase()}_report.xlsx')">Descargar Excel</button>
    </article>
  `;
}

function deleteAction(collection, id) {
  return `
    <div class="row-actions">
      <button type="button" class="danger-button" onclick="deleteResource('${collection}', ${id})">Eliminar</button>
    </div>
  `;
}

function objectFromForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function normalizeTimes(payload) {
  return {
    ...payload,
    opening_time: ensureSeconds(payload.opening_time),
    closing_time: ensureSeconds(payload.closing_time)
  };
}

function ensureSeconds(value) {
  return value && value.length === 5 ? `${value}:00` : value;
}

function cleanTime(value) {
  if (!value) return "-";
  return String(value).slice(0, 5);
}

function today(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function money(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function nextDemoId() {
  demo.nextId += 1;
  return demo.nextId;
}

function cloneDemoData() {
  return JSON.parse(JSON.stringify({
    restaurants: demo.restaurants,
    tables: demo.tables,
    customers: demo.customers,
    reservations: demo.reservations,
    menu: demo.menu,
    orders: demo.orders,
    payments: demo.payments,
    notifications: demo.notifications,
    users: []
  }));
}

function restaurantName(id) {
  return state.data.restaurants.find((item) => item.id === Number(id))?.name || `Restaurante #${id}`;
}

function tableName(id) {
  const item = state.data.tables.find((tableItem) => tableItem.id === Number(id));
  return item ? item.table_number : `Mesa #${id}`;
}

function customerName(id) {
  return state.data.customers.find((item) => item.id === Number(id))?.full_name || `Cliente #${id}`;
}

function menuName(id) {
  return state.data.menu.find((item) => item.id === Number(id))?.name || `Producto #${id}`;
}

function orderTotalSuggestion() {
  const order = state.data.orders.find((item) => item.status !== "paid" && item.status !== "cancelled");
  return order ? order.total : "0";
}

function getTopProducts() {
  const products = new Map();
  state.data.orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const current = products.get(item.menu_item_id) || { name: menuName(item.menu_item_id), quantity: 0 };
      current.quantity += Number(item.quantity);
      products.set(item.menu_item_id, current);
    });
  });
  return Array.from(products.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
}

function getActiveOrderForTable(tableId) {
  return state.data.orders
    .filter((order) => Number(order.table_id) === Number(tableId) && !["paid", "cancelled"].includes(order.status))
    .sort((a, b) => Number(b.id) - Number(a.id))[0];
}

function calculateCartTotals() {
  const subtotal = state.pos.cart.reduce((total, cartItem) => {
    const product = state.data.menu.find((item) => item.id === Number(cartItem.menu_item_id));
    return total + Number(product?.price || 0) * Number(cartItem.quantity);
  }, 0);
  const tax = subtotal * TAX_RATE;
  return { subtotal, tax, total: subtotal + tax };
}

function categoryLabel(category) {
  const labels = {
    appetizer: "Entradas",
    main_course: "Platos fuertes",
    dessert: "Postres",
    beverage: "Bebidas"
  };
  return labels[category] || category;
}

function toast(message) {
  const element = document.getElementById("toast");
  element.textContent = message;
  element.hidden = false;
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => {
    element.hidden = true;
  }, 3600);
}

window.updateReservation = updateReservation;
window.updateOrder = updateOrder;
window.updatePayment = updatePayment;
window.deleteResource = deleteResource;
window.downloadReport = downloadReport;
window.changeUserRole = changeUserRole;
window.toggleUserActive = toggleUserActive;
window.resetUserPassword = resetUserPassword;
window.selectPOSTable = selectPOSTable;
window.addPOSItem = addPOSItem;
window.changePOSQty = changePOSQty;
window.clearPOSCart = clearPOSCart;
window.submitPOSOrder = submitPOSOrder;
window.chargePOSOrder = chargePOSOrder;
