// Clase de error personalizado
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Marca que es un error esperado de negocio
  }
}

// 2. Middleware global de Express (siempre recibe 4 argumentos: err, req, res, next)
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Error interno del servidor';

  // Traducir errores de PostgreSQL a mensajes seguros
  if (err.code === '23505') { // unique_violation
    statusCode = 409;
    message = 'El registro ya existe (duplicado).';
  } else if (err.code === '23503') { // foreign_key_violation
    statusCode = 400;
    message = 'Referencia inválida en base de datos.';
  } else if (err.code === '23514') { // check_violation
    statusCode = 400;
    message = 'Valor no permitido por restricción.';
  } else if (err.code === '22P02') { // invalid_text_representation
    statusCode = 400;
    message = 'Formato de dato inválido.';
  }

  // Errores de JWT traducidos 
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado.';
  }

  // En produccion, no exponer detalles internos 500
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Error interno del servidor';
  }

  // Log en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

	// Respuesta json estandarizada hacia el cliente
  res.status(statusCode).json({ error: message });
};