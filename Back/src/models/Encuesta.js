const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Encuesta = sequelize.define('Encuesta', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  venta_id:      { type: DataTypes.INTEGER, allowNull: true },
  opinion:       { type: DataTypes.TEXT, allowNull: false, validate: { len: [10, 1000] } },
  email:         { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
  acepta_contacto: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  puntuacion:    { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 10 } },
  imagen:        { type: DataTypes.STRING, allowNull: true },
  fecha:         { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'encuestas',
  timestamps: true,
});

module.exports = Encuesta;
