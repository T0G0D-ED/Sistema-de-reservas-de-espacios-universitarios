import assert from "node:assert/strict";
import test from "node:test";
import { crearReservasService } from "../services/reservas.service.js";

const fechaInicio = "2026-11-16T10:00:00";
const fechaFin = "2026-11-16T11:00:00";

function crearServicio({ conflicto = null, reserva = null, diaHabil = true } = {}) {
  const llamadas = {
    buscarConflicto: 0,
    crear: 0,
    actualizarEstado: [],
    eventos: [],
  };

  const reservaActual = reserva ?? {
    id: 8,
    usuario_id: 15,
    estado: "PENDIENTE",
  };

  const repository = {
    async buscarConflicto() {
      llamadas.buscarConflicto += 1;
      return conflicto;
    },
    async crear(...datos) {
      llamadas.crear += 1;
      llamadas.datosReserva = datos;
      return {
        id: 21,
        usuario_id: datos[0],
        espacio_id: datos[1],
        estado: "PENDIENTE",
        motivo: datos[4],
      };
    },
    async obtenerPorId() {
      return reservaActual;
    },
    async actualizarEstado(...datos) {
      llamadas.actualizarEstado.push(datos);
      return { ...reservaActual, estado: datos[1] };
    },
    async listarPorUsuario() {
      return [];
    },
    async listarTodas() {
      return [];
    },
  };

  const auditModel = {
    async create(evento) {
      llamadas.eventos.push(evento);
      return evento;
    },
    find() {
      return { sort: async () => [] };
    },
  };

  const service = crearReservasService({
    repository,
    auditModel,
    checkBusinessDay: async () => ({
      esHabil: diaHabil,
      motivo: diaHabil ? "Día hábil" : "La fecha corresponde a un feriado",
    }),
  });

  return { service, llamadas };
}

test("rechaza una reserva si la hora de término no es posterior", async () => {
  const { service, llamadas } = crearServicio();

  await assert.rejects(
    service.crearReserva(15, "alumno@unab.cl", 3, fechaFin, fechaInicio, "Estudio"),
    (error) => error.status === 400
  );

  assert.equal(llamadas.buscarConflicto, 0);
  assert.equal(llamadas.crear, 0);
});

test("rechaza una reserva en un día no hábil", async () => {
  const { service, llamadas } = crearServicio({ diaHabil: false });

  await assert.rejects(
    service.crearReserva(15, "alumno@unab.cl", 3, fechaInicio, fechaFin, "Estudio"),
    (error) => error.status === 400 && error.message.includes("feriado")
  );

  assert.equal(llamadas.buscarConflicto, 0);
  assert.equal(llamadas.crear, 0);
});

test("no guarda una solicitud cuando el horario ya está ocupado", async () => {
  const { service, llamadas } = crearServicio({
    conflicto: { estado: "APROBADA" },
  });

  await assert.rejects(
    service.crearReserva(15, "alumno@unab.cl", 3, fechaInicio, fechaFin, "Estudio"),
    (error) => error.status === 409
  );

  assert.equal(llamadas.crear, 0);
  assert.equal(llamadas.eventos.length, 0);
});

test("guarda la solicitud pendiente y registra su evento", async () => {
  const { service, llamadas } = crearServicio();

  const reserva = await service.crearReserva(
    15,
    "alumno@unab.cl",
    3,
    fechaInicio,
    fechaFin,
    "Estudio grupal",
    "Sala B-101"
  );

  assert.equal(reserva.estado, "PENDIENTE");
  assert.equal(llamadas.crear, 1);
  assert.equal(llamadas.eventos.length, 1);
  assert.equal(llamadas.eventos[0].reservaId, reserva.id);
  assert.equal(llamadas.eventos[0].tipoEvento, "CREADA");
  assert.equal(llamadas.eventos[0].metadata.espacioNombre, "Sala B-101");
});

test("impide que un estudiante apruebe una solicitud", async () => {
  const { service, llamadas } = crearServicio();

  await assert.rejects(
    service.cambiarEstado(15, "alumno@unab.cl", "ESTUDIANTE", 8, "APROBADA"),
    (error) => error.status === 403
  );

  assert.equal(llamadas.actualizarEstado.length, 0);
  assert.equal(llamadas.eventos.length, 0);
});

test("exige un motivo para rechazar una solicitud", async () => {
  const { service, llamadas } = crearServicio();

  await assert.rejects(
    service.cambiarEstado(2, "admin@unab.cl", "ADMIN", 8, "RECHAZADA"),
    (error) => error.status === 400 && error.message.includes("motivo")
  );

  assert.equal(llamadas.actualizarEstado.length, 0);
});

test("registra quién aprobó la solicitud y el cambio en auditoría", async () => {
  const { service, llamadas } = crearServicio();

  const reserva = await service.cambiarEstado(
    2,
    "admin@unab.cl",
    "ADMIN",
    8,
    "APROBADA"
  );

  assert.equal(reserva.estado, "APROBADA");
  assert.deepEqual(llamadas.actualizarEstado[0], [8, "APROBADA", null, 2]);
  assert.equal(llamadas.eventos[0].tipoEvento, "APROBADA");
  assert.equal(llamadas.eventos[0].metadata.estadoAnterior, "PENDIENTE");
});

test("impide que otra persona cancele una reserva ajena", async () => {
  const { service, llamadas } = crearServicio({
    reserva: { id: 8, usuario_id: 15, estado: "APROBADA" },
  });

  await assert.rejects(
    service.cambiarEstado(19, "otra@unab.cl", "ESTUDIANTE", 8, "CANCELADA"),
    (error) => error.status === 403
  );

  assert.equal(llamadas.actualizarEstado.length, 0);
  assert.equal(llamadas.eventos.length, 0);
});
