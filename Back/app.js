const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../Front')));

app.set('view engine', 'ejs');
app.set('views', __dirname);

app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto123',
  resave: false,
  saveUninitialized: false
}));

const { routerProductos, routerVentas, routerUsuarios, routerAdmin } = require('./routes');

app.use('/api/productos', routerProductos);
app.use('/api/ventas', routerVentas);
app.use('/api/usuarios', routerUsuarios);
app.use('/admin', routerAdmin);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Front/index.html'));
});

const PORT = process.env.PORT || 3000;
const { sequelize, conectarDB } = require('./database');

conectarDB().then(() => {
  sequelize.sync({ alter: true }).then(() => {
    console.log('✅ Tablas sincronizadas');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  });
});