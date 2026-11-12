import { useState } from "react";
import {
  cerrarSesion as limpiarSesion,
  iniciarSesion as iniciarSesionService,
  registrarUsuario as registrarUsuarioService,
} from "../services/authService";
import { getSession } from "../services/authSession";

export function useAuth() {
  const [sesion, setSesion] = useState(getSession);
  const [authAbierta, setAuthAbierta] = useState(false);

  async function iniciarSesion(credenciales) {
    const nuevaSesion = await iniciarSesionService(credenciales);
    setSesion(nuevaSesion);
    return nuevaSesion;
  }

  async function registrarUsuario(datos) {
    const nuevaSesion = await registrarUsuarioService(datos);
    setSesion(nuevaSesion);
    return nuevaSesion;
  }

  function cerrarSesion() {
    limpiarSesion();
    setSesion(null);
  }

  return {
    sesion,
    authAbierta,
    abrirAuth: () => setAuthAbierta(true),
    cerrarAuth: () => setAuthAbierta(false),
    iniciarSesion,
    registrarUsuario,
    cerrarSesion,
  };
}
