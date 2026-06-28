const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VentaProducto = sequelize.define('VentaProducto', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cantidad:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { min: 1 } },
  precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
  tableName: 'venta_productos',
  timestamps: false,
});

module.exports = VentaProducto;
