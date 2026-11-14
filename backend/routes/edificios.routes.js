import { Router } from 'express';
import pool from '../services/dbService.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        b.id, b.nombre, b.codigo, b.ubicacion, b.descripcion,
        COUNT(e.id)::int AS total_espacios,
        COUNT(e.id) FILTER (WHERE e.disponible = true)::int AS espacios_disponibles,
        COUNT(e.id) FILTER (
          WHERE EXISTS (
            SELECT 1
            FROM reservas r
            WHERE r.espacio_id = e.id
              AND r.estado = 'APROBADA'
              AND r.fecha_inicio <= CURRENT_TIMESTAMP
              AND r.fecha_fin > CURRENT_TIMESTAMP
          )
        )::int AS espacios_en_uso,
        COUNT(e.id) FILTER (
          WHERE e.disponible = true
            AND NOT EXISTS (
              SELECT 1
              FROM reservas r
              WHERE r.espacio_id = e.id
                AND r.estado = 'APROBADA'
                AND r.fecha_inicio <= CURRENT_TIMESTAMP
                AND r.fecha_fin > CURRENT_TIMESTAMP
            )
        )::int AS espacios_libres,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', e.id,
              'nombre', e.nombre,
              'tipo', e.tipo,
              'capacidad', e.capacidad,
              'ubicacion', e.ubicacion,
              'disponible', e.disponible,
              'en_uso', EXISTS (
                SELECT 1
                FROM reservas r
                WHERE r.espacio_id = e.id
                  AND r.estado = 'APROBADA'
                  AND r.fecha_inicio <= CURRENT_TIMESTAMP
                  AND r.fecha_fin > CURRENT_TIMESTAMP
              )
            ) ORDER BY e.nombre
          ) FILTER (WHERE e.id IS NOT NULL),
          '[]'::jsonb
        ) AS espacios
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
