const express = require('express');
const bcrypt = require('bcrypt');
const { sequelize } = require('./database');
const { Usuario, Producto, Venta, VentaProducto, LogSesion } = require('./models');
const { productoController, ventaController, usuarioController } = require('./controllers');
const { authMiddleware, upload, validarProducto, validarVenta, validarUsuario } = require('./middlewares');

/* ════════════════════════════════════════════════════════════════════════
  RUTAS API — /api/productos
   ════════════════════════════════════════════════════════════════════════ */
const routerProductos = express.Router();
routerProductos.get('/', productoController.listar);
routerProductos.get('/:id', productoController.obtenerPorId);
routerProductos.post('/', upload.single('imagen'), validarProducto, productoController.crear);
routerProductos.put('/:id', upload.single('imagen'), validarProducto, productoController.actualizar);
routerProductos.patch('/:id/estado', productoController.cambiarEstado);

/* ════════════════════════════════════════════════════════════════════════
  RUTAS API — /api/ventas
   ════════════════════════════════════════════════════════════════════════ */
const routerVentas = express.Router();
routerVentas.get('/', ventaController.listar);
routerVentas.post('/', validarVenta, ventaController.crear);

/* ════════════════════════════════════════════════════════════════════════
  RUTAS API — /api/usuarios
   ════════════════════════════════════════════════════════════════════════ */
const routerUsuarios = express.Router();
routerUsuarios.post('/', validarUsuario, usuarioController.crear);

/* ════════════════════════════════════════════════════════════════════════
  RUTAS VISTAS — /admin (login, dashboard, alta/edición de productos)
   ════════════════════════════════════════════════════════════════════════ */
const routerAdmin = express.Router();

// GET /admin/login
routerAdmin.get('/login', (req, res) => {
  if (req.session.usuarioId) return res.redirect('/admin/dashboard');
  res.render('login', { error: null });
});

// POST /admin/login
routerAdmin.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.render('login', { error: 'Email o contraseña incorrectos' });
    }

    req.session.usuarioId = usuario.id;
    req.session.usuarioNombre = usuario.nombre;

    await LogSesion.create({ usuario_id: usuario.id, email: usuario.email });

    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    res.render('login', { error: 'Error interno, intentá de nuevo' });
  }
});

// GET /admin/logout
routerAdmin.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// GET /admin/dashboard
routerAdmin.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const productos = await Producto.findAll({ order: [['categoria', 'ASC'], ['nombre', 'ASC']] });
    res.render('dashboard', { productos, usuario: req.session.usuarioNombre });
  } catch (error) {
    console.error(error);
    res.render('dashboard', { productos: [], usuario: req.session.usuarioNombre });
  }
});

// GET /admin/productos/nuevo
routerAdmin.get('/productos/nuevo', authMiddleware, (req, res) => {
  res.render('producto-form', { producto: null, error: null });
});

// POST /admin/productos/nuevo
routerAdmin.post('/productos/nuevo', authMiddleware, upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria } = req.body;
    const imagen = req.file ? req.file.filename : 'default.jpg';
    await Producto.create({ nombre, descripcion, precio, categoria, imagen });
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    res.render('producto-form', { producto: null, error: 'Error al crear el producto' });
  }
});

// GET /admin/productos/:id/editar
routerAdmin.get('/productos/:id/editar', authMiddleware, async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.redirect('/admin/dashboard');
    res.render('producto-form', { producto, error: null });
  } catch (error) {
    res.redirect('/admin/dashboard');
  }
});

// POST /admin/productos/:id/editar
routerAdmin.post('/productos/:id/editar', authMiddleware, upload.single('imagen'), async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.redirect('/admin/dashboard');

    const { nombre, descripcion, precio, categoria } = req.body;
    const imagen = req.file ? req.file.filename : producto.imagen;
    await producto.update({ nombre, descripcion, precio, categoria, imagen });
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    res.redirect('/admin/dashboard');
  }
});

// POST /admin/productos/:id/estado
routerAdmin.post('/productos/:id/estado', authMiddleware, async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (producto) await producto.update({ activo: !producto.activo });
    res.redirect('/admin/dashboard');
  } catch (error) {
    res.redirect('/admin/dashboard');
  }
});

// GET /admin/registros
routerAdmin.get('/registros', authMiddleware, async (req, res) => {
  try {
    const topProductos = await VentaProducto.findAll({
      attributes: [
        'producto_id',
        [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_vendido']
      ],
      include: [{ model: Producto, attributes: ['nombre', 'categoria'] }],
      group: ['producto_id', 'Producto.id'],
      order: [[sequelize.literal('total_vendido'), 'DESC']],
      limit: 10
    });

    const topVentas = await Venta.findAll({
      order: [['precio_total', 'DESC']],
      limit: 10
    });

    const logs = await LogSesion.findAll({
      order: [['fecha', 'DESC']],
      limit: 20
    });

    res.render('registros', { topProductos, topVentas, logs, usuario: req.session.usuarioNombre });
  } catch (error) {
    console.error(error);
    res.render('registros', { topProductos: [], topVentas: [], logs: [], usuario: req.session.usuarioNombre });
  }
});

// GET /admin/registros/excel
routerAdmin.get('/registros/excel', authMiddleware, async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();

    // Hoja 1 — Top productos más vendidos
    const hoja1 = workbook.addWorksheet('Top Productos');
    hoja1.columns = [
      { header: '#', key: 'num', width: 5 },
      { header: 'Producto', key: 'nombre', width: 30 },
      { header: 'Categoría', key: 'categoria', width: 15 },
      { header: 'Unidades vendidas', key: 'total', width: 20 },
    ];
    const topProductos = await VentaProducto.findAll({
      attributes: ['producto_id', [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_vendido']],
      include: [{ model: Producto, attributes: ['nombre', 'categoria'] }],
      group: ['producto_id', 'Producto.id'],
      order: [[sequelize.literal('total_vendido'), 'DESC']],
      limit: 10
    });
    topProductos.forEach((item, i) => {
      hoja1.addRow({
        num: i + 1,
        nombre: item.Producto ? item.Producto.nombre : 'N/A',
        categoria: item.Producto ? item.Producto.categoria : 'N/A',
        total: item.dataValues.total_vendido
      });
    });

    // Hoja 2 — Top ventas más caras
    const hoja2 = workbook.addWorksheet('Top Ventas');
    hoja2.columns = [
      { header: '#', key: 'num', width: 5 },
      { header: 'Cliente', key: 'cliente', width: 25 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Fecha', key: 'fecha', width: 25 },
    ];
    const topVentas = await Venta.findAll({
      order: [['precio_total', 'DESC']],
      limit: 10
    });
    topVentas.forEach((venta, i) => {
      hoja2.addRow({
        num: i + 1,
        cliente: venta.nombre_cliente,
        total: Number(venta.precio_total),
        fecha: new Date(venta.fecha).toLocaleString('es-AR')
      });
    });

    // Hoja 3 — LOG de sesiones
    const hoja3 = workbook.addWorksheet('LOG Sesiones');
    hoja3.columns = [
      { header: '#', key: 'num', width: 5 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Fecha', key: 'fecha', width: 25 },
    ];
    const logs = await LogSesion.findAll({
      order: [['fecha', 'DESC']],
      limit: 20
    });
    logs.forEach((log, i) => {
      hoja3.addRow({
        num: i + 1,
        email: log.email,
        fecha: new Date(log.fecha).toLocaleString('es-AR')
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=registros-gamezone.xlsx');
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al generar el Excel');
  }
});

module.exports = { routerProductos, routerVentas, routerUsuarios, routerAdmin };
