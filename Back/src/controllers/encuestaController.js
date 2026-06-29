const { Encuesta } = require('../models');
const { Op } = require('sequelize');

const encuestaController = {

  // POST /api/encuestas — el cliente envía la encuesta desde encuesta.ejs
  crear: async (req, res) => {
    try {
      const { opinion, email, acepta_contacto, puntuacion, venta_id } = req.body;

      const nuevaEncuesta = await Encuesta.create({
        venta_id: venta_id || null,
        opinion,
        email,
        acepta_contacto: acepta_contacto === 'true' || acepta_contacto === 'on',
        puntuacion: Number(puntuacion),
        imagen: req.file ? req.file.filename : null,
        fecha: new Date(),
      });

      return res.json({ ok: true, encuesta: nuevaEncuesta });
    } catch (error) {
      console.error(error);

      if (error.name === 'SequelizeValidationError') {
        const mensajes = error.errors.map((e) => e.message);
        return res.status(400).json({ ok: false, errores: mensajes });
      }

      return res.status(500).json({ ok: false, error: 'Error al guardar la encuesta.' });
    }
  },

  // GET /encuesta — muestra el formulario al cliente
  mostrarFormulario: (req, res) => {
    res.render('encuesta', { ventaId: req.query.venta_id || null });
  },

  // GET /admin/asistencia — listado completo de encuestas para el admin
  verAsistencia: async (req, res) => {
    try {
      const encuestas = await Encuesta.findAll({
        order: [['fecha', 'DESC']],
      });

      res.render('asistencia', {
        encuestas,
        usuario: req.session.usuarioNombre,
      });
    } catch (error) {
      console.error(error);
      res.render('asistencia', {
        encuestas: [],
        usuario: req.session.usuarioNombre,
      });
    }
  },
};

module.exports = encuestaController;
