const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { Venta, Producto, VentaProducto, LogSesion, Encuesta } = require('../models');

const registrosController = {

  getRegistros: async (req, res) => {
    try {
      const topProductos = await VentaProducto.findAll({
        attributes: [
          'producto_id',
          [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_vendido'],
        ],
        include: [{ model: Producto, attributes: ['nombre', 'categoria'] }],
        group:   ['producto_id', 'Producto.id'],
        order:   [[sequelize.literal('total_vendido'), 'DESC']],
        limit:   10,
      });

      const topVentas = await Venta.findAll({
        order: [['precio_total', 'DESC']],
        limit: 10,
      });

      const logs = await LogSesion.findAll({
        order: [['fecha', 'DESC']],
        limit: 20,
      });

      // ── Filtro de fechas para las tablas de encuestas ──────────────────
      // Llega como query params: /admin/registros?desde=2026-06-01&hasta=2026-06-28
      const { desde, hasta } = req.query;
      const filtroFecha = construirFiltroFecha(desde, hasta);

      // ── TABLA NUEVA 1: Resumen de encuestas (promedio + cantidad) ──────
      const resumenEncuestas = await Encuesta.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
          [sequelize.fn('AVG', sequelize.col('puntuacion')), 'promedio_puntuacion'],
          [sequelize.fn('MIN', sequelize.col('puntuacion')), 'puntuacion_minima'],
          [sequelize.fn('MAX', sequelize.col('puntuacion')), 'puntuacion_maxima'],
        ],
        where: filtroFecha,
        raw: true,
      });

      // ── TABLA NUEVA 2: Últimas encuestas en el rango filtrado ──────────
      const detalleEncuestas = await Encuesta.findAll({
        where: filtroFecha,
        order: [['fecha', 'DESC']],
        limit: 15,
      });

      res.render('registros', {
        topProductos,
        topVentas,
        logs,
        resumenEncuestas: resumenEncuestas[0] || {
          cantidad: 0, promedio_puntuacion: null, puntuacion_minima: null, puntuacion_maxima: null,
        },
        detalleEncuestas,
        filtroDesde: desde || '',
        filtroHasta: hasta || '',
        usuario: req.session.usuarioNombre,
      });
    } catch (error) {
      console.error(error);
      res.render('registros', {
        topProductos: [],
        topVentas:    [],
        logs:         [],
        resumenEncuestas: { cantidad: 0, promedio_puntuacion: null, puntuacion_minima: null, puntuacion_maxima: null },
        detalleEncuestas: [],
        filtroDesde: '',
        filtroHasta: '',
        usuario:      req.session.usuarioNombre,
      });
    }
  },

  descargarExcel: async (req, res) => {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();

      // Hoja 1 — Top productos más vendidos
      const hoja1 = workbook.addWorksheet('Top Productos');
      hoja1.columns = [
        { header: '#',                 key: 'num',       width: 5  },
        { header: 'Producto',          key: 'nombre',    width: 30 },
        { header: 'Categoría',         key: 'categoria', width: 15 },
        { header: 'Unidades vendidas', key: 'total',     width: 20 },
      ];
      const topProductos = await VentaProducto.findAll({
        attributes: [
          'producto_id',
          [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_vendido'],
        ],
        include: [{ model: Producto, attributes: ['nombre', 'categoria'] }],
        group:   ['producto_id', 'Producto.id'],
        order:   [[sequelize.literal('total_vendido'), 'DESC']],
        limit:   10,
      });
      topProductos.forEach((item, i) => {
        hoja1.addRow({
          num:       i + 1,
          nombre:    item.Producto?.nombre    ?? 'N/A',
          categoria: item.Producto?.categoria ?? 'N/A',
          total:     item.dataValues.total_vendido,
        });
      });

      // Hoja 2 — Top ventas más caras
      const hoja2 = workbook.addWorksheet('Top Ventas');
      hoja2.columns = [
        { header: '#',       key: 'num',     width: 5  },
        { header: 'Cliente', key: 'cliente', width: 25 },
        { header: 'Total',   key: 'total',   width: 15 },
        { header: 'Fecha',   key: 'fecha',   width: 25 },
      ];
      const topVentas = await Venta.findAll({
        order: [['precio_total', 'DESC']],
        limit: 10,
      });
      topVentas.forEach((venta, i) => {
        hoja2.addRow({
          num:     i + 1,
          cliente: venta.nombre_cliente,
          total:   Number(venta.precio_total),
          fecha:   new Date(venta.fecha).toLocaleString('es-AR'),
        });
      });

      // Hoja 3 — LOG de sesiones
      const hoja3 = workbook.addWorksheet('LOG Sesiones');
      hoja3.columns = [
        { header: '#',     key: 'num',   width: 5  },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Fecha', key: 'fecha', width: 25 },
      ];
      const logs = await LogSesion.findAll({
        order: [['fecha', 'DESC']],
        limit: 20,
      });
      logs.forEach((log, i) => {
        hoja3.addRow({
          num:   i + 1,
          email: log.email,
          fecha: new Date(log.fecha).toLocaleString('es-AR'),
        });
      });

      // Hoja 4 — Encuestas (detalle completo, respeta filtro de fechas si vino)
      const hoja4 = workbook.addWorksheet('Encuestas');
      hoja4.columns = [
        { header: '#',          key: 'num',        width: 5  },
        { header: 'Email',      key: 'email',      width: 30 },
        { header: 'Puntuación', key: 'puntuacion', width: 12 },
        { header: 'Opinión',    key: 'opinion',    width: 50 },
        { header: 'Fecha',      key: 'fecha',      width: 25 },
      ];
      const { desde, hasta } = req.query;
      const filtroFecha = construirFiltroFecha(desde, hasta);
      const encuestas = await Encuesta.findAll({
        where: filtroFecha,
        order: [['fecha', 'DESC']],
      });
      encuestas.forEach((enc, i) => {
        hoja4.addRow({
          num:        i + 1,
          email:      enc.email,
          puntuacion: enc.puntuacion,
          opinion:    enc.opinion,
          fecha:      new Date(enc.fecha).toLocaleString('es-AR'),
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
  },
};

// ── Helper: construye el WHERE de fecha a partir de los query params ──────
function construirFiltroFecha(desde, hasta) {
  if (!desde && !hasta) return {};

  const condicion = {};
  if (desde) condicion[Op.gte] = new Date(`${desde}T00:00:00`);
  if (hasta) condicion[Op.lte] = new Date(`${hasta}T23:59:59`);

  return { fecha: condicion };
}

module.exports = registrosController;
