import { get } from "./api";

export function obtenerUtilizacion() {
  return get("/api/dashboard/utilizacion");
}
