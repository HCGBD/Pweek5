const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description: 'API de gestion des tâches pour une team.',
    },
    servers: [
      {
        url: 'http://localhost:5000', 
        description: 'Serveur de développement local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './models/*.js', './controllers/*.js'], // Chemins vers vos fichiers de routes, modèles et contrôleurs
};

const specs = swaggerJsdoc(options);

module.exports = specs;
