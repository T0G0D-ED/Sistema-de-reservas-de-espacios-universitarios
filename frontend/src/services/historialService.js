import { api } from "./api";

export function obtenerHistorial(reservaId) {
  return api.get(`/api/reservas/${reservaId}/historial`);
}
