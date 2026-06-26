const API_BASE = "";
const TAX_RATE = 0.1;
const POS_TABLE_LAYOUT = {
  A1: { x: 17, y: 30, shape: "round" },
  A2: { x: 34, y: 30, shape: "round" },
  A3: { x: 51, y: 30, shape: "round" },
  B1: { x: 17, y: 56, shape: "square" },
  B2: { x: 35, y: 58, shape: "square" },
  B4: { x: 55, y: 58, shape: "square wide" },
  C1: { x: 78, y: 43, shape: "square wide" },
  C2: { x: 78, y: 66, shape: "square wide" },
  VIP1: { x: 58, y: 84, shape: "vip" },
  BAR1: { x: 16, y: 84, shape: "bar-seat" }
};
const ITALIAN_MENU_ITEMS = [
  { name: "Bruschetta al pomodoro", description: "Pan rustico, tomate, ajo, albahaca y aceite de oliva", category: "appetizer", price: "18000.00" },
  { name: "Burrata pugliese", description: "Burrata fresca, pesto, tomates confitados y focaccia", category: "appetizer", price: "34000.00" },
  { name: "Carpaccio di manzo", description: "Res laminada, rucula, parmesano y limon siciliano", category: "appetizer", price: "39000.00" },
  { name: "Arancini siciliani", description: "Croquetas de risotto con mozzarella y pomodoro", category: "appetizer", price: "26000.00" },
  { name: "Tagliatelle alla bolognese", description: "Pasta fresca con ragu lento de res y cerdo", category: "main_course", price: "46000.00" },
  { name: "Spaghetti carbonara", description: "Guanciale, pecorino romano, yema y pimienta negra", category: "main_course", price: "44000.00" },
  { name: "Lasagna della casa", description: "Capas de pasta, ragu, bechamel y parmesano gratinado", category: "main_course", price: "48000.00" },
  { name: "Risotto ai funghi", description: "Arborio, portobello, parmesano y aceite de trufa", category: "main_course", price: "52000.00" },
  { name: "Gnocchi al pesto", description: "Gnocchi de papa, pesto genoves y pinoli", category: "main_course", price: "42000.00" },
  { name: "Pizza margherita napolitana", description: "Pomodoro, mozzarella fior di latte y albahaca", category: "main_course", price: "39000.00" },
  { name: "Osso buco alla milanese", description: "Ternera braseada, gremolata y risotto azafranado", category: "main_course", price: "72000.00" },
  { name: "Pollo alla parmigiana", description: "Pechuga apanada, pomodoro, mozzarella y spaghetti", category: "main_course", price: "54000.00" },
  { name: "Tiramisu classico", description: "Mascarpone, espresso, savoiardi y cacao", category: "dessert", price: "22000.00" },
  { name: "Panna cotta frutos rojos", description: "Crema cocida de vainilla con coulis artesanal", category: "dessert", price: "20000.00" },
  { name: "Cannoli siciliani", description: "Canutillos crujientes con ricotta dulce y pistacho", category: "dessert", price: "24000.00" },
  { name: "Gelato artigianale", description: "Tres sabores: pistacho, vainilla y chocolate", category: "dessert", price: "18000.00" },
  { name: "Limonata italiana", description: "Limon siciliano, soda y hierbabuena", category: "beverage", price: "12000.00" },
  { name: "San Pellegrino", description: "Agua mineral gasificada italiana", category: "beverage", price: "11000.00" },
  { name: "Coca-Cola", description: "Gaseosa fria 350 ml", category: "beverage", price: "8000.00" },
  { name: "Peroni Nastro Azzurro", description: "Cerveza lager italiana", category: "beverage", price: "16000.00" },
  { name: "Moretti", description: "Cerveza italiana suave y maltosa", category: "beverage", price: "15000.00" },
  { name: "Chianti Classico", description: "Copa de vino tinto toscano", category: "beverage", price: "28000.00" },
  { name: "Pinot Grigio", description: "Copa de vino blanco fresco", category: "beverage", price: "26000.00" },
  { name: "Sangria rosso", description: "Vino tinto, frutas, naranja y especias", category: "beverage", price: "24000.00" },
  { name: "Aperol Spritz", description: "Aperol, prosecco, soda y naranja", category: "beverage", price: "30000.00" },
  { name: "Negroni", description: "Gin, Campari y vermut rosso", category: "beverage", price: "32000.00" }
];
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
    paymentMethod: "cash",
    waiterId: "",
    tipAmount: 0,
    receivedAmount: 0
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
  menu: ITALIAN_MENU_ITEMS.map((item, index) => ({
    id: index + 1,
    restaurant_id: 1,
    ...item,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })),
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
  const selectedTableOrder = selectedTable ? getActiveOrderForTable(selectedTable.id) : null;
  const waiters = getWaiters();
  if (!state.pos.waiterId && waiters.length) {
    state.pos.waiterId = String(waiters[0].id);
  }
  const cashier = activeOrder ? calculateCashier(activeOrder) : calculateCashier({ total: 0 });

  setViewHtml(`
    <section class="pos-layout">
      <div class="pos-main">
        <section class="module">
          <div class="module-header">
            <div>
              <h2>Croquis del restaurante</h2>
              <p>Entrada, barra, cocina, bodega, banos, salon y terraza operativa</p>
            </div>
            <span class="badge dark">${selectedTable ? `Mesa ${selectedTable.table_number}` : "Sin mesa"}</span>
          </div>
          <div class="floor-toolbar">
            <span><b></b> Disponible</span>
            <span><b></b> Ocupada</span>
            <span><b></b> Reservada</span>
            <span><b></b> Mantenimiento</span>
          </div>
          <div class="floor-plan" aria-label="Croquis interactivo de RestoOps">
            ${floorFeature("Entrada", "Recepcion", "feature-entry")}
            ${floorFeature("Barra", "Cocteles y caja", "feature-bar")}
            ${floorFeature("Cocina", "Salida de platos", "feature-kitchen")}
            ${floorFeature("Bodega", "Insumos", "feature-storage")}
            ${floorFeature("Banos", "Clientes", "feature-restrooms")}
            ${floorFeature("Terraza", "Zona abierta", "feature-terrace")}
            ${state.data.tables.map((tableItem) => posMapTable(tableItem)).join("")}
            <div class="floor-path path-main"></div>
            <div class="floor-path path-service"></div>
          </div>
          <div class="floor-inspector">
            <div>
              <span>Mesa seleccionada</span>
              <strong>${selectedTable ? `${selectedTable.table_number} · ${selectedTable.capacity} puestos` : "Sin mesa"}</strong>
            </div>
            <div>
              <span>Estado</span>
              <strong>${selectedTable ? selectedTable.status : "-"}</strong>
            </div>
            <div>
              <span>Cuenta activa</span>
              <strong>${selectedTableOrder ? money(selectedTableOrder.total) : "Sin cuenta"}</strong>
            </div>
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

        <section class="module">
          <div class="module-header">
            <div>
              <h2>Ventas y propinas</h2>
              <p>Resumen por mesero para cierre de turno</p>
            </div>
          </div>
          <div class="waiter-grid">
            ${waiterPerformanceCards()}
          </div>
        </section>
      </div>

      <aside class="pos-ticket">
        <div class="ticket-header">
          <span>Cuenta actual</span>
          <strong>${selectedTable ? `Mesa ${selectedTable.table_number}` : "Selecciona mesa"}</strong>
        </div>

        ${activeOrder ? activeOrderSummary(activeOrder) : ""}
        ${activeOrder ? orderTrace(activeOrder) : ""}

        <div class="ticket-lines">
          ${state.pos.cart.length ? state.pos.cart.map((item) => posCartLine(item)).join("") : `<div class="empty-state">Agrega productos desde el menu.</div>`}
        </div>

        <div class="ticket-totals">
          <div><span>Subtotal</span><strong>${money(cartTotals.subtotal)}</strong></div>
          <div><span>Impuesto</span><strong>${money(cartTotals.tax)}</strong></div>
          <div class="ticket-total"><span>Total</span><strong>${money(cartTotals.total)}</strong></div>
        </div>

        <section class="cash-register">
          <div class="cash-display">
            <span>Total cuenta</span>
            <strong>${money(cashier.baseTotal)}</strong>
          </div>
          <div class="cash-grid">
            <label>Mesero
              <select id="posWaiter">
                ${waiters.map((waiter) => `<option value="${waiter.id}" ${String(state.pos.waiterId) === String(waiter.id) ? "selected" : ""}>${waiter.full_name}</option>`).join("")}
              </select>
            </label>
            <label>Metodo de pago
          <select id="posPaymentMethod">
            ${["cash", "credit_card", "debit_card", "transfer"].map((method) => `<option value="${method}" ${state.pos.paymentMethod === method ? "selected" : ""}>${method}</option>`).join("")}
          </select>
            </label>
            <label>Propina
              <input id="posTipAmount" type="number" min="0" step="1000" value="${state.pos.tipAmount || 0}">
            </label>
            <label>Recibido
              <input id="posReceivedAmount" type="number" min="0" step="1000" value="${state.pos.receivedAmount || cashier.totalToCollect}">
            </label>
          </div>
          <div class="cash-summary">
            <div><span>A cobrar</span><strong id="cashTotalToCollect">${money(cashier.totalToCollect)}</strong></div>
            <div><span>Cambio</span><strong id="cashChange">${money(cashier.change)}</strong></div>
          </div>
        </section>

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
    if (state.pos.paymentMethod !== "cash") {
      const currentOrder = getActiveOrderForTable(state.pos.selectedTableId);
      state.pos.receivedAmount = currentOrder ? calculateCashier(currentOrder).totalToCollect : 0;
    }
    renderPOS();
  });
  document.getElementById("posWaiter")?.addEventListener("change", (event) => {
    state.pos.waiterId = event.target.value;
  });
  document.getElementById("posTipAmount")?.addEventListener("input", (event) => {
    state.pos.tipAmount = Number(event.target.value || 0);
    updateCashSummary();
  });
  document.getElementById("posReceivedAmount")?.addEventListener("input", (event) => {
    state.pos.receivedAmount = Number(event.target.value || 0);
    updateCashSummary();
  });
}

function updateCashSummary() {
  const activeOrder = getActiveOrderForTable(state.pos.selectedTableId);
  if (!activeOrder) return;
  const cashier = calculateCashier(activeOrder);
  const totalElement = document.getElementById("cashTotalToCollect");
  const changeElement = document.getElementById("cashChange");
  if (totalElement) totalElement.textContent = money(cashier.totalToCollect);
  if (changeElement) changeElement.textContent = money(cashier.change);
}

function floorFeature(title, subtitle, className) {
  return `
    <div class="floor-feature ${className}">
      <strong>${title}</strong>
      <span>${subtitle}</span>
    </div>
  `;
}

function posMapTable(tableItem) {
  const isSelected = Number(state.pos.selectedTableId) === tableItem.id;
  const activeOrder = getActiveOrderForTable(tableItem.id);
  const layout = POS_TABLE_LAYOUT[tableItem.table_number] || { x: 45, y: 45, shape: "square" };
  return `
    <button
      type="button"
      class="floor-table ${layout.shape} ${tableItem.status} ${isSelected ? "selected" : ""}"
      style="left: ${layout.x}%; top: ${layout.y}%;"
      onclick="selectPOSTable(${tableItem.id})"
      aria-label="Mesa ${tableItem.table_number}, ${tableItem.status}"
    >
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
        <em>${waiterName(order.waiter_id)}</em>
      </div>
      <div class="row-actions">
        <button type="button" onclick="updateOrder(${order.id}, 'preparing')">Cocina</button>
        <button type="button" onclick="updateOrder(${order.id}, 'served')">Servido</button>
      </div>
    </div>
  `;
}

function orderTrace(order) {
  const reservation = order.reservation_id ? state.data.reservations.find((item) => item.id === Number(order.reservation_id)) : null;
  const payment = state.data.payments.find((item) => item.order_id === order.id);
  const steps = [
    { label: "Reserva", done: Boolean(reservation), detail: reservation ? `#${reservation.id} ${reservation.status}` : "Sin reserva" },
    { label: "Asistencia", done: Boolean(order.table_id), detail: `Mesa ${tableName(order.table_id)}` },
    { label: "Pedido", done: true, detail: `#${order.id}` },
    { label: "Cocina", done: ["preparing", "served", "paid"].includes(order.status), detail: order.status },
    { label: "Mesa", done: ["served", "paid"].includes(order.status), detail: order.status === "served" || order.status === "paid" ? "Servido" : "Pendiente" },
    { label: "Pago", done: Boolean(payment?.status === "paid" || order.status === "paid"), detail: payment ? `${payment.payment_method} ${money(payment.tip_amount || 0)} propina` : "Pendiente" }
  ];
  return `
    <div class="trace-card">
      ${steps.map((step) => `
        <div class="trace-step ${step.done ? "done" : ""}">
          <span>${step.label}</span>
          <strong>${step.detail}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function waiterPerformanceCards() {
  const waiters = getWaiters();
  if (!waiters.length) return `<div class="empty-state">Crea usuarios staff para ver ventas y propinas por mesero.</div>`;
  return waiters.map((waiter) => {
    const payments = state.data.payments.filter((payment) => Number(payment.waiter_id) === Number(waiter.id) && payment.status === "paid");
    const sales = sum(payments.map((payment) => Number(payment.amount || 0)));
    const tips = sum(payments.map((payment) => Number(payment.tip_amount || 0)));
    return `
      <article class="waiter-card">
        <span>${waiter.role}</span>
        <strong>${waiter.full_name}</strong>
        <div><small>Ventas</small><b>${money(sales)}</b></div>
        <div><small>Propinas</small><b>${money(tips)}</b></div>
      </article>
    `;
  }).join("");
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
      ${input("name", "Producto", "Spaghetti carbonara")}
      ${textarea("description", "Descripcion", "Guanciale, pecorino romano, yema y pimienta negra")}
      ${selectOptions("category", "Categoria", ["appetizer", "main_course", "dessert", "beverage"])}
      ${input("price", "Precio", "44000", "number")}
      ${selectOptions("is_available", "Disponible", ["true", "false"])}
    `,
    columns: ["Producto", "Categoria", "Precio", "Disponible", "Acciones"],
    rows: state.data.menu.map((item) => [
      item.name,
      badge(categoryLabel(item.category)),
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
      ${selectWaiters("waiter_id", "Mesero", getWaiters())}
      ${select("menu_item_id", "Producto", state.data.menu, "name")}
      ${input("quantity", "Cantidad", "1", "number")}
    `,
    columns: ["Mesa", "Mesero", "Cliente", "Estado", "Subtotal", "Total", "Items", "Acciones"],
    rows: state.data.orders.map((item) => [
      tableName(item.table_id),
      waiterName(item.waiter_id),
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
      ${selectWaiters("waiter_id", "Mesero", getWaiters())}
      ${input("amount", "Monto", orderTotalSuggestion(), "number")}
      ${input("tip_amount", "Propina", "0", "number")}
      ${input("received_amount", "Recibido", orderTotalSuggestion(), "number")}
      ${selectOptions("payment_method", "Metodo", ["cash", "credit_card", "debit_card", "transfer"])}
    `,
    columns: ["Pedido", "Mesero", "Monto", "Propina", "Recibido", "Cambio", "Metodo", "Estado", "Pagado", "Acciones"],
    rows: state.data.payments.map((item) => [
      `#${item.order_id}`,
      waiterName(item.waiter_id),
      money(item.amount),
      money(item.tip_amount || 0),
      money(item.received_amount || item.amount),
      money(item.change_amount || 0),
      item.payment_method,
      badge(item.status),
      item.paid_at ? new Date(item.paid_at).toLocaleString("es-CO") : "-",
      `${paymentActions(item.id)}${deleteAction("payments", item.id)}`
    ]),
    onSubmit: (payload) => saveItem("payments", "/payments", {
      ...payload,
      order_id: Number(payload.order_id),
      waiter_id: payload.waiter_id ? Number(payload.waiter_id) : defaultWaiterId(),
      amount: Number(payload.amount),
      tip_amount: Number(payload.tip_amount || 0),
      received_amount: Number(payload.received_amount || payload.amount)
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
    waiter_id: payload.waiter_id ? Number(payload.waiter_id) : defaultWaiterId(),
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
    waiter_id: payload.waiter_id || defaultWaiterId(),
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
      waiter_id: state.pos.waiterId ? Number(state.pos.waiterId) : defaultWaiterId(),
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
    const cashier = calculateCashier(order);
    if (cashier.received < cashier.totalToCollect) {
      toast("El dinero recibido no alcanza para cubrir cuenta y propina.");
      return;
    }
    if (state.apiOnline && state.token) {
      const payment = await request("/payments", {
        method: "POST",
        body: {
          order_id: order.id,
          amount: Number(order.total),
          payment_method: state.pos.paymentMethod,
          waiter_id: state.pos.waiterId ? Number(state.pos.waiterId) : order.waiter_id || defaultWaiterId(),
          tip_amount: cashier.tip,
          received_amount: cashier.received
        }
      });
      await request(`/payments/${payment.id}/confirm`, { method: "PATCH" });
    } else {
      const payment = {
        id: nextDemoId(),
        order_id: order.id,
        waiter_id: state.pos.waiterId ? Number(state.pos.waiterId) : order.waiter_id || defaultWaiterId(),
        amount: order.total,
        tip_amount: cashier.tip.toFixed(2),
        received_amount: cashier.received.toFixed(2),
        change_amount: cashier.change.toFixed(2),
        payment_method: state.pos.paymentMethod,
        status: "paid",
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      demo.payments.push(payment);
      const demoOrder = demo.orders.find((item) => item.id === order.id);
      if (demoOrder) demoOrder.status = "paid";
      const reservation = demo.reservations.find((item) => item.id === order.reservation_id);
      if (reservation) reservation.status = "completed";
      await setTableStatus(order.table_id, "available");
    }
    state.pos.tipAmount = 0;
    state.pos.receivedAmount = 0;
    await loadCollections();
    renderPOS();
    toast(`Cuenta cobrada. Cambio: ${money(cashier.change)}. Mesa liberada.`);
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

function selectWaiters(name, label, options) {
  return `
    <label>${label}
      <select name="${name}">
        ${options.map((item) => `<option value="${item.id}" ${String(state.pos.waiterId) === String(item.id) ? "selected" : ""}>${item.full_name}</option>`).join("")}
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

function getWaiters() {
  const users = state.data.users
    .filter((item) => item.is_active && ["admin", "staff"].includes(item.role))
    .sort((a, b) => {
      if (a.role === b.role) return a.full_name.localeCompare(b.full_name);
      return a.role === "staff" ? -1 : 1;
    });
  if (users.length) return users;
  return state.user && ["admin", "staff"].includes(state.user.role) ? [state.user] : [];
}

function defaultWaiterId() {
  const waiter = getWaiters()[0];
  return waiter ? Number(waiter.id) : null;
}

function waiterName(id) {
  if (!id) return "Sin asignar";
  return state.data.users.find((item) => item.id === Number(id))?.full_name || `Mesero #${id}`;
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

function calculateCashier(order) {
  const baseTotal = Number(order?.total || 0);
  const tip = Number(state.pos.tipAmount || 0);
  const totalToCollect = baseTotal + tip;
  const received = state.pos.paymentMethod === "cash"
    ? Number(state.pos.receivedAmount || totalToCollect)
    : totalToCollect;
  const change = Math.max(received - totalToCollect, 0);
  return { baseTotal, tip, totalToCollect, received, change };
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
