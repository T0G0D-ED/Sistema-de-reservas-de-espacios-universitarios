// Rutas de autenticacion
// Maneja los endpoints de registro y login 

import { Router } from 'express';
// Importar el servicio de autenticacion 
import { authService } from '../services/auth.service.js';

// Crear instancia del router de express
// Todas las rutas definidas aqui se agruparan bajo /api/auth
const router = Router();

// Ruta 1: Crear una nueva cuenta  
// Endpoint: POST /api/auth/registro
router.post('/registro', async (req, res) => {
// 1. Extraer los datos que el cliente envio en el cuerpo JSON de la peticion 
  try {
    const { nombre, email, password, rol } = req.body;
    
    // 2. Validacion basica que campos no esten vacios antes de tocar la base de datos 
    // Si faltan datos obligatorios se corta aqui y devuelve error 400
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y password son obligatorios.' });
    }

		//3. Llamar al servicio auth para hacer las tareas pesadas 
		// await para que se espere a que la operacion de BD termine 
    const usuario = await authService.registrar(nombre, email, password, rol);
    // 4. Responder con codigo 201 creado y los datos publicos del usuario creado  
    res.status(201).json(usuario);
    
    // 5. Manejo de errores
    // El servicio lanza objetos de error, si es definido como 409 o 401 se usa
    // Si es interno por la BD o por el estilo se usa 500 error interno
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Error interno del servidor' });
  }
});


// Ruta 2: Iniciar sesion y obtener el token
// Endpoint: POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
	  // 1. Extraer correo y contraseña del JSON enviado por el usuario 
    const { email, password } = req.body;
		
		// 2. Verificar que campos vengan presentes 
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son obligatorios.' });
    }

		// 3. Se delega la verificacion y creacion del jwt al auth service
    const data = await authService.login(email, password);
    
    // 4. Se responde con codigo de exito 200 entregando el token, usuario
    res.json(data);
  } catch (error) {
	  // Si fallan las credenciales se atrapa el status 401 del servicio 
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Error interno del servidor' });
  }
});

// Exportar el router para conectarlo en backend/index.js
export default router;