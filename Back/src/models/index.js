const Usuario       = require('./Usuario');
const Producto      = require('./Producto');
const Venta         = require('./Venta');
const VentaProducto = require('./VentaProducto');
const LogSesion     = require('./LogSesion');
const Encuesta      = require('./Encuesta');

// Relación N:M entre Venta y Producto
Venta.belongsToMany(Producto, { through: VentaProducto, foreignKey: 'venta_id', otherKey: 'producto_id' });
Producto.belongsToMany(Venta, { through: VentaProducto, foreignKey: 'producto_id', otherKey: 'venta_id' });

// Acceso directo a la tabla intermedia
Venta.hasMany(VentaProducto,       { foreignKey: 'venta_id' });
VentaProducto.belongsTo(Venta,     { foreignKey: 'venta_id' });
Producto.hasMany(VentaProducto,    { foreignKey: 'producto_id' });
VentaProducto.belongsTo(Producto,  { foreignKey: 'producto_id' });

// LogSesion → Usuario
LogSesion.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Usuario.hasMany(LogSesion,   { foreignKey: 'usuario_id' });

// Venta → Encuesta (una encuesta puede estar asociada a una venta puntual)
Venta.hasOne(Encuesta,    { foreignKey: 'venta_id' });
Encuesta.belongsTo(Venta, { foreignKey: 'venta_id' });

module.exports = { Usuario, Producto, Venta, VentaProducto, LogSesion, Encuesta };
