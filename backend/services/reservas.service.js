// Importar repository ayudante 
import { reservasRepo } from '../repositories/reservas.repo.js';

export const reservasService = {

	// Funcion 1: Solicitar nueva reserva 
  async crearReserva(usuarioId, espacioId, fechaInicio, fechaFin, motivo) {
    
    // 1. Validacion basica de fechas 
    // Se convierte texto iso a objetos date para comparar
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      throw { status: 400, message: 'La fecha de fin debe ser posterior a la de inicio.' };
    }

		// 2. Validacion de conflicto de horario 
    // Se pregunta al repositorio si si hay algo reservado en el rango de tiempo
    const conflicto = await reservasRepo.buscarConflicto(espacioId, fechaInicio, fechaFin);
    if (conflicto) {
	    // Si hay choque se lanza error 409 con el motivo 
      throw { 
        status: 409, 
        message: `Conflicto de horario: El espacio ya está reservado (Estado: ${conflicto.estado}).` 
      };
    }

    // 3. Si esta despejado el horario, se delega al repo la creacion en PENDIENTE
    return await reservasRepo.crear(usuarioId, espacioId, fechaInicio, fechaFin, motivo);
  },

	// Funcion 2: Consultar el historial personal de reservas
  async obtenerMisReservas(usuarioId) {
    return await reservasRepo.listarPorUsuario(usuarioId);
  },

	// Funcion 3: Cambiar estado de la reserva (Aprobar, Rechazar o Cancelar)
  async cambiarEstado(usuarioId, usuarioRol, reservaId, nuevoEstado, motivoRechazo = null) {
    // 1. Verificar que la reserva exista en PGSQL
    const reserva = await reservasRepo.obtenerPorId(reservaId);
    if (!reserva) {
      throw { status: 404, message: 'Reserva no encontrada.' };
    }

    // 2. Reglas para aprobar o rechazar 
    if (nuevoEstado === 'APROBADA' || nuevoEstado === 'RECHAZADA') {
	    // Solo personal autorizado admin o docente pueden aparobar o rechazar solicitudes
      if (usuarioRol !== 'ADMIN' && usuarioRol !== 'DOCENTE') {
        throw { status: 403, message: 'No tienes permisos para aprobar o rechazar reservas.' };
      }
      // Solo se cambia el estado si esta en estado PENDIENTE
      if (reserva.estado !== 'PENDIENTE') {
        throw { status: 400, message: 'Solo se pueden aprobar/rechazar reservas pendientes.' };
      }
    }

		// 3. Reglas para cancelar 
    if (nuevoEstado === 'CANCELADA') {
      // El dueño de la reserva o un admin pueden cancelar
      if (reserva.usuario_id !== usuarioId && usuarioRol !== 'ADMIN') {
        throw { status: 403, message: 'No tienes permiso para cancelar esta reserva.' };
      }
      // Se evita volver a cancelar una reserva que estaba ya inactiva
      if (reserva.estado === 'CANCELADA' || reserva.estado === 'RECHAZADA') {
        throw { status: 400, message: 'Esta reserva ya fue cancelada o rechazada.' };
      }
    }
		
		// 4. Auditoria para guardar el id del responsable que tomo la decision de aprobar o rechazar
		// Si la accion la tomo un usuario da null 
    const aprobadaPor = (nuevoEstado === 'APROBADA' || nuevoEstado === 'RECHAZADA') ? usuarioId : null;
	  
	  // 5. Ejecutar actualizacion en la base de datos
    return await reservasRepo.actualizarEstado(reservaId, nuevoEstado, motivoRechazo, aprobadaPor);
  }
};