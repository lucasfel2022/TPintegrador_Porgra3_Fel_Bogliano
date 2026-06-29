// ════════════════════════════════════════════════════════════════════════
// AGREGAR ESTO a Back/src/middlewares/validators.js
// (sumar el require de body/validationResult arriba si no lo tenés ya,
//  y exportar validarEncuesta junto con los demás validators existentes)
// ════════════════════════════════════════════════════════════════════════

const { body, validationResult } = require('express-validator');

const validarEncuesta = [
  body('opinion')
    .trim()
    .notEmpty().withMessage('La opinión es obligatoria.')
    .isLength({ min: 10, max: 1000 }).withMessage('La opinión debe tener entre 10 y 1000 caracteres.'),

  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio.')
    .isEmail().withMessage('Ingresá un email válido.'),

  body('puntuacion')
    .notEmpty().withMessage('La puntuación es obligatoria.')
    .isInt({ min: 1, max: 10 }).withMessage('La puntuación debe ser un número entre 1 y 10.'),

  // acepta_contacto es un checkbox: puede no venir si está sin marcar, no se valida como obligatorio

  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errores: errores.array().map((e) => e.msg),
      });
    }
    next();
  },
];

module.exports.validarEncuesta = validarEncuesta;
// Si el archivo ya usa module.exports = { validarVenta, validarProducto, ... }
// entonces agregá validarEncuesta dentro de ese mismo objeto en vez de la línea de arriba.
