import { Router } from 'express';
// Importar el middleware de autenticacion para verificar credencial 
import { authMiddleware } from '../middlewares/auth.middleware.js';
// Importar service. Controller no habla directo con el repo
import { reservasService } from '../services/reservas.service.js';

const router = Router();

// Todas las rutas definidas debajo de esta linea exigien un token JWT valido
router.use(authMiddleware);

// Ruta 1
// Post para crear nuevo recurso 
// POST /api/reservas - Crear una solicitud de reserva
router.post('/', async (req, res) => {
  try {
	  // 1. Extraer datos de la sala y horario desde el json enviado por el usuario
    const { espacioId, fechaInicio, fechaFin, motivo } = req.body;
    // 2. Obtener el id del usuario desde el token    
    const usuarioId = req.usuario.id; 

		// 3. Validacion de presencia de datos
    if (!espacioId || !fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'espacioId, fechaInicio y fechaFin son obligatorios.' });
    }

		// 4. Llamar al servicio que revisara conflictos de horario
		// creara la reserva en PENDIENTE 
    const nuevaReserva = await reservasService.crearReserva(usuarioId, espacioId, fechaInicio, fechaFin, motivo);
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
    // 3. Obtener datos del usuario autenticado
    const usuarioId = req.usuario.id;
    const usuarioRol = req.usuario.rol; // 'ESTUDIANTE', 'DOCENTE' o 'ADMIN'

		// 4. Validar que el estado sea uno de los permitidos
    if (!['APROBADA', 'RECHAZADA', 'CANCELADA'].includes(nuevoEstado)) {
      return res.status(400).json({ error: 'Estado no válido.' });
    }
		
		// 5. Llamar al Service para cambiar el estado
    const reservaActualizada = await reservasService.cambiarEstado(
      usuarioId, usuarioRol, id, nuevoEstado, motivoRechazo
    );
    
    // 6. Responder con la reserva actualizada
    res.json(reservaActualizada);
    
    // Manejo de errores (403 Forbidden, 404 Not Found, 400 Bad Request, etc.)
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
});

// Exportar el router para que index.js lo pueda usar
export default router;