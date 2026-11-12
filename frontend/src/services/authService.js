import { api } from "./api";
import { clearSession, saveSession } from "./authSession";

export async function iniciarSesion(credenciales) {
  const session = await api.post("/api/auth/login", credenciales);
  saveSession(session);
  return session;
}

export async function registrarUsuario(datos) {
  await api.post("/api/auth/registro", datos);
  return iniciarSesion({
    identificador: datos.email,
    password: datos.password,
  });
}

export function cerrarSesion() {
  clearSession();
}
