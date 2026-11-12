import { api } from "./api";

export function listarReservas() {
  return api.get("/api/reservas");
}

export function crearReserva({ espacioId, fechaInicio, fechaFin, motivo }) {
  return api.post("/api/reservas", { espacioId, fechaInicio, fechaFin, motivo });
}

export function cancelarReserva(id) {
  return api.patch(`/api/reservas/${id}/estado`, { nuevoEstado: "CANCELADA" });
}

export function actualizarEstadoReserva(id, nuevoEstado, motivoRechazo) {
  return api.patch(`/api/reservas/${id}/estado`, { nuevoEstado, motivoRechazo });
}
