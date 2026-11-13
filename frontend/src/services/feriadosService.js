import { api } from "./api";

// El backend consulta la fuente externa y aplica el respaldo cuando no está disponible.
export function getFeriados(anio) {
  return api.get(`/api/feriados/${anio}`);
}
