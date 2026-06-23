const { DataTypes } = require('sequelize');
const { sequelize } = require('./config/database');

/* ════════════════════════════════════════════════════════════════════════
   MODELO: Usuario (administradores del sistema)
   ════════════════════════════════════════════════════════════════════════ */
const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: { type: DataTypes.STRING, allowNull: false },
  nombre: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: 'usuarios',
  timestamps: true,
});

/* ════════════════════════════════════════════════════════════════════════
   MODELO: Producto (juegos y accesorios)
   ════════════════════════════════════════════════════════════════════════ */
const Producto = sequelize.define('Producto', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  imagen: { type: DataTypes.STRING, allowNull: true, defaultValue: 'default.jpg' },
  categoria: { type: DataTypes.ENUM('juegos', 'accesorios'), allowNull: false },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'productos',
  timestamps: true,
});

/* ════════════════════════════════════════════════════════════════════════
   MODELO: Venta (registro de compras realizadas por clientes)
   ════════════════════════════════════════════════════════════════════════ */
const Venta = sequelize.define('Venta', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_cliente: { type: DataTypes.STRING, allowNull: false },
  precio_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'ventas',
  timestamps: true,
});

/* ════════════════════════════════════════════════════════════════════════
   MODELO: VentaProducto (tabla intermedia N:M entre Venta y Producto)
   ════════════════════════════════════════════════════════════════════════ */
const VentaProducto = sequelize.define('VentaProducto', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: { min: 1 },
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    // Se guarda el precio al momento de la compra (por si cambia después)
  },
}, {
  tableName: 'venta_productos',
  timestamps: false,
});

/* ════════════════════════════════════════════════════════════════════════
   ASOCIACIONES
   ════════════════════════════════════════════════════════════════════════ */

// Relación N:M entre Venta y Producto a través de VentaProducto
Venta.belongsToMany(Producto, {
  through: VentaProducto,
  foreignKey: 'venta_id',
  otherKey: 'producto_id',
});

Producto.belongsToMany(Venta, {
  through: VentaProducto,
  foreignKey: 'producto_id',
  otherKey: 'venta_id',
});

// Acceso directo a la tabla intermedia
Venta.hasMany(VentaProducto, { foreignKey: 'venta_id' });
VentaProducto.belongsTo(Venta, { foreignKey: 'venta_id' });

Producto.hasMany(VentaProducto, { foreignKey: 'producto_id' });
VentaProducto.belongsTo(Producto, { foreignKey: 'producto_id' });

module.exports = { Usuario, Producto, Venta, VentaProducto };
