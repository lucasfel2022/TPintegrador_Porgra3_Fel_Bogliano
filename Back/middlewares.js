const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');

/* ════════════════════════════════════════════════════════════════════════
   MIDDLEWARE: Autenticación de sesión (para vistas admin)
   ════════════════════════════════════════════════════════════════════════ */
const authMiddleware = (req, res, next) => {
  if (req.session && req.session.usuarioId) {
    return next();
  }
  res.redirect('/admin/login');
};

/* ════════════════════════════════════════════════════════════════════════
   MIDDLEWARE: Upload de imágenes (multer)
   ════════════════════════════════════════════════════════════════════════ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'src', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nombre = `producto_${Date.now()}${ext}`;
    cb(null, nombre);
  },
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = /jpeg|jpg|png|webp/;
  const esValido = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
  if (esValido) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
});

/* ════════════════════════════════════════════════════════════════════════
   MIDDLEWARE: Validaciones con express-validator
   ════════════════════════════════════════════════════════════════════════ */
const validar = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ ok: false, errores: errores.array() });
  }
  next();
};

const validarProducto = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio').trim(),
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

module.exports = {
  authMiddleware,
  upload,
  validarProducto,
  validarVenta,
  validarUsuario,
};
