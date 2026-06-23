const express = require('express');
const bcrypt = require('bcrypt');
const { Usuario, Producto } = require('./models');
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

module.exports = { routerProductos, routerVentas, routerUsuarios, routerAdmin };
