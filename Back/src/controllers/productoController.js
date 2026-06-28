const { Producto } = require('../models');

const productoController = {

  listar: async (req, res) => {
    try {
      const page   = parseInt(req.query.page)  || 1;
      const limit  = parseInt(req.query.limit) || 6;
      const offset = (page - 1) * limit;
      const where  = { activo: true };

      if (req.query.categoria) where.categoria = req.query.categoria;

      const { count, rows } = await Producto.findAndCountAll({
        where, limit, offset, order: [['createdAt', 'DESC']],
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

  obtenerPorId: async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
      res.json({ ok: true, producto });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, mensaje: 'Error al obtener el producto' });
    }
  },

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

  actualizar: async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });

      const { nombre, descripcion, precio, categoria } = req.body;
      const imagen = req.file ? req.file.filename : producto.imagen;
      await producto.update({ nombre, descripcion, precio, categoria, imagen });
      res.json({ ok: true, producto });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, mensaje: 'Error al actualizar el producto' });
    }
  },

  cambiarEstado: async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
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

module.exports = productoController;
