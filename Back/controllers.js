const bcrypt = require('bcrypt');
const { Usuario, Producto, Venta, VentaProducto } = require('./models');

/* ════════════════════════════════════════════════════════════════════════
   CONTROLLER: Productos
   ════════════════════════════════════════════════════════════════════════ */
const productoController = {
  // GET /api/productos?page=1&limit=6&categoria=juegos
  listar: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 6;
      const offset = (page - 1) * limit;
      const where = { activo: true };

      if (req.query.categoria) {
        where.categoria = req.query.categoria;
      }

      const { count, rows } = await Producto.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      res.json({
        ok: true,
        productos: rows,
        total: count,
        pagina: page,
        totalPaginas: Math.ceil(count / limit),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, mensaje: 'Error al obtener productos' });
    }
  },

  // GET /api/productos/:id
  obtenerPorId: async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
      }
      res.json({ ok: true, producto });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, mensaje: 'Error al obtener el producto' });
    }
  },

  // POST /api/productos
  crear: async (req, res) => {
    try {
      const { nombre, descripcion, precio, categoria } = req.body;
      const imagen = req.file ? req.file.filename : 'default.jpg';

      const producto = await Producto.create({ nombre, descripcion, precio, categoria, imagen });
      res.status(201).json({ ok: true, producto });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, mensaje: 'Error al crear el producto' });
    }
  },

  // PUT /api/productos/:id
  actualizar: async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
      }

      const { nombre, descripcion, precio, categoria } = req.body;
      const imagen = req.file ? req.file.filename : producto.imagen;

      await producto.update({ nombre, descripcion, precio, categoria, imagen });
      res.json({ ok: true, producto });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, mensaje: 'Error al actualizar el producto' });
    }
  },

  // PATCH /api/productos/:id/estado
  cambiarEstado: async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
      }

      await producto.update({ activo: !producto.activo });
      res.json({
        ok: true,
        mensaje: `Producto ${producto.activo ? 'activado' : 'desactivado'} correctamente`,
        producto,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, mensaje: 'Error al cambiar estado del producto' });
    }
  },
};

/* ════════════════════════════════════════════════════════════════════════
   CONTROLLER: Ventas
   ════════════════════════════════════════════════════════════════════════ */
const ventaController = {
  // POST /api/ventas — registra una venta nueva
  crear: async (req, res) => {
    try {
      const { nombre_cliente, productos } = req.body;
      // productos = [{ id, cantidad, precio_unitario }, ...]

      if (!productos || productos.length === 0) {
        return res.status(400).json({ ok: false, mensaje: 'El carrito está vacío' });
      }

      const precio_total = productos.reduce(
        (acc, p) => acc + p.precio_unitario * p.cantidad,
        0
      );

      const venta = await Venta.create({ nombre_cliente, precio_total });

      // Insertar los items en la tabla intermedia
      const items = productos.map((p) => ({
        venta_id: venta.id,
        producto_id: p.id,
        cantidad: p.cantidad,
        precio_unitario: p.precio_unitario,
      }));
      await VentaProducto.bulkCreate(items);

      // Traer la venta completa con productos para devolver al frontend
      const ventaCompleta = await Venta.findByPk(venta.id, {
        include: [{ model: Producto }],
      });

      res.status(201).json({ ok: true, venta: ventaCompleta });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, mensaje: 'Error al registrar la venta' });
    }
  },

  // GET /api/ventas — listado de ventas con sus productos
  listar: async (req, res) => {
    try {
      const ventas = await Venta.findAll({
        include: [{ model: Producto }],
        order: [['fecha', 'DESC']],
      });
      res.json({ ok: true, ventas });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, mensaje: 'Error al obtener ventas' });
    }
  },
};

/* ════════════════════════════════════════════════════════════════════════
   CONTROLLER: Usuarios (administradores)
   ════════════════════════════════════════════════════════════════════════ */
const usuarioController = {
  // POST /api/usuarios — crear usuario administrador
  crear: async (req, res) => {
    try {
      const { nombre, email, password } = req.body;

      const existe = await Usuario.findOne({ where: { email } });
      if (existe) {
        return res.status(400).json({ ok: false, mensaje: 'El email ya está registrado' });
      }

      const hash = await bcrypt.hash(password, 10);
      const usuario = await Usuario.create({ nombre, email, password: hash });

      res.status(201).json({
        ok: true,
        usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, mensaje: 'Error al crear el usuario' });
    }
  },
};

module.exports = { productoController, ventaController, usuarioController };
