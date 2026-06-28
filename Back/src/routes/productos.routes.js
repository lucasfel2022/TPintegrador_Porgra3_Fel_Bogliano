const express           = require('express');
const productoController = require('../controllers/productoController');
const { upload }         = require('../middlewares/upload');
const { validarProducto } = require('../middlewares/validators');

const router = express.Router();

router.get('/',           productoController.listar);
router.get('/:id',        productoController.obtenerPorId);
router.post('/',          upload.single('imagen'), validarProducto, productoController.crear);
router.put('/:id',        upload.single('imagen'), validarProducto, productoController.actualizar);
router.patch('/:id/estado', productoController.cambiarEstado);

module.exports = router;
