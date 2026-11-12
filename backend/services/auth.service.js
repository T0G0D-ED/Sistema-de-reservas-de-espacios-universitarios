// Para hashear claves que se guardan cifradas
import bcrypt from 'bcryptjs'; 
// Genera los tokens
import jwt from 'jsonwebtoken';
// Conexion a Postgre 
import pool from './dbService.js';

//Crear usuario nuevo 
export const authService = {
	// Funcion para registrar usuario nuevo en la BD
  async registrar(nombre, email, password) {
    // 1. Verificar si el usuario ya existe para evitar duplicados
    // $1 como parametro para evitar inyecciones sql
    const { rows } = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (rows.length > 0) {
      throw { status: 409, message: 'El correo ya está registrado.' };
    }

    // 2. Encriptar contraseña antes de guardar 
    // genSalt(10) para generar una cadena random que hace que dos contraseñas iguales tengan hashes distintos
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insertar usuario en Postgre
    // Returning devuelve los datos recien creados, deja fuera el password_hash
    const query = `
      INSERT INTO usuarios (nombre, email, password_hash, rol)
      VALUES ($1, $2, $3, 'ESTUDIANTE')
      RETURNING id, nombre, email, rol
    `;
    const { rows: nuevoUsuario } = await pool.query(query, [nombre, email, passwordHash]);
    return nuevoUsuario[0];
  },

	//Funcion para validar credenciales y entregar el pase de acceso token
  async login(identificador, password) {
    // 1. Buscar usuario por correo o nombre de usuario.
    const { rows } = await pool.query(
      `SELECT id, nombre, email, rol, password_hash
       FROM usuarios
       WHERE activo = TRUE AND (email = $1 OR username = $1)
       ORDER BY CASE WHEN username = $1 THEN 0 ELSE 1 END
       LIMIT 1`,
      [identificador]
    );
    
    // Si correo no existe devuelve error
    if (rows.length === 0) {
      throw { status: 401, message: 'Credenciales inválidas.' };
    }
    const usuario = rows[0];


    // 2. Comparar contraseñas que escribio el usuario con el hash guardado en PG
    // bcrypt hace que se desencripte de manera interna la logica y devuelve t/f
    const esValida = await bcrypt.compare(password, usuario.password_hash);
    if (!esValida) {
      throw { status: 401, message: 'Credenciales inválidas.' };
    }

		 
    // 3. Preparar los datos publicos que iran dentro del token JWT
    // Nunca meter datos sensibles porque se puede leer facil en payload
    const payload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    };

		// 4. Firmar y fabricar el token usando la clave secreta del env
    const token = jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: process.env.JWT_EXPIRES_IN || '8h' 
    });

		// Devolver el token con los datos basicos del usuario para que el frontend los guarde
    return {
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    };
  }
};