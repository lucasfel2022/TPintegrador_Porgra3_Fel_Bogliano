const bcrypt = require('bcrypt');
const { Usuario } = require('../models');

const usuarioController = {

  crear: async (req, res) => {
    try {
      const { nombre, email, password } = req.body;

      const existe = await Usuario.findOne({ where: { email } });
      if (existe) return res.status(400).json({ ok: false, mensaje: 'El email ya está registrado' });

      const hash    = await bcrypt.hash(password, 10);
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

module.exports = usuarioController;
