const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LogSesion = sequelize.define('LogSesion', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  email:      { type: DataTypes.STRING, allowNull: false },
  fecha:      { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'log_sesiones',
  timestamps: false,
});

module.exports = LogSesion;
