const express            = require('express');
const usuarioController  = require('../controllers/usuarioController');
const { validarUsuario } = require('../middlewares/validators');

const router = express.Router();

router.post('/', validarUsuario, usuarioController.crear);

module.exports = router;
