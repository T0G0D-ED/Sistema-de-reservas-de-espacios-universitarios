import { get } from "./api";

export function listarEdificios() {
  return get("/api/edificios");
}
