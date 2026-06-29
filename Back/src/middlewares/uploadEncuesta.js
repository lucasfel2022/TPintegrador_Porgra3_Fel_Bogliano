const multer = require('multer');
const path   = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const sufijo = `encuesta-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, sufijo);
  },
});

const filtroImagen = (req, file, cb) => {
  const tiposPermitidos = /jpeg|jpg|png|webp/;
  const esValido = tiposPermitidos.test(path.extname(file.originalname).toLowerCase())
    && tiposPermitidos.test(file.mimetype);

  if (esValido) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpg, jpeg, png, webp).'));
  }
};

const uploadEncuesta = multer({
  storage,
  fileFilter: filtroImagen,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { uploadEncuesta };
