import axios from 'axios'; // Solicitudes http

// Para guardar datos localmente en el movil 
import AsyncStorage from '@react-native-async-storage/async-storage';

// En movil localhost no funciona.
// Usar IP de computador en la red local 
const API_URL = 'http://192.168.1.5'; 

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor: inyecta token desde AsyncStorage
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: maneja errores (401 = token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('usuario');
    }
    return Promise.reject(error);
  }
);

export default api;