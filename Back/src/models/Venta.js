const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Venta = sequelize.define('Venta', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_cliente: { type: DataTypes.STRING, allowNull: false },
  precio_total:   { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
  fecha:          { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'ventas',
  timestamps: true,
});

module.exports = Venta;
