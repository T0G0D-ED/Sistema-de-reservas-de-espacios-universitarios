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

// Ruta 1
// Post para crear nuevo recurso 
// POST /api/reservas - Crear una solicitud de reserva
router.post('/', async (req, res) => {
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
      espacioNombre)
    ;
    // Responder con 201 de created y registro creado 
    res.status(201).json(nuevaReserva);
    // Error si encuentra algo invalido 
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
});

// Ruta 2
// Listar las reservas del usuario conectado
// GET /api/reservas - Listar mis reservas
router.get('/', async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    // Llamar al service para obtener las reservas de ese usuario
    const reservas = await reservasService.obtenerMisReservas(usuarioId);
    // Responder con un array de reservas
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

//Ruta 3
// Aprobar, rechazar o cancelar una reserva existente
// PATCH /api/reservas/:id/estado 
router.patch('/:id/estado', async (req, res) => {
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
    res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
});

// RUTA 4: GET /api/reservas/:id/historial - Consultar auditoria (Desde MongoDB)
router.get('/:id/historial', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Llamar al servicio para obtener la linea de tiempo de esta reserva especifica
    const historial = await reservasService.obtenerHistorialReserva(Number(id));
    
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial de auditoría' });
  }
});


// Exportar el router para que index.js lo pueda usar
export default router;