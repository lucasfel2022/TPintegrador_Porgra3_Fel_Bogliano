/* ════════════════════════════════════════════════════════════════════════
   SEED — Carga productos de prueba en la base de datos.

   Uso: node src/seeders/seedProductos.js

   Sirve para que cualquiera de los dos integrantes pueda generar rápido
   los mismos datos de prueba en su PC, sin tipear todo a mano desde el
   panel admin. Si un producto con el mismo nombre ya existe, no lo
   duplica (podés correr el script varias veces sin problema).

   IMPORTANTE: las imágenes referenciadas abajo deben existir físicamente
   en Back/uploads/ con el nombre EXACTO indicado en cada producto
   (mismas mayúsculas/minúsculas y espacios).
   ════════════════════════════════════════════════════════════════════════ */

require('dotenv').config();
const { sequelize, conectarDB } = require('../../database');
const { Producto } = require('../../models');

const PRODUCTOS_SEED = [
  // ── JUEGOS ────────────────────────────────────────────────────────────
  {
    nombre: 'FIFA 25',
    descripcion: 'Edición estándar para PS5 y Xbox Series X',
    precio: 54999,
    categoria: 'juegos',
    imagen: 'FIFA 25.jpg',
    activo: true,
  },
  {
    nombre: 'Elden Ring',
    descripcion: 'Juego base + DLC Shadow of the Erdtree',
    precio: 59999,
    categoria: 'juegos',
    imagen: 'Elden Ring.jpg',
    activo: true,
  },
  {
    nombre: 'God of War Ragnarök',
    descripcion: 'Edición estándar PS5',
    precio: 49999,
    categoria: 'juegos',
    imagen: 'God of War Ragnarok.jpg',
    activo: true,
  },
  {
    nombre: 'Call of Duty: Modern Warfare III',
    descripcion: 'Edición estándar multiplataforma',
    precio: 57999,
    categoria: 'juegos',
    imagen: 'Call of Duty Modern Warfare III.jpg',
    activo: true,
  },
  {
    nombre: 'Minecraft',
    descripcion: 'Edición estándar para PC',
    precio: 25999,
    categoria: 'juegos',
    imagen: 'Minecraft.jpg',
    activo: true,
  },
  {
    nombre: 'Red Dead Redemption 2',
    descripcion: 'Edición estándar multiplataforma',
    precio: 39999,
    categoria: 'juegos',
    imagen: 'Red Dead Redemption 2.jpg',
    activo: true,
  },
  {
    nombre: "Spider-Man 2",
    descripcion: 'Edición exclusiva PS5',
    precio: 52999,
    categoria: 'juegos',
    imagen: 'Spider-Man 2.jpg',
    activo: false, // a propósito inactivo, para poder probar el filtro
  },
  {
    nombre: 'The Last of Us Part II',
    descripcion: 'Edición estándar PS5',
    precio: 45999,
    categoria: 'juegos',
    imagen: 'The Last of Us Part II.jpg',
    activo: true,
  },

  // ── ACCESORIOS ──────────────────────────────────────────────────────────
  {
    nombre: 'Control DualSense PS5',
    descripcion: 'Joystick inalámbrico PS5, varios colores',
    precio: 64999,
    categoria: 'accesorios',
    imagen: 'Control DualSense PS5.jpg',
    activo: true,
  },
  {
    nombre: 'Mouse Logitech G502 Hero',
    descripcion: 'Sensor óptico de alta precisión, 11 botones',
    precio: 29999,
    categoria: 'accesorios',
    imagen: 'Mouse Logitech G502 Hero.jpg',
    activo: true,
  },
  {
    nombre: 'Teclado Mecánico Redragon K552',
    descripcion: 'Switches azules, retroiluminado',
    precio: 38999,
    categoria: 'accesorios',
    imagen: 'Teclado Mecánico Redragon K552.jpg',
    activo: true,
  },
  {
    nombre: 'Monitor Samsung 144Hz',
    descripcion: 'Monitor gamer Full HD, 144Hz de refresco',
    precio: 219999,
    categoria: 'accesorios',
    imagen: 'Monitor Samsung 144Hz.jpg',
    activo: true,
  },
  {
    nombre: 'Silla Gamer DXRacer',
    descripcion: 'Reclinable, soporte lumbar incluido',
    precio: 189999,
    categoria: 'accesorios',
    imagen: 'Silla Gamer DXRacer.jpg',
    activo: true,
  },
  {
    nombre: 'Mousepad XL RGB',
    descripcion: '90x40cm, iluminación LED',
    precio: 18999,
    categoria: 'accesorios',
    imagen: 'Mousepad XL RGB.jpg',
    activo: true,
  },
];

async function correrSeed() {
  await conectarDB();
  await sequelize.sync(); // crea las tablas si no existen, sin tocar datos existentes

  console.log('🌱 Cargando productos de prueba...\n');

  let creados = 0;
  let saltados = 0;

  for (const datosProducto of PRODUCTOS_SEED) {
    const existente = await Producto.findOne({ where: { nombre: datosProducto.nombre } });

    if (existente) {
      console.log(`⏭️  Ya existe: "${datosProducto.nombre}" (no se duplica)`);
      saltados++;
      continue;
    }

    await Producto.create(datosProducto);
    console.log(`✅ Creado: "${datosProducto.nombre}" — $${datosProducto.precio} (${datosProducto.categoria})`);
    creados++;
  }

  console.log(`\n🎉 Listo. ${creados} producto(s) creado(s), ${saltados} ya existían.`);
  console.log('\n⚠️  Recordá: las imágenes deben existir en Back/uploads/ con el nombre exacto indicado.');
  process.exit(0);
}

correrSeed().catch((error) => {
  console.error('❌ Error al correr el seed:', error);
  process.exit(1);
});