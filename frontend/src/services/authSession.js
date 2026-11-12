const SESSION_KEYS = {
  token: "reservaunab.token",
  id: "reservaunab.user.id",
  nombre: "reservaunab.user.nombre",
  email: "reservaunab.user.email",
  rol: "reservaunab.user.rol",
};

export function getAuthToken() {
  return localStorage.getItem(SESSION_KEYS.token);
}

export function getSession() {
  const token = getAuthToken();
  const id = localStorage.getItem(SESSION_KEYS.id);
  const nombre = localStorage.getItem(SESSION_KEYS.nombre);
  const email = localStorage.getItem(SESSION_KEYS.email);
  const rol = localStorage.getItem(SESSION_KEYS.rol);
  const userId = Number(id);

  if (!token || !Number.isInteger(userId) || !nombre || !email || !rol) return null;

  return {
    token,
    usuario: { id: userId, nombre, email, rol },
  };
}

export function saveSession(session) {
  const usuario = session?.usuario;
  if (!session?.token || !usuario?.id || !usuario.nombre || !usuario.email || !usuario.rol) {
    throw new Error("La respuesta de autenticación no contiene una sesión válida.");
  }

  localStorage.setItem(SESSION_KEYS.token, session.token);
  localStorage.setItem(SESSION_KEYS.id, String(usuario.id));
  localStorage.setItem(SESSION_KEYS.nombre, usuario.nombre);
  localStorage.setItem(SESSION_KEYS.email, usuario.email);
  localStorage.setItem(SESSION_KEYS.rol, usuario.rol);
}

export function clearSession() {
  Object.values(SESSION_KEYS).forEach((key) => localStorage.removeItem(key));
}
