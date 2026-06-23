/* ════════════════════════════════════════════════════════════════════════
   HELPERS GENERALES
   ════════════════════════════════════════════════════════════════════════ */

// Acorta document.getElementById
const $ = (id) => document.getElementById(id);

// Crea un elemento con clases y texto en una sola línea.
// clases puede ser un string ("a b") o un array (["a", "b"]).
function crearEl(tag, clases = "", texto = "") {
  const el = document.createElement(tag);
  if (clases) el.classList.add(...(Array.isArray(clases) ? clases : clases.split(" ")));
  if (texto) el.textContent = texto;
  return el;
}

function formatearPrecio(valor) {
  return valor.toLocaleString("es-AR", { minimumFractionDigits: 0 });
}

/* ════════════════════════════════════════════════════════════════════════
   TEMA — Maneja el cambio entre tema claro / oscuro y lo persiste
   ════════════════════════════════════════════════════════════════════════ */

const CLAVE_TEMA = "gamezone_tema";

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-tema", tema);
  const btn = $("btn-tema");
  if (btn) btn.textContent = tema === "claro" ? "🌙" : "☀️";
}

function toggleTema() {
  const actual = localStorage.getItem(CLAVE_TEMA) || "oscuro";
  const nuevo = actual === "oscuro" ? "claro" : "oscuro";
  localStorage.setItem(CLAVE_TEMA, nuevo);
  aplicarTema(nuevo);
}

// Se ejecuta apenas carga el script, antes del primer render visible
aplicarTema(localStorage.getItem(CLAVE_TEMA) || "oscuro");

document.addEventListener("DOMContentLoaded", () => {
  $("btn-tema")?.addEventListener("click", toggleTema);
});

/* ════════════════════════════════════════════════════════════════════════
   CARRITO — Lógica centralizada usando localStorage
   Estructura guardada: [{ id, nombre, precio, imagen, cantidad }]
   ════════════════════════════════════════════════════════════════════════ */

const CLAVE_CARRITO = "gamezone_carrito";
const CLAVE_CLIENTE = "gamezone_cliente";

const obtenerCarrito = () => JSON.parse(localStorage.getItem(CLAVE_CARRITO) || "[]");
const guardarCarrito = (carrito) => localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));

function agregarAlCarrito(producto, cantidad = 1) {
  const carrito = obtenerCarrito();
  const existente = carrito.find((item) => item.id === producto.id);

  if (existente) {
    existente.cantidad += cantidad;
  } else {
    const { id, nombre, precio, imagen } = producto;
    carrito.push({ id, nombre, precio, imagen, cantidad });
  }

  guardarCarrito(carrito);
  actualizarBadgeCarrito();
}

function quitarDelCarrito(idProducto) {
  guardarCarrito(obtenerCarrito().filter((item) => item.id !== idProducto));
  actualizarBadgeCarrito();
}

function cambiarCantidad(idProducto, nuevaCantidad) {
  if (nuevaCantidad <= 0) return quitarDelCarrito(idProducto);

  const carrito = obtenerCarrito();
  const item = carrito.find((i) => i.id === idProducto);
  if (!item) return;

  item.cantidad = nuevaCantidad;
  guardarCarrito(carrito);
  actualizarBadgeCarrito();
}

const calcularTotalCarrito = () => obtenerCarrito().reduce((acc, i) => acc + i.precio * i.cantidad, 0);
const contarItemsCarrito = () => obtenerCarrito().reduce((acc, i) => acc + i.cantidad, 0);

function vaciarCarrito() {
  localStorage.removeItem(CLAVE_CARRITO);
  actualizarBadgeCarrito();
}

// Actualiza el contador visual en la navbar (si existe en la página actual)
function actualizarBadgeCarrito() {
  const badge = $("badge-carrito");
  if (!badge) return;
  const total = contarItemsCarrito();
  badge.textContent = total;
  badge.style.display = total > 0 ? "inline-block" : "none";
}

// ── Datos del cliente (nombre ingresado en bienvenida) ────────────────────
const guardarNombreCliente = (nombre) => localStorage.setItem(CLAVE_CLIENTE, nombre);
const obtenerNombreCliente = () => localStorage.getItem(CLAVE_CLIENTE) || "";

function limpiarSesionCliente() {
  localStorage.removeItem(CLAVE_CLIENTE);
  vaciarCarrito();
}

document.addEventListener("DOMContentLoaded", actualizarBadgeCarrito);

/* ════════════════════════════════════════════════════════════════════════
   PANTALLA: Bienvenida (index.html)
   ════════════════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  const form = $("form-bienvenida");
  if (!form) return; // No estamos en index.html

  const inputNombre = $("nombre");
  const errorMsg = $("error-nombre");

  // Si ya hay un nombre guardado, lo precargamos (por si vuelve atrás)
  inputNombre.value = obtenerNombreCliente();

  const limpiarError = () => {
    inputNombre.classList.remove("input-error");
    errorMsg.textContent = "";
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = inputNombre.value.trim();

    if (nombre.length < 2) {
      inputNombre.classList.add("input-error");
      errorMsg.textContent = "Ingresá un nombre válido (mínimo 2 letras).";
      return;
    }

    limpiarError();
    guardarNombreCliente(nombre);
    window.location.href = "productos.html";
  });

  inputNombre.addEventListener("input", limpiarError);
});

/* ════════════════════════════════════════════════════════════════════════
   PANTALLA: Productos (productos.html)
   ════════════════════════════════════════════════════════════════════════ */

const PRODUCTOS_POR_PAGINA = 6;
let categoriaActual = "todos";
let paginaActual = 1;
let productoSeleccionado = null;
let cantidadSeleccionada = 1;

document.addEventListener("DOMContentLoaded", () => {
  const grid = $("grid-productos");
  if (!grid) return; // No estamos en productos.html

  const nombre = obtenerNombreCliente();
  if (!nombre) return (window.location.href = "index.html");
  $("nombre-cliente").textContent = nombre;

  configurarTabs();
  configurarModalCantidad();
  renderizarProductos();
});

function configurarTabs() {
  const tabs = document.querySelectorAll(".tab-categoria");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("activo"));
      tab.classList.add("activo");
      categoriaActual = tab.dataset.categoria;
      paginaActual = 1;
      renderizarProductos();
    });
  });
}

function obtenerProductosFiltrados() {
  // Solo productos activos (requisito del TP)
  const activos = PRODUCTOS_MOCK.filter((p) => p.activo);
  return categoriaActual === "todos" ? activos : activos.filter((p) => p.categoria === categoriaActual);
}

function renderizarProductos() {
  const productos = obtenerProductosFiltrados();
  const totalPaginas = Math.ceil(productos.length / PRODUCTOS_POR_PAGINA) || 1;
  if (paginaActual > totalPaginas) paginaActual = totalPaginas;

  const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
  const paginaProductos = productos.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);

  const grid = $("grid-productos");
  grid.innerHTML = paginaProductos.length
    ? ""
    : `<p class="sin-productos">No hay productos disponibles en esta categoría.</p>`;

  paginaProductos.forEach((producto) => grid.appendChild(crearCardProducto(producto)));
  renderizarPaginacion(totalPaginas);
}

function crearCardProducto(producto) {
  const { imagen, nombre, categoria, descripcion, precio } = producto;

  const imgWrapper = crearEl("div", "producto-img-wrapper");
  const img = document.createElement("img");
  img.src = imagen;
  img.alt = nombre;
  img.loading = "lazy";
  imgWrapper.appendChild(img);

  const btnAgregar = crearEl("button", ["btn", "btn-primary"], "Agregar al carrito");
  btnAgregar.addEventListener("click", () => abrirModalCantidad(producto));

  const info = crearEl("div", "producto-info");
  info.append(
    crearEl("span", "producto-categoria-tag", categoria),
    crearEl("h3", "producto-nombre", nombre),
    crearEl("p", "producto-desc", descripcion),
    crearEl("p", "producto-precio", `$${formatearPrecio(precio)}`),
    btnAgregar
  );

  const card = crearEl("div", "producto-card");
  card.append(imgWrapper, info);
  return card;
}

// Crea un botón de paginación; sirve tanto para números como para ‹ › (con disabled opcional)
function crearBotonPagina(texto, onClick, { activo = false, disabled = false } = {}) {
  const btn = crearEl("button", "pagina-btn", texto);
  if (activo) btn.classList.add("activo");
  btn.disabled = disabled;
  btn.addEventListener("click", onClick);
  return btn;
}

function renderizarPaginacion(totalPaginas) {
  const cont = $("paginacion");
  cont.innerHTML = "";
  if (totalPaginas <= 1) return;

  cont.appendChild(
    crearBotonPagina("‹", () => { paginaActual--; renderizarProductos(); }, { disabled: paginaActual === 1 })
  );

  for (let i = 1; i <= totalPaginas; i++) {
    cont.appendChild(
      crearBotonPagina(i, () => { paginaActual = i; renderizarProductos(); }, { activo: i === paginaActual })
    );
  }

  cont.appendChild(
    crearBotonPagina("›", () => { paginaActual++; renderizarProductos(); }, { disabled: paginaActual === totalPaginas })
  );
}

/* ── Modal de selección de cantidad ────────────────────────────────────── */
function configurarModalCantidad() {
  $("btn-restar").addEventListener("click", () => cambiarCantidadModal(-1));
  $("btn-sumar").addEventListener("click", () => cambiarCantidadModal(1));
  $("btn-confirmar-agregar").addEventListener("click", () => {
    if (productoSeleccionado) {
      agregarAlCarrito(productoSeleccionado, cantidadSeleccionada);
      cerrarModalCantidad();
    }
  });
}

function cambiarCantidadModal(delta) {
  if (cantidadSeleccionada + delta < 1) return;
  cantidadSeleccionada += delta;
  $("cantidad-valor").textContent = cantidadSeleccionada;
}

function abrirModalCantidad(producto) {
  productoSeleccionado = producto;
  cantidadSeleccionada = 1;
  $("cantidad-valor").textContent = "1";
  $("modal-cantidad-titulo").textContent = producto.nombre;
  $("modal-cantidad").classList.add("activo");
}

function cerrarModalCantidad() {
  $("modal-cantidad").classList.remove("activo");
  productoSeleccionado = null;
}

/* ════════════════════════════════════════════════════════════════════════
   PANTALLA: Carrito (carrito.html)
   ════════════════════════════════════════════════════════════════════════ */

let idAEliminar = null;

document.addEventListener("DOMContentLoaded", () => {
  if (!$("lista-carrito")) return; // No estamos en carrito.html
  if (!obtenerNombreCliente()) return (window.location.href = "index.html");

  renderizarCarrito();
  configurarModales();

  $("btn-finalizar").addEventListener("click", () => {
    if (obtenerCarrito().length) $("modal-confirmar").classList.add("activo");
  });
});

function renderizarCarrito() {
  const carrito = obtenerCarrito();
  const lista = $("lista-carrito");
  const hayItems = carrito.length > 0;

  $("carrito-vacio").style.display = hayItems ? "none" : "block";
  $("resumen-carrito").style.display = hayItems ? "block" : "none";

  lista.innerHTML = "";
  if (!hayItems) return;

  carrito.forEach((item) => lista.appendChild(crearItemCarrito(item)));
  $("total-carrito").textContent = `$${formatearPrecio(calcularTotalCarrito())}`;
}

// Botón redondo +/− compartido por los controles de cantidad del carrito
function crearBotonCantidad(texto, onClick) {
  const btn = crearEl("button", "btn-cant-mini", texto);
  btn.addEventListener("click", onClick);
  return btn;
}

function crearItemCarrito(item) {
  const { id, nombre, precio, imagen, cantidad } = item;

  const img = document.createElement("img");
  img.src = imagen;
  img.alt = nombre;

  const info = crearEl("div", "item-info");
  info.append(
    crearEl("p", "item-nombre", nombre),
    crearEl("p", "item-precio-unitario", `$${formatearPrecio(precio)} c/u`)
  );

  const refrescar = (delta) => { cambiarCantidad(id, cantidad + delta); renderizarCarrito(); };
  const controles = crearEl("div", "item-controles");
  controles.append(
    crearBotonCantidad("−", () => refrescar(-1)),
    crearEl("span", "item-cantidad", String(cantidad)),
    crearBotonCantidad("+", () => refrescar(1))
  );

  const subtotal = crearEl("div", "item-subtotal", `$${formatearPrecio(precio * cantidad)}`);

  const btnQuitar = crearEl("button", "btn-quitar");
  btnQuitar.innerHTML = "🗑";
  btnQuitar.title = "Quitar del carrito";
  btnQuitar.addEventListener("click", () => abrirModalEliminar(item));

  const div = crearEl("div", "item-carrito");
  div.append(img, info, controles, subtotal, btnQuitar);
  return div;
}

/* ── Modal eliminar item individual ──────────────────────────────────────── */
function abrirModalEliminar(item) {
  idAEliminar = item.id;
  $("texto-eliminar").textContent = `Se quitará "${item.nombre}" del carrito.`;
  $("modal-eliminar").classList.add("activo");
}

const cerrarModalEliminar = () => { $("modal-eliminar").classList.remove("activo"); idAEliminar = null; };
const cerrarModalConfirmar = () => $("modal-confirmar").classList.remove("activo");

function configurarModales() {
  $("btn-confirmar-eliminar").addEventListener("click", () => {
    if (idAEliminar !== null) {
      quitarDelCarrito(idAEliminar);
      renderizarCarrito();
    }
    cerrarModalEliminar();
  });

  $("btn-confirmar-compra").addEventListener("click", finalizarCompra);
}

/* ── Finalizar compra → guarda venta y redirige a ticket ────────────────── */
function finalizarCompra() {
  const venta = {
    nombre_cliente: obtenerNombreCliente(),
    fecha: new Date().toISOString(),
    productos: obtenerCarrito(),
    total: calcularTotalCarrito(),
  };

  // Guardamos el ticket para que la pantalla de ticket lo lea
  localStorage.setItem("gamezone_ultimo_ticket", JSON.stringify(venta));

  // TODO: cuando se conecte al backend, acá va el fetch POST a /api/ventas

  vaciarCarrito();
  window.location.href = "ticket.html";
}

/* ════════════════════════════════════════════════════════════════════════
   PANTALLA: Ticket (ticket.html)
   ════════════════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  if (!$("ticket-wrapper")) return; // No estamos en ticket.html

  const ticketData = localStorage.getItem("gamezone_ultimo_ticket");
  if (!ticketData) {
    $("ticket-vacio").style.display = "block";
    $("ticket-wrapper").style.display = "none";
    return;
  }

  renderizarTicket(JSON.parse(ticketData));
  $("btn-descargar-pdf").addEventListener("click", descargarPDF);
  $("btn-nueva-compra").addEventListener("click", nuevaCompra);
});

function renderizarTicket(venta) {
  $("ticket-cliente").textContent = venta.nombre_cliente;

  const fecha = new Date(venta.fecha);
  $("ticket-fecha").textContent = fecha.toLocaleString("es-AR");
  $("ticket-numero").textContent = `#${fecha.getTime().toString().slice(-8)}`;

  const tbody = $("ticket-items");
  tbody.innerHTML = "";
  venta.productos.forEach(({ nombre, cantidad, precio }) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nombre}</td>
      <td>${cantidad}</td>
      <td>$${formatearPrecio(precio)}</td>
      <td>$${formatearPrecio(precio * cantidad)}</td>
    `;
    tbody.appendChild(tr);
  });

  $("ticket-total").textContent = `$${formatearPrecio(venta.total)}`;
}

function descargarPDF() {
  html2canvas($("ticket-contenido"), { scale: 2 }).then((canvas) => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    const anchoImg = 190;
    const altoImg = (canvas.height * anchoImg) / canvas.width;
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, anchoImg, altoImg);
    pdf.save("ticket-gamezone.pdf");
  });
}

function nuevaCompra() {
  // Reinicia el flujo completo: borra cliente, carrito y ticket
  localStorage.removeItem("gamezone_ultimo_ticket");
  limpiarSesionCliente();
  window.location.href = "index.html";
}
