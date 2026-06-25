/* ════════════════════════════════════════════════════════════════════════
   SEED — Carga productos de prueba en la base de datos.

   Uso: node src/seeders/seedProductos.js

   Sirve para que cualquiera de los dos integrantes pueda generar rápido
   los mismos datos de prueba en su PC, sin tipear todo a mano desde el
   panel admin. Si un producto con el mismo nombre ya existe, no lo
   duplica (podés correr el script varias veces sin problema).
   ════════════════════════════════════════════════════════════════════════ */

require('dotenv').config();
const { sequelize, conectarDB } = require('../config/database');
const { Producto } = require('../models');

const PRODUCTOS_SEED = [
  // ── JUEGOS ────────────────────────────────────────────────────────────
  {
    nombre: 'FIFA 26',
    descripcion: 'Edición estándar para PS5 y Xbox Series X',
    precio: 54999,
    categoria: 'juegos',
    imagen: 'default.jpg',
    activo: true,
  },
  {
    nombre: 'The Legend of Zelda: Tears of the Kingdom',
    descripcion: 'Edición física para Nintendo Switch',
    precio: 64999,
    categoria: 'juegos',
    imagen: 'default.jpg',
    activo: true,
  },
  {
    nombre: 'God of War Ragnarök',
    descripcion: 'Edición estándar PS5',
    precio: 49999,
    categoria: 'juegos',
    imagen: 'default.jpg',
    activo: true,
  },
  {
    nombre: 'Elden Ring',
    descripcion: 'Juego base + DLC Shadow of the Erdtree',
    precio: 59999,
    categoria: 'juegos',
    imagen: 'default.jpg',
    activo: true,
  },
  {
    nombre: 'Mario Kart 8 Deluxe',
    descripcion: 'Para Nintendo Switch, incluye pase de circuitos',
    precio: 47999,
    categoria: 'juegos',
    imagen: 'default.jpg',
    activo: true,
  },
  {
    nombre: 'Call of Duty: Black Ops 6',
    descripcion: 'Edición estándar multiplataforma',
    precio: 57999,
    categoria: 'juegos',
    imagen: 'default.jpg',
    activo: true,
  },
  {
    nombre: 'Spider-Man 2',
    descripcion: 'Edición exclusiva PS5',
    precio: 52999,
    categoria: 'juegos',
    imagen: 'default.jpg',
    activo: false, // a propósito inactivo, para poder probar el filtro
  },
  {
    nombre: 'Hollow Knight: Silksong',
    descripcion: 'Edición física multiplataforma',
    precio: 38999,
    categoria: 'juegos',
    imagen: 'default.jpg',
    activo: true,
  },

  // ── ACCESORIOS ──────────────────────────────────────────────────────────
  {
    nombre: 'Control DualSense',
    descripcion: 'Joystick inalámbrico PS5, varios colores',
    precio: 64999,
    categoria: 'accesorios',
    imagen: 'default.jpg',
    activo: true,
  },
  {
    nombre: 'Auriculares Gamer HyperX Cloud',
    descripcion: 'Sonido envolvente 7.1, micrófono desmontable',
    precio: 45999,
    categoria: 'accesorios',
    imagen: 'default.jpg',
    activo: true,
  },
  {
    nombre: 'Teclado Mecánico RGB',
    descripcion: 'Switches azules, retroiluminado',
    precio: 38999,
    categoria: 'accesorios',
    imagen: 'default.jpg',
    activo: true,
  },
  {
    nombre: 'Mouse Gamer Logitech G502',
    descripcion: 'Sensor óptico de alta precisión, 11 botones',
    precio: 29999,
    categoria: 'accesorios',
    imagen: 'default.jpg',
    activo: true,
  },
  {
    nombre: 'Silla Gamer ergonómica',
    descripcion: 'Reclinable, soporte lumbar incluido',
    precio: 189999,
    categoria: 'accesorios',
    imagen: 'default.jpg',
    activo: true,
  },
  {
    nombre: 'Volante Logitech G29',
    descripcion: 'Force feedback, compatible PS5/PC',
    precio: 159999,
    categoria: 'accesorios',
    imagen: 'default.jpg',
    activo: true,
  },
  {
    nombre: 'Mochila Gamer',
    descripcion: 'Compartimento acolchado para notebook',
    precio: 24999,
    categoria: 'accesorios',
    imagen: 'default.jpg',
    activo: false, // a propósito inactivo
  },
  {
    nombre: 'Mousepad XXL RGB',
    descripcion: '90x40cm, iluminación LED',
    precio: 18999,
    categoria: 'accesorios',
    imagen: 'default.jpg',
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
  process.exit(0);
}

correrSeed().catch((error) => {
  console.error('❌ Error al correr el seed:', error);
  process.exit(1);
});
