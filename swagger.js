const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vulnerability Scanner',
      version: '1.0.0',
      description: 'Документация сервиса для сканирования уязвимостей',
    },
    servers: [
      {
        url: 'http://localhost:3001',
      },
    ],
  },
  apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;