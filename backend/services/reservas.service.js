// Importamos el repositorio SQL (PostgreSQL) y el modelo NoSQL (MongoDB)
import { reservasRepo } from '../repositories/reservas.repo.js';
import { EventoReserva } from '../models/EventoReserva.js';
import { validarDiaHabil } from '../utils/feriados.js'; //

export const reservasService = {

  // Funcion 1: Solicitar nueva reserva (Escribe en PostgreSQL + Audita en MongoDB)
  async crearReserva(usuarioId, usuarioEmail, espacioId, fechaInicio, fechaFin, motivo, espacioNombre = null) {
    
    // 1. Validacion básica de fechas
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      throw { status: 400, message: 'La fecha de fin debe ser posterior a la de inicio.' };
    }

    // 2. Validar dia habil (API de feriados de Chile)
    const validacionDia = await validarDiaHabil(fechaInicio);
    if (!validacionDia.esHabil) {
      throw { status: 400, message: validacionDia.motivo };
    } 

    // 3. Validacion de conflicto de horario en PostgreSQL
    // Se pregunta al repositorio si si hay algo reservado en el rango de tiempo
    const conflicto = await reservasRepo.buscarConflicto(espacioId, fechaInicio, fechaFin);
    if (conflicto) {
      throw { 
        status: 409, 
        message: `Conflicto de horario: El espacio ya está reservado (Estado: ${conflicto.estado}).` 
      };
    }

    // 4.  Crear el registro transaccional en PostgreSQL (estado inicial: PENDIENTE)
    const nuevaReserva = await reservasRepo.crear(usuarioId, espacioId, fechaInicio, fechaFin, motivo);

    // 5. Registrar el evento inicial en MongoDB Atlas (Auditoria inmutable)
    try {
      await EventoReserva.create({
        reservaId: nuevaReserva.id, // Vinculamos con el ID recien generado por PostgreSQL
        tipoEvento: 'CREADA',
        actorId: usuarioId,
        actorEmail: usuarioEmail,
        metadata: {
          espacioId: espacioId,
          espacioNombre: espacioNombre,
          fechaInicio: fechaInicio,
          fechaFin: fechaFin,
          motivo: motivo
        }
      });
    } catch (mongoError) {
      console.error('Reserva creada en SQL, pero falló el log en MongoDB:', mongoError.message);
    }

    return nuevaReserva;
  },

  // Función 2: Consultar el historial personal de reservas (Lectura desde PostgreSQL)
  async obtenerMisReservas(usuarioId) {
    return await reservasRepo.listarPorUsuario(usuarioId);
  },

  async obtenerTodas() {
    return await reservasRepo.listarTodas();
  },

  // Función 3: Cambiar estado de la reserva (Actualiza en PostgreSQL + Audita en MongoDB)
  async cambiarEstado(usuarioId, usuarioEmail, usuarioRol, reservaId, nuevoEstado, motivoRechazo = null) {
    // 1. Verificar que la reserva exista en PostgreSQL
    const reserva = await reservasRepo.obtenerPorId(reservaId);
    if (!reserva) {
      throw { status: 404, message: 'Reserva no encontrada.' };
    }

    // 2. Reglas de negocio para aprobar o rechazar
    if (nuevoEstado === 'APROBADA' || nuevoEstado === 'RECHAZADA') {
      if (usuarioRol !== 'ADMIN' && usuarioRol !== 'DOCENTE') {
        throw { status: 403, message: 'No tienes permisos para aprobar o rechazar reservas.' };
      }
      if (reserva.estado !== 'PENDIENTE') {
        throw { status: 400, message: 'Solo se pueden aprobar/rechazar reservas pendientes.' };
      }
      if (nuevoEstado === 'RECHAZADA' && !motivoRechazo?.trim()) {
        throw { status: 400, message: 'Debes indicar un motivo para rechazar la reserva.' };
      }
    }

    // 3. Reglas de negocio para cancelar
    if (nuevoEstado === 'CANCELADA') {
  	  // Solo el dueño de la reserva o un admin pueden cancelar
      if (reserva.usuario_id !== usuarioId && usuarioRol !== 'ADMIN') {
        throw { status: 403, message: 'No tienes permiso para cancelar esta reserva.' };
      }
      // Solo se cambia el estado si esta en estado PENDIENTE
      if (reserva.estado === 'CANCELADA' || reserva.estado === 'RECHAZADA') {
        throw { status: 400, message: 'Esta reserva ya fue cancelada o rechazada.' };
      }
    }

    // 4. Determinar quien aprobo/rechazo para la columna SQL
    const aprobadaPor = (nuevoEstado === 'APROBADA' || nuevoEstado === 'RECHAZADA') ? usuarioId : null;
    
    // 5. Ejecutar actualizacion del estado actual en PostgreSQL
    const reservaActualizada = await reservasRepo.actualizarEstado(reservaId, nuevoEstado, motivoRechazo, aprobadaPor);

    // 6. Registrar el cambio de estado en MongoDB Atlas
    try {
      await EventoReserva.create({
        reservaId: Number(reservaId),
        tipoEvento: nuevoEstado, // 'APROBADA', 'RECHAZADA' o 'CANCELADA'
        actorId: usuarioId,
        actorEmail: usuarioEmail,
        metadata: {
          estadoAnterior: reserva.estado,
          motivoRechazo: motivoRechazo || null
        }
      });
    } catch (mongoError) {
      console.error('Estado actualizado en SQL, pero falló el log en MongoDB:', mongoError.message);
    }

    return reservaActualizada;
  },

  // Función 4: Consultar la linea de tiempo de una reserva desde MongoDB
  async obtenerHistorialReserva(reservaId, usuarioId, usuarioRol) {
    const reserva = await reservasRepo.obtenerPorId(reservaId);
    if (!reserva) {
      throw { status: 404, message: 'Reserva no encontrada.' };
    }

    const puedeConsultarTodas = usuarioRol === 'ADMIN' || usuarioRol === 'DOCENTE';
    if (reserva.usuario_id !== usuarioId && !puedeConsultarTodas) {
      throw { status: 403, message: 'No tienes permiso para consultar este historial.' };
    }

    // Busca todos los eventos de esa reserva y los ordena del mas antiguo al más reciente (1 = ascendente)
    const eventos = await EventoReserva.find({ reservaId: Number(reservaId) }).sort({ fecha: 1 });
    return eventos;
  }
};
