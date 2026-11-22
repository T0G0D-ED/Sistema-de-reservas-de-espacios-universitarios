import { get } from "./api";

export function obtenerHistorial(reservaId) {
  return get(`/api/reservas/${reservaId}/historial`);
}
