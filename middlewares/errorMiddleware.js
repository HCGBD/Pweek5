const errorHandler = (err, req, res, next) => {
  // Parfois, une erreur peut avoir un code de statut défini, sinon on utilise 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message,
    // En environnement de developpement, on peut vouloir la stack trace, mais pas en production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  errorHandler,
};
