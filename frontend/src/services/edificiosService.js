import { api } from "./api";

export function listarEdificios() {
  return api.get("/api/edificios");
}
