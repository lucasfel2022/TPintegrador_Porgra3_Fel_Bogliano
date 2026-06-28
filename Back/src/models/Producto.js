const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Producto = sequelize.define('Producto', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre:      { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  precio:      { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
  imagen:      { type: DataTypes.STRING, allowNull: true, defaultValue: 'default.jpg' },
  categoria:   { type: DataTypes.ENUM('juegos', 'accesorios'), allowNull: false },
  activo:      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'productos',
  timestamps: true,
});

module.exports = Producto;
