const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const swaggerOptions = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "ReadersHub API",
      version: "1.0.0",
      description:
        "Complete API documentation for ReadersHub - Books, Users, Reviews, Authors, and Movies management system.",
    },
    servers: [
      {
        url: process.env.SWAGGER_BASE_URL || "/",
        description: "API base URL (uses UI origin when unset)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [path.join(__dirname, "../swagger.yaml")],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
