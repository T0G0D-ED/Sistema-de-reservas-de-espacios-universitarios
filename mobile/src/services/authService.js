import { post } from "./api";

export function iniciarSesion(identificador, password) {
  return post("/api/auth/login", { identificador, password });
}
