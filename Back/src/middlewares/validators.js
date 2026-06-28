const { body, validationResult } = require('express-validator');

const validar = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ ok: false, errores: errores.array() });
  }
  next();
};

const validarProducto = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio').trim(),
  body('precio')
    .notEmpty().withMessage('El precio es obligatorio')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('categoria')
    .notEmpty().withMessage('La categoría es obligatoria')
    .isIn(['juegos', 'accesorios']).withMessage('Categoría inválida'),
  validar,
];

const validarVenta = [
  body('nombre_cliente').notEmpty().withMessage('El nombre del cliente es obligatorio').trim(),
  body('productos').isArray({ min: 1 }).withMessage('El carrito no puede estar vacío'),
  body('productos.*.id').isInt({ min: 1 }).withMessage('ID de producto inválido'),
  body('productos.*.cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
  body('productos.*.precio_unitario').isFloat({ min: 0 }).withMessage('Precio inválido'),
  validar,
];

const validarUsuario = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio').trim(),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  validar,
];

module.exports = { validarProducto, validarVenta, validarUsuario };
