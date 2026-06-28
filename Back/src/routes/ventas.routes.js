const express          = require('express');
const ventaController  = require('../controllers/ventaController');
const { validarVenta } = require('../middlewares/validators');

const router = express.Router();

router.get('/',  ventaController.listar);
router.post('/', validarVenta, ventaController.crear);

module.exports = router;
