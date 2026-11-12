import { Router } from 'express';
import pool from '../services/dbService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js'; // 1. IMPORTAR EL MIDDLEWARE

const router = Router();

// GET /api/espacios - Listar todos los espacios (AHORA PROTEGIDO)
// 2. AGREGAR authMiddleware como segundo argumento, antes de la funcion async
// Express ejecutara primero authMiddleware, si el token es valido, llamara a next() y entrara al codigo.
router.get('/', authMiddleware, async (req, res) => {
  try {
    // 3. Comprobar identidad, Se vera en la consola quien hizo la peticion
    console.log('Usuario autenticado:', req.usuario.email, '| Rol:', req.usuario.rol);
    
    const query = `
      SELECT e.*, b.nombre AS edificio_nombre, b.codigo AS edificio_codigo
      FROM espacios e
      JOIN edificios b ON b.id = e.edificio_id
      WHERE e.disponible = true
      ORDER BY e.nombre
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error al listar espacios:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;