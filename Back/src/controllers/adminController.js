const bcrypt  = require('bcrypt');
const { Usuario, Producto, LogSesion } = require('../models');

const adminController = {

  getLogin: (req, res) => {
    if (req.session.usuarioId) return res.redirect('/admin/dashboard');
    res.render('login', { error: null, usuario: null });
  },

  postLogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const usuario = await Usuario.findOne({ where: { email } });

      if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
        return res.render('login', { error: 'Email o contraseña incorrectos', usuario: null });
      }

      req.session.usuarioId     = usuario.id;
      req.session.usuarioNombre = usuario.nombre;

      await LogSesion.create({ usuario_id: usuario.id, email: usuario.email });

      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error(error);
      res.render('login', { error: 'Error interno, intentá de nuevo', usuario: null });
    }
  },

  logout: (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
  },

  getDashboard: async (req, res) => {
    try {
      const productos = await Producto.findAll({
        order: [['categoria', 'ASC'], ['nombre', 'ASC']],
      });
      res.render('dashboard', { productos, usuario: req.session.usuarioNombre });
    } catch (error) {
      console.error(error);
      res.render('dashboard', { productos: [], usuario: req.session.usuarioNombre });
    }
  },

  getNuevoProducto: (req, res) => {
    res.render('producto-form', { producto: null, error: null, usuario: req.session.usuarioNombre });
  },

  postNuevoProducto: async (req, res) => {
    try {
      const { nombre, descripcion, precio, categoria } = req.body;
      const imagen = req.file ? req.file.filename : 'default.jpg';
      await Producto.create({ nombre, descripcion, precio, categoria, imagen });
      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error(error);
      res.render('producto-form', { producto: null, error: 'Error al crear el producto', usuario: req.session.usuarioNombre });
    }
  },

  getEditarProducto: async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) return res.redirect('/admin/dashboard');
      res.render('producto-form', { producto, error: null, usuario: req.session.usuarioNombre });
    } catch (error) {
      console.error(error);
      res.redirect('/admin/dashboard');
    }
  },

  postEditarProducto: async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) return res.redirect('/admin/dashboard');

      const { nombre, descripcion, precio, categoria } = req.body;
      const imagen = req.file ? req.file.filename : producto.imagen;
      await producto.update({ nombre, descripcion, precio, categoria, imagen });
      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error(error);
      res.render('producto-form', { producto: null, error: 'Error al editar el producto', usuario: req.session.usuarioNombre });
    }
  },

  cambiarEstado: async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (producto) await producto.update({ activo: !producto.activo });
      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error(error);
      res.redirect('/admin/dashboard');
    }
  },
};

module.exports = adminController;
