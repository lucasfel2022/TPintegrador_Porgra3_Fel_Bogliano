// productos.js — ahora trae los datos desde la API
let PRODUCTOS_CACHE = [];

async function cargarProductosDesdeAPI() {
  try {
    const res = await fetch('/api/productos?activo=true&limit=100');
    const data = await res.json();
    PRODUCTOS_CACHE = data.productos || data || [];
  } catch (error) {
    console.error('Error cargando productos:', error);
    PRODUCTOS_CACHE = [];
  }
}