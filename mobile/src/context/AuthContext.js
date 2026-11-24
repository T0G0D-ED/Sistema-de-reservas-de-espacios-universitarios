import { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { iniciarSesion as iniciarSesionService } from "../services/authService";
import { setAuthToken, setOnUnauthorized } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [iniciandoSesion, setIniciandoSesion] = useState(false);
  const [errorSesion, setErrorSesion] = useState("");

  const cerrarSesion = useCallback(async () => {
    // 1. Actualiza la UI inmediatamente sin esperar a AsyncStorage
    setUsuario(null);
    setErrorSesion("");
    try {
      await setAuthToken(null);
      await AsyncStorage.removeItem("usuario");
    } catch {
      // Ignoramos errores de almacenamiento al limpiar sesion
    }
  }, []);

  // 2. Restaura la sesion guardada y limpia estados huerfanos (token sin usuario o viceversa)
  useEffect(() => {
    let activo = true;

    async function restaurarSesion() {
      try {
        const [tokenGuardado, usuarioGuardado] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("usuario"),
        ]);

        if (!activo) return;

        if (tokenGuardado && usuarioGuardado) {
          const usuarioParseado = JSON.parse(usuarioGuardado);
          await setAuthToken(tokenGuardado);
          setUsuario(usuarioParseado);
        } else if (tokenGuardado || usuarioGuardado) {
          // Sesion incompleta o huerfana: limpiar todo
          await cerrarSesion();
        }
      } catch {
        if (activo) {
          await cerrarSesion();
        }
      } finally {
        if (activo) {
          setCargandoAuth(false);
        }
      }
    }

    // Devuelve la promesa para que el interceptor 401 de api.js pueda esperarla
    setOnUnauthorized(() => cerrarSesion());

    restaurarSesion();

    return () => {
      activo = false;
      setOnUnauthorized(null);
    };
  }, [cerrarSesion]);

  const autenticar = useCallback(async ({ identificador, password }) => {
    setIniciandoSesion(true);
    setErrorSesion("");
    try {
      const session = await iniciarSesionService(identificador, password);
      if (!session?.token || !session.usuario) {
        throw new Error("La respuesta de inicio de sesión no es válida.");
      }

      await setAuthToken(session.token);
      await AsyncStorage.setItem("usuario", JSON.stringify(session.usuario));
      setUsuario(session.usuario);
      return true;
    } catch (err) {
      // 3. Si falla el login o el guardado en AsyncStorage, revierte cualquier token parcial
      try {
        await setAuthToken(null);
        await AsyncStorage.removeItem("usuario");
      } catch {
        // Ignoramos errores secundarios de limpieza
      }
      setUsuario(null);
      setErrorSesion(
        err instanceof Error ? err.message : "No se pudo iniciar sesión."
      );
      return false;
    } finally {
      setIniciandoSesion(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargandoAuth,
        iniciandoSesion,
        errorSesion,
        autenticar,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
