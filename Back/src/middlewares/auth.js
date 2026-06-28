const authMiddleware = (req, res, next) => {
  if (req.session && req.session.usuarioId) {
    return next();
  }
  res.redirect('/admin/login');
};

module.exports = { authMiddleware };
