const express          = require('express');
const adminController  = require('../controllers/adminController');
const registrosController = require('../controllers/registrosController');
const { authMiddleware } = require('../middlewares/auth');
const { upload }         = require('../middlewares/upload');

const router = express.Router();

// Auth
router.get('/login',   adminController.getLogin);
router.post('/login',  adminController.postLogin);
router.get('/logout',  adminController.logout);

// Dashboard
router.get('/dashboard', authMiddleware, adminController.getDashboard);

// Productos (vistas EJS)
router.get('/productos/nuevo',         authMiddleware, adminController.getNuevoProducto);
router.post('/productos/nuevo',        authMiddleware, upload.single('imagen'), adminController.postNuevoProducto);
router.get('/productos/:id/editar',    authMiddleware, adminController.getEditarProducto);
router.post('/productos/:id/editar',   authMiddleware, upload.single('imagen'), adminController.postEditarProducto);
router.post('/productos/:id/estado',   authMiddleware, adminController.cambiarEstado);

// Registros
router.get('/registros',       authMiddleware, registrosController.getRegistros);
router.get('/registros/excel', authMiddleware, registrosController.descargarExcel);

module.exports = router;
