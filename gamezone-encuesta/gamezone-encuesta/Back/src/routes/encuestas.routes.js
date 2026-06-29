const express               = require('express');
const encuestaController    = require('../controllers/encuestaController');
const { validarEncuesta }   = require('../middlewares/validators');
const { uploadEncuesta }    = require('../middlewares/uploadEncuesta');

const router = express.Router();

// POST /api/encuestas — guarda la encuesta (multipart por la imagen)
router.post('/', uploadEncuesta.single('imagen'), validarEncuesta, encuestaController.crear);

module.exports = router;
