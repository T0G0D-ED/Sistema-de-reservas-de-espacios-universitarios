import { api } from "./api";

export function listarEspacios() {
  return api.get("/api/espacios");
}
