import { Router } from 'express';
// Importar el middleware de autenticacion para verificar credencial 
import { authMiddleware } from '../middlewares/auth.middleware.js';
// Importar service. Controller no habla directo con el repo
import { reservasService } from '../services/reservas.service.js';
// 3. Pool de BD se usa solo para una consulta rapida de nombre 
import pool from '../services/dbService.js'; 

const router = Router();

// Todas las rutas definidas debajo de esta linea exigien un token JWT valido
router.use(authMiddleware);

/**
 * @swagger
 * /api/reservas:
 *   post:
 *     summary: Crear una nueva solicitud de reserva
 *     tags: [Reservas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - espacioId
 *               - fechaInicio
 *               - fechaFin
 *             properties:
 *               espacioId:
 *                 type: integer
 *                 example: 1
 *               fechaInicio:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-11-20T10:00:00Z"
 *               fechaFin:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-11-20T12:00:00Z"
 *               motivo:
 *                 type: string
 *                 example: "Reunión de proyecto de Minería de Datos"
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente (Estado PENDIENTE)
 *       400:
 *         description: Fechas inválidas o día festivo
 *       409:
 *         description: Conflicto de horario con otra reserva
 */
// Ruta 1
// Post para crear nuevo recurso 
// POST /api/reservas - Crear una solicitud de reserva
router.post('/', async (req, res, next) => {
  try {
	  const { espacioId, fechaInicio, fechaFin, motivo } = req.body;
    // Extraer tanto el ID como el EMAIL del token decodificado por el middleware
    const { id: usuarioId, email: usuarioEmail } = req.usuario;

		// 3. Validacion de presencia de datos
    if (!espacioId || !fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'espacioId, fechaInicio y fechaFin son obligatorios.' });
    }

    // CONSULTA RAPIDA: Obtener el nombre del espacio para enriquecer la auditoria en MongoDB.
    // Esto evita tener que hacer joins complejos al leer el historial de NoSQL despues.
    const { rows } = await pool.query('SELECT nombre FROM espacios WHERE id = $1', [espacioId]);
    const espacioNombre = rows.length > 0 ? rows[0].nombre : 'Espacio desconocido';

		// 4. Llamar al servicio que revisara conflictos de horario
		// creara la reserva en PENDIENTE 
    const nuevaReserva = await reservasService.crearReserva(
      usuarioId,
      usuarioEmail,
      espacioId, 
      fechaInicio, 
      fechaFin, 
      motivo,
      espacioNombre
    );
    // Responder con 201 de created y registro creado 
    res.status(201).json(nuevaReserva);
    // Error si encuentra algo invalido 
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/reservas:
 *   get:
 *     summary: Listar reservas (todas para ADMIN/DOCENTE, propias para ESTUDIANTE)
 *     tags: [Reservas]
 *     responses:
 *       200:
 *         description: Lista de reservas obtenida exitosamente
 *       401:
 *         description: Token no proporcionado o inválido
 */
// Ruta 2
// Listar las reservas del usuario conectado
// GET /api/reservas - Listar mis reservas
router.get('/', async (req, res, next) => {
  try {
    const { id: usuarioId, rol } = req.usuario;
    const reservas = rol === 'ADMIN' || rol === 'DOCENTE'
      ? await reservasService.obtenerTodas()
      : await reservasService.obtenerMisReservas(usuarioId);
    res.json(reservas);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/reservas/{id}/estado:
 *   patch:
 *     summary: Cambiar el estado de una reserva (Aprobar, Rechazar, Cancelar)
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nuevoEstado
 *             properties:
 *               nuevoEstado:
 *                 type: string
 *                 enum: [APROBADA, RECHAZADA, CANCELADA]
 *                 example: "APROBADA"
 *               motivoRechazo:
 *                 type: string
 *                 example: "Sala en mantenimiento"
 *     responses:
 *       200:
 *         description: Estado de la reserva actualizado
 *       403:
 *         description: Sin permisos para realizar esta acción
 *       404:
 *         description: Reserva no encontrada
 */
//Ruta 3
// Aprobar, rechazar o cancelar una reserva existente
// PATCH /api/reservas/:id/estado 
router.patch('/:id/estado', async (req, res, next) => {
  try {
	  // 1. Extraer el ID de la URL (req.params)
    const { id } = req.params;
    // 2. Extraer el nuevo estado y motivo del body
    const { nuevoEstado, motivoRechazo } = req.body;
    // Extraemos ID, EMAIL y ROL del token
    const { id: usuarioId, email: usuarioEmail, rol: usuarioRol } = req.usuario;

		// 4. Validar que el estado sea uno de los permitidos
    if (!['APROBADA', 'RECHAZADA', 'CANCELADA'].includes(nuevoEstado)) {
      return res.status(400).json({ error: 'Estado no válido.' });
    }
		
		// 5. Llamar al Service para cambiar el estado
    const reservaActualizada = await reservasService.cambiarEstado(
      usuarioId, 
      usuarioEmail,
      usuarioRol, 
      id, 
      nuevoEstado, 
      motivoRechazo
    );
    
    // 6. Responder con la reserva actualizada
    res.json(reservaActualizada);
    
    // Manejo de errores (403 Forbidden, 404 Not Found, 400 Bad Request, etc.)
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/reservas/{id}/historial:
 *   get:
 *     summary: Consultar historial de auditoría de una reserva (MongoDB)
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Línea de tiempo de eventos de la reserva
 *       403:
 *         description: Sin permisos para ver el historial
 *       404:
 *         description: Reserva no encontrada
 */
// RUTA 4: GET /api/reservas/:id/historial - Consultar auditoria (Desde MongoDB)
router.get('/:id/historial', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: usuarioId, rol } = req.usuario;
    const historial = await reservasService.obtenerHistorialReserva(Number(id), usuarioId, rol);
    
    res.json(historial);
  } catch (error) {
    next(error);
  }
});

// Exportar el router para que index.js lo pueda usar
export default router;
