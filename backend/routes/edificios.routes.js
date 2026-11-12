import { Router } from 'express';
import pool from '../services/dbService.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        b.id, b.nombre, b.codigo, b.ubicacion, b.descripcion,
        COUNT(e.id)::int AS total_espacios,
        COUNT(e.id) FILTER (WHERE e.disponible = true)::int AS espacios_disponibles
      FROM edificios b
      LEFT JOIN espacios e ON e.edificio_id = b.id
      WHERE b.activo = true
      GROUP BY b.id
      ORDER BY b.nombre
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al listar edificios:', error);
    res.status(500).json({ error: 'Error al obtener edificios.' });
  }
});

export default router;
