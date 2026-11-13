import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Objeto principal de configuracion de la documentacion
const options = {
  definition: {
    openapi: '3.0.0',
    // Metadatos generales del encabezado de la pagina
    info: {
      title: 'API Reserva de Espacios UNAB',
      version: '1.0.0',
      description: 'Sistema de gestión de reserva de espacios universitarios (Hito 3)',
      contact: {
        name: 'Equipo de Desarrollo',
      },
    },
    
    // Lista de servidores disponibles para ejecutar pruebas desde el navegador
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desarrollo Local',
      },
    ],
    
	  // Define el esquema de seguridad JWT para que Swagger muestre el boton "Authorize"
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    // Por defecto, requerir autenticacion en todos los endpoints (se puede anular por ruta)
    security: [{ bearerAuth: [] }],
  },
  
  // Apunta de forma exacta a backend/routes/*.js desde backend/services/
  apis: [path.join(__dirname, '../routes/*.js')],   
};
// Compila las opciones y los comentarios de las rutas en una especificación JSON valida
const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };