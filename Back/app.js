const express = require('express');
const session = require('express-session');
const path    = require('path');
require('dotenv').config();

const app = express();

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../Front')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Motor de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'partials'));

// Sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto123',
  resave: false,
  saveUninitialized: false,
}));

// Rutas
const productosRouter = require('./src/routes/productos.routes');
const ventasRouter    = require('./src/routes/ventas.routes');
const usuariosRouter  = require('./src/routes/usuarios.routes');
const adminRouter     = require('./src/routes/admin.routes');

app.use('/api/productos', productosRouter);
app.use('/api/ventas',    ventasRouter);
app.use('/api/usuarios',  usuariosRouter);
app.use('/admin',         adminRouter);

// Ruta raíz → frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Front/index.html'));
});

// Arranque del servidor
const PORT = process.env.PORT || 3000;
const { sequelize, conectarDB } = require('./src/config/database');

conectarDB().then(() => {
  sequelize.sync({ alter: true }).then(() => {
    console.log('✅ Tablas sincronizadas');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  });
});
