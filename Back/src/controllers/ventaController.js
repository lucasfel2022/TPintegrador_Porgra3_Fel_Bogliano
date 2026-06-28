const { Venta, Producto, VentaProducto } = require('../models');

const ventaController = {

  crear: async (req, res) => {
    try {
      const { nombre_cliente, productos } = req.body;

      if (!productos || productos.length === 0) {
        return res.status(400).json({ ok: false, mensaje: 'El carrito está vacío' });
      }

      const precio_total = productos.reduce(
        (acc, p) => acc + p.precio_unitario * p.cantidad, 0
      );

      const venta = await Venta.create({ nombre_cliente, precio_total });

      const items = productos.map((p) => ({
        venta_id:        venta.id,
        producto_id:     p.id,
        cantidad:        p.cantidad,
        precio_unitario: p.precio_unitario,
      }));
      await VentaProducto.bulkCreate(items);

      const ventaCompleta = await Venta.findByPk(venta.id, {
        include: [{ model: Producto }],
      });

      res.status(201).json({ ok: true, venta: ventaCompleta });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, mensaje: 'Error al registrar la venta' });
    }
  },

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

module.exports = ventaController;
