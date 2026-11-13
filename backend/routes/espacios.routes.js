import { Router } from 'express';
import pool from '../services/dbService.js';

const router = Router();

// GET /api/espacios - Listar todos los espacios (Público)
router.get('/', async (req, res, next) => {
  try {
    const query = `
      SELECT e.*, b.nombre AS edificio_nombre, b.codigo AS edificio_codigo
      FROM espacios e
      JOIN edificios b ON b.id = e.edificio_id
      WHERE e.disponible = true AND b.activo = true
      ORDER BY e.nombre
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    next(err); // En lugar de console.error + res.status(500), pasar al middleware global
  }
});

export default router;
