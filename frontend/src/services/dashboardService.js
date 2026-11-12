import { api } from "./api";

export function obtenerUtilizacion() {
  return api.get("/api/dashboard/utilizacion");
}
