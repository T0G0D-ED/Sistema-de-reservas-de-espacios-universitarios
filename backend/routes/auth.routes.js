// Rutas de autenticacion
// Maneja los endpoints de registro y login 

import { Router } from 'express';
// Importar el servicio de autenticacion 
import { authService } from '../services/auth.service.js';

// Crear instancia del router de express
// Todas las rutas definidas aqui se agruparan bajo /api/auth
const router = Router();

/**
 * @swagger
 * /api/auth/registro:
 *   post:
 *     summary: Registrar una nueva cuenta de estudiante
 *     tags: [Autenticación]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: juan.perez@unab.cl
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Faltan campos obligatorios
 *       409:
 *         description: El correo ya está registrado
 */
// Ruta 1: Crear una nueva cuenta  
// Endpoint: POST /api/auth/registro
router.post('/registro', async (req, res, next) => {
// 1. Extraer los datos que el cliente envio en el cuerpo JSON de la peticion 
  try {
    const { nombre, email, password } = req.body;
    
    // 2. Validacion basica que campos no esten vacios antes de tocar la base de datos 
    // Si faltan datos obligatorios se corta aqui y devuelve error 400
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y password son obligatorios.' });
    }

		//3. Llamar al servicio auth para hacer las tareas pesadas 
		// await para que se espere a que la operacion de BD termine 
    const usuario = await authService.registrar(nombre, email, password);
    // 4. Responder con codigo 201 creado y los datos publicos del usuario creado  
    res.status(201).json(usuario);
    
    // 5. Manejo de errores
    // El servicio lanza objetos de error, si es definido como 409 o 401 se usa
    // Si es interno por la BD o por el estilo se usa 500 error interno
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener token JWT
 *     tags: [Autenticación]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 usuario:
 *                   type: object
 *       401:
 *         description: Credenciales inválidas
 */
// Ruta 2: Iniciar sesion y obtener el token
// Endpoint: POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
	  // 1. Extraer identificador y contraseña del JSON enviado por el usuario
    const { identificador, email, password } = req.body;
    const login = identificador || email;
		
		// 2. Verificar que campos vengan presentes 
    if (!login || !password) {
      return res.status(400).json({ error: 'Usuario/correo y contraseña son obligatorios.' });
    }

		// 3. Se delega la verificacion y creacion del jwt al auth service
    const data = await authService.login(login, password);
    
    // 4. Se responde con codigo de exito 200 entregando el token, usuario
    res.json(data);
  } catch (error) {
	  // Si fallan las credenciales se atrapa el status 401 del servicio 
    next(error);
  }
});

// Exportar el router para conectarlo en backend/index.js
export default router;
