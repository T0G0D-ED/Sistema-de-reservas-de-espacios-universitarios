import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Quita barras finales y un posible '/api' accidental en la variable de entorno
const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:3000"
).replace(/\/+(api\/?)?$/, "");


let authToken = null;
let onUnauthorizedCallback = null;

// Guarda o borra el token de forma asincrona en memoria y AsyncStorage
export async function setAuthToken(token) {
  authToken = token;
  if (token) {
    await AsyncStorage.setItem("token", token);
  } else {
    await AsyncStorage.removeItem("token");
  }
}

// Permite que AuthContext / App.js reaccionen si el token expira (401)
export function setOnUnauthorized(callback) {
  onUnauthorizedCallback = callback;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de peticion: inyecta token desde memoria o AsyncStorage
api.interceptors.request.use(
  async (config) => {
    const token = authToken || (await AsyncStorage.getItem("token"));
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: extrae .data y maneja errores HTTP + expiracion 401
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error.response?.status;
    if (status === 401) {
      authToken = null;
      try {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("usuario");
      } catch {
        // Ignoramos errores de almacenamiento para no ocultar el error HTTP original
      }
      if (onUnauthorizedCallback) {
        await onUnauthorizedCallback();
      }
    }
    const message =
      error.response?.data?.error ||
      error.message ||
      `Error HTTP: ${status || "desconocido"}`;
    return Promise.reject(new Error(message));
  }
);

// Mantiene la compatibilidad exacta con todos los servicios existentes
export function get(endpoint) {
  return api.get(endpoint);
}

export function post(endpoint, data) {
  return api.post(endpoint, data);
}

export function put(endpoint, data) {
  return api.put(endpoint, data);
}

export function patch(endpoint, data) {
  return api.patch(endpoint, data);
}

export default api;
