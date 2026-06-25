/* ════════════════════════════════════════════════════════════════════════
   TEMA — Maneja el cambio entre tema claro / oscuro y lo persiste
   ════════════════════════════════════════════════════════════════════════ */

const CLAVE_TEMA = "gamezone_tema";

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-tema", tema);
  const btn = document.getElementById("btn-tema");
  if (btn) {
    btn.textContent = tema === "claro" ? "🌙" : "☀️";
  }
}

function inicializarTema() {
  const temaGuardado = localStorage.getItem(CLAVE_TEMA) || "oscuro";
  aplicarTema(temaGuardado);
}

function toggleTema() {
  const temaActual = localStorage.getItem(CLAVE_TEMA) || "oscuro";
  const nuevoTema = temaActual === "oscuro" ? "claro" : "oscuro";
  localStorage.setItem(CLAVE_TEMA, nuevoTema);
  aplicarTema(nuevoTema);
}

inicializarTema();

document.addEventListener("DOMContentLoaded", () => {
  const btnTema = document.getElementById("btn-tema");
  if (btnTema) {
    btnTema.addEventListener("click", toggleTema);
  }
});

/* ════════════════════════════════════════════════════════════════════════
   MÓDULO: Carrito (lógica centralizada con localStorage)
   ════════════════════════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════════════════════════
   CARRITO — Lógica centralizada usando localStorage
   Estructura guardada: [{ id, nombre, precio, imagen, cantidad }]
   ════════════════════════════════════════════════════════════════════════ */

const CLAVE_CARRITO = "gamezone_carrito";
const CLAVE_CLIENTE = "gamezone_cliente";

function obtenerCarrito() {
  const data = localStorage.getItem(CLAVE_CARRITO);
  return data ? JSON.parse(data) : [];
}

function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

function agregarAlCarrito(producto, cantidad = 1) {
  const carrito = obtenerCarrito();
  const existente = carrito.find((item) => item.id === producto.id);

  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad,
    });
  }

  guardarCarrito(carrito);
  actualizarBadgeCarrito();
}

function quitarDelCarrito(idProducto) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter((item) => item.id !== idProducto);
  guardarCarrito(carrito);
  actualizarBadgeCarrito();
}

function cambiarCantidad(idProducto, nuevaCantidad) {
  const carrito = obtenerCarrito();
  const item = carrito.find((i) => i.id === idProducto);
  if (!item) return;

  if (nuevaCantidad <= 0) {
    quitarDelCarrito(idProducto);
    return;
  }

  item.cantidad = nuevaCantidad;
  guardarCarrito(carrito);
  actualizarBadgeCarrito();
}

function calcularTotalCarrito() {
  return obtenerCarrito().reduce((acc, item) => acc + item.precio * item.cantidad, 0);
}

function contarItemsCarrito() {
  return obtenerCarrito().reduce((acc, item) => acc + item.cantidad, 0);
}

function vaciarCarrito() {
  localStorage.removeItem(CLAVE_CARRITO);
  actualizarBadgeCarrito();
}


function actualizarBadgeCarrito() {
  const badge = document.getElementById("badge-carrito");
  if (badge) {
    const total = contarItemsCarrito();
    badge.textContent = total;
    badge.style.display = total > 0 ? "inline-block" : "none";
  }
}

function guardarNombreCliente(nombre) {
  localStorage.setItem(CLAVE_CLIENTE, nombre);
}

function obtenerNombreCliente() {
  return localStorage.getItem(CLAVE_CLIENTE) || "";
}

function limpiarSesionCliente() {
  localStorage.removeItem(CLAVE_CLIENTE);
  vaciarCarrito();
}

function formatearPrecio(valor) {
  return valor.toLocaleString("es-AR", { minimumFractionDigits: 0 });
}

document.addEventListener("DOMContentLoaded", actualizarBadgeCarrito);

/* ════════════════════════════════════════════════════════════════════════
   PANTALLA: Bienvenida (index.html)
   ════════════════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-bienvenida");
  if (!form) return; // No estamos en index.html, no hacemos nada

  // Si ya hay un nombre guardado, lo precargamos (por si vuelve atrás)
  const nombreGuardado = obtenerNombreCliente();
  if (nombreGuardado) {
    document.getElementById("nombre").value = nombreGuardado;
  }

  const inputNombre = document.getElementById("nombre");
  const errorMsg = document.getElementById("error-nombre");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = inputNombre.value.trim();

    if (nombre.length < 2) {
      inputNombre.classList.add("input-error");
      errorMsg.textContent = "Ingresá un nombre válido (mínimo 2 letras).";
      return;
    }

    inputNombre.classList.remove("input-error");
    errorMsg.textContent = "";

    guardarNombreCliente(nombre);
    window.location.href = "productos.html";
  });

  inputNombre.addEventListener("input", () => {
    inputNombre.classList.remove("input-error");
    errorMsg.textContent = "";
  });
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
  const grid = document.getElementById("grid-productos");
  if (!grid) return; // No estamos en productos.html

  // Si no hay nombre de cliente, lo mandamos de vuelta a bienvenida
  const nombre = obtenerNombreCliente();
  if (!nombre) {
    window.location.href = "index.html";
    return;
  }
  document.getElementById("nombre-cliente").textContent = nombre;

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
  const activos = PRODUCTOS_CACHE.filter((p) => p.activo);
  return categoriaActual === "todos" ? activos : activos.filter((p) => p.categoria === categoriaActual);
}

function renderizarProductos() {
  const productos = obtenerProductosFiltrados();
  const totalPaginas = Math.ceil(productos.length / PRODUCTOS_POR_PAGINA) || 1;

  if (paginaActual > totalPaginas) paginaActual = totalPaginas;

  const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
  const paginaProductos = productos.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);

  const grid = document.getElementById("grid-productos");
  grid.innerHTML = "";

  if (paginaProductos.length === 0) {
    grid.innerHTML = `<p class="sin-productos">No hay productos disponibles en esta categoría.</p>`;
  } else {
    paginaProductos.forEach((producto) => {
      grid.appendChild(crearCardProducto(producto));
    });
  }

  renderizarPaginacion(totalPaginas);
}

function crearCardProducto(producto) {
  const card = document.createElement("div");
  card.classList.add("producto-card");

  const imgWrapper = document.createElement("div");
  imgWrapper.classList.add("producto-img-wrapper");
  const img = document.createElement("img");
  //img.src = producto.imagen;
  img.src = `/uploads/${producto.imagen}`;
  img.alt = producto.nombre;
  img.loading = "lazy";
  imgWrapper.appendChild(img);

  const info = document.createElement("div");
  info.classList.add("producto-info");

  const tag = document.createElement("span");
  tag.classList.add("producto-categoria-tag");
  tag.textContent = producto.categoria;

  const nombre = document.createElement("h3");
  nombre.classList.add("producto-nombre");
  nombre.textContent = producto.nombre;

  const desc = document.createElement("p");
  desc.classList.add("producto-desc");
  desc.textContent = producto.descripcion;

  const precio = document.createElement("p");
  precio.classList.add("producto-precio");
  precio.textContent = `$${formatearPrecio(producto.precio)}`;

  const btnAgregar = document.createElement("button");
  btnAgregar.classList.add("btn", "btn-primary");
  btnAgregar.textContent = "Agregar al carrito";
  btnAgregar.addEventListener("click", () => abrirModalCantidad(producto));

  info.append(tag, nombre, desc, precio, btnAgregar);
  card.append(imgWrapper, info);

  return card;
}

function renderizarPaginacion(totalPaginas) {
  const cont = document.getElementById("paginacion");
  cont.innerHTML = "";

  if (totalPaginas <= 1) return;

  const btnAnterior = document.createElement("button");
  btnAnterior.classList.add("pagina-btn");
  btnAnterior.textContent = "‹";
  btnAnterior.disabled = paginaActual === 1;
  btnAnterior.addEventListener("click", () => {
    paginaActual--;
    renderizarProductos();
  });
  cont.appendChild(btnAnterior);

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.classList.add("pagina-btn");
    if (i === paginaActual) btn.classList.add("activo");
    btn.textContent = i;
    btn.addEventListener("click", () => {
      paginaActual = i;
      renderizarProductos();
    });
    cont.appendChild(btn);
  }

  const btnSiguiente = document.createElement("button");
  btnSiguiente.classList.add("pagina-btn");
  btnSiguiente.textContent = "›";
  btnSiguiente.disabled = paginaActual === totalPaginas;
  btnSiguiente.addEventListener("click", () => {
    paginaActual++;
    renderizarProductos();
  });
  cont.appendChild(btnSiguiente);
}

/* ── Modal de selección de cantidad ────────────────────────────────────────── */
function configurarModalCantidad() {
  document.getElementById("btn-restar").addEventListener("click", () => {
    if (cantidadSeleccionada > 1) {
      cantidadSeleccionada--;
      document.getElementById("cantidad-valor").textContent = cantidadSeleccionada;
    }
  });

  document.getElementById("btn-sumar").addEventListener("click", () => {
    cantidadSeleccionada++;
    document.getElementById("cantidad-valor").textContent = cantidadSeleccionada;
  });

  document.getElementById("btn-confirmar-agregar").addEventListener("click", () => {
    if (productoSeleccionado) {
      agregarAlCarrito(productoSeleccionado, cantidadSeleccionada);
      cerrarModalCantidad();
    }
  });
}

function abrirModalCantidad(producto) {
  productoSeleccionado = producto;
  cantidadSeleccionada = 1;
  document.getElementById("cantidad-valor").textContent = "1";
  document.getElementById("modal-cantidad-titulo").textContent = producto.nombre;
  document.getElementById("modal-cantidad").classList.add("activo");
}

function cerrarModalCantidad() {
  document.getElementById("modal-cantidad").classList.remove("activo");
  productoSeleccionado = null;
}

/* ════════════════════════════════════════════════════════════════════════
   PANTALLA: Carrito (carrito.html)
   ════════════════════════════════════════════════════════════════════════ */

let idAEliminar = null;

document.addEventListener("DOMContentLoaded", async () => {
  const grid = $("grid-productos");
  if (!grid) return;

  const nombre = obtenerNombreCliente();
  if (!nombre) return (window.location.href = "index.html");
  $("nombre-cliente").textContent = nombre;

  await cargarProductosDesdeAPI(); // ← primero carga desde API
  configurarTabs();
  configurarModalCantidad();
  renderizarProductos();
});

  renderizarCarrito();
  configurarModales();

  document.getElementById("btn-finalizar").addEventListener("click", () => {
    if (obtenerCarrito().length === 0) return;
    document.getElementById("modal-confirmar").classList.add("activo");
  });


function renderizarCarrito() {
  const carrito = obtenerCarrito();
  const lista = document.getElementById("lista-carrito");
  const vacio = document.getElementById("carrito-vacio");
  const resumen = document.getElementById("resumen-carrito");

  lista.innerHTML = "";

  if (carrito.length === 0) {
    vacio.style.display = "block";
    resumen.style.display = "none";
    return;
  }

  vacio.style.display = "none";
  resumen.style.display = "block";

  carrito.forEach((item) => {
    lista.appendChild(crearItemCarrito(item));
  });

  document.getElementById("total-carrito").textContent = `$${formatearPrecio(calcularTotalCarrito())}`;
}

function crearItemCarrito(item) {
  const div = document.createElement("div");
  div.classList.add("item-carrito");

  const img = document.createElement("img");
  img.src = item.imagen;
  img.alt = item.nombre;

  const info = document.createElement("div");
  info.classList.add("item-info");
  const nombre = document.createElement("p");
  nombre.classList.add("item-nombre");
  nombre.textContent = item.nombre;
  const precioUnit = document.createElement("p");
  precioUnit.classList.add("item-precio-unitario");
  precioUnit.textContent = `$${formatearPrecio(item.precio)} c/u`;
  info.append(nombre, precioUnit);

  const controles = document.createElement("div");
  controles.classList.add("item-controles");

  const btnMenos = document.createElement("button");
  btnMenos.classList.add("btn-cant-mini");
  btnMenos.textContent = "−";
  btnMenos.addEventListener("click", () => {
    cambiarCantidad(item.id, item.cantidad - 1);
    renderizarCarrito();
  });

  const cantidadSpan = document.createElement("span");
  cantidadSpan.classList.add("item-cantidad");
  cantidadSpan.textContent = item.cantidad;

  const btnMas = document.createElement("button");
  btnMas.classList.add("btn-cant-mini");
  btnMas.textContent = "+";
  btnMas.addEventListener("click", () => {
    cambiarCantidad(item.id, item.cantidad + 1);
    renderizarCarrito();
  });

  controles.append(btnMenos, cantidadSpan, btnMas);

  const subtotal = document.createElement("div");
  subtotal.classList.add("item-subtotal");
  subtotal.textContent = `$${formatearPrecio(item.precio * item.cantidad)}`;

  const btnQuitar = document.createElement("button");
  btnQuitar.classList.add("btn-quitar");
  btnQuitar.innerHTML = "🗑";
  btnQuitar.title = "Quitar del carrito";
  btnQuitar.addEventListener("click", () => abrirModalEliminar(item));

  div.append(img, info, controles, subtotal, btnQuitar);
  return div;
}

/* ── Modal eliminar item individual ──────────────────────────────────────── */
function abrirModalEliminar(item) {
  idAEliminar = item.id;
  document.getElementById("texto-eliminar").textContent = `Se quitará "${item.nombre}" del carrito.`;
  document.getElementById("modal-eliminar").classList.add("activo");
}

function cerrarModalEliminar() {
  document.getElementById("modal-eliminar").classList.remove("activo");
  idAEliminar = null;
}

function cerrarModalConfirmar() {
  document.getElementById("modal-confirmar").classList.remove("activo");
}

function configurarModales() {
  document.getElementById("btn-confirmar-eliminar").addEventListener("click", () => {
    if (idAEliminar !== null) {
      quitarDelCarrito(idAEliminar);
      renderizarCarrito();
    }
    cerrarModalEliminar();
  });

  document.getElementById("btn-confirmar-compra").addEventListener("click", finalizarCompra);
}

/* ── Finalizar compra → guarda venta y redirige a ticket ────────────────── */
async function finalizarCompra() {
  const carrito = obtenerCarrito();
  const nombre_cliente = obtenerNombreCliente();

  const venta = {
    nombre_cliente,
    fecha: new Date().toISOString(),
    productos: carrito,
    total: calcularTotalCarrito(),
  };

  // Guardar ticket local para mostrarlo en ticket.html
  localStorage.setItem("gamezone_ultimo_ticket", JSON.stringify(venta));

  // Enviar venta al backend
  try {
    await fetch('/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_cliente,
        productos: carrito.map(p => ({
          id: p.id,
          cantidad: p.cantidad,
          precio_unitario: p.precio
        }))
      })
    });
  } catch (error) {
    console.error('Error al guardar venta:', error);
  }

  vaciarCarrito();
  window.location.href = "ticket.html";
}

/* ════════════════════════════════════════════════════════════════════════
   PANTALLA: Ticket (ticket.html)
   ════════════════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  const ticketWrapper = document.getElementById("ticket-wrapper");
  if (!ticketWrapper) return; // No estamos en ticket.html

  const ticketData = localStorage.getItem("gamezone_ultimo_ticket");

  if (!ticketData) {
    document.getElementById("ticket-vacio").style.display = "block";
    document.getElementById("ticket-wrapper").style.display = "none";
    return;
  }

  const venta = JSON.parse(ticketData);
  renderizarTicket(venta);

  document.getElementById("btn-descargar-pdf").addEventListener("click", descargarPDF);
  document.getElementById("btn-nueva-compra").addEventListener("click", nuevaCompra);
});

function renderizarTicket(venta) {
  document.getElementById("ticket-cliente").textContent = venta.nombre_cliente;

  const fecha = new Date(venta.fecha);
  document.getElementById("ticket-fecha").textContent = fecha.toLocaleString("es-AR");

  // Número de ticket simple basado en timestamp
  document.getElementById("ticket-numero").textContent = `#${fecha.getTime().toString().slice(-8)}`;

  const tbody = document.getElementById("ticket-items");
  tbody.innerHTML = "";

  venta.productos.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.nombre}</td>
      <td>${item.cantidad}</td>
      <td>$${formatearPrecio(item.precio)}</td>
      <td>$${formatearPrecio(item.precio * item.cantidad)}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("ticket-total").textContent = `$${formatearPrecio(venta.total)}`;
}

function descargarPDF() {
  const elemento = document.getElementById("ticket-contenido");

  html2canvas(elemento, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    const anchoImg = 190;
    const altoImg = (canvas.height * anchoImg) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, anchoImg, altoImg);
    pdf.save("ticket-gamezone.pdf");
  });
}

function nuevaCompra() {
  // Reinicia el flujo completo: borra cliente, carrito y ticket
  localStorage.removeItem("gamezone_ultimo_ticket");
  limpiarSesionCliente();
  window.location.href = "index.html";
}
