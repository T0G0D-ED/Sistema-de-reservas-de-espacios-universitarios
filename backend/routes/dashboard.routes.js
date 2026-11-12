import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import pool from '../services/dbService.js';

const router = Router();

router.use(authMiddleware);
router.use((req, res, next) => {
  if (req.usuario.rol !== 'ADMIN' && req.usuario.rol !== 'DOCENTE') {
    return res.status(403).json({ error: 'No tienes permiso para consultar el dashboard.' });
  }
  next();
});

router.get('/utilizacion', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      WITH periodo AS (
        SELECT NOW() - INTERVAL '30 days' AS inicio, NOW() AS fin
      )
      SELECT
        e.id AS espacio_id,
        e.nombre AS espacio_nombre,
        e.tipo AS espacio_tipo,
        b.id AS edificio_id,
        b.nombre AS edificio_nombre,
        COUNT(r.id)::int AS reservas_activas,
        ROUND(COALESCE(SUM(
          EXTRACT(EPOCH FROM (
            LEAST(r.fecha_fin, periodo.fin) - GREATEST(r.fecha_inicio, periodo.inicio)
          )) / 3600
        ), 0)::numeric, 2) AS horas_reservadas
      FROM espacios e
      JOIN edificios b ON b.id = e.edificio_id
      CROSS JOIN periodo
      LEFT JOIN reservas r
        ON r.espacio_id = e.id
        AND r.estado IN ('PENDIENTE', 'APROBADA')
        AND r.fecha_inicio < periodo.fin
        AND r.fecha_fin > periodo.inicio
      WHERE e.disponible = true AND b.activo = true
      GROUP BY e.id, b.id
      ORDER BY b.nombre, e.nombre
    `);

    const porEdificio = new Map();
    let reservasActivas = 0;
    let horasReservadas = 0;

    const espacios = rows.map((row) => {
      const reservas = Number(row.reservas_activas);
      const horas = Number(row.horas_reservadas);
      reservasActivas += reservas;
      horasReservadas += horas;

      const edificio = porEdificio.get(row.edificio_id) || {
        id: row.edificio_id,
        nombre: row.edificio_nombre,
        espacios: 0,
        reservasActivas: 0,
        horasReservadas: 0,
      };
      edificio.espacios += 1;
      edificio.reservasActivas += reservas;
      edificio.horasReservadas += horas;
      porEdificio.set(row.edificio_id, edificio);

      return {
        id: row.espacio_id,
        nombre: row.espacio_nombre,
        tipo: row.espacio_tipo,
        edificioNombre: row.edificio_nombre,
        reservasActivas: reservas,
        horasReservadas: horas,
      };
    });

    res.json({
      periodoDias: 30,
      generadoEn: new Date().toISOString(),
      resumen: {
        espacios: espacios.length,
        reservasActivas,
        horasReservadas: Number(horasReservadas.toFixed(2)),
      },
      porEdificio: Array.from(porEdificio.values()).map((edificio) => ({
        ...edificio,
        horasReservadas: Number(edificio.horasReservadas.toFixed(2)),
      })),
      espacios,
    });
  } catch (error) {
    console.error('Error al consultar utilización:', error);
    res.status(500).json({ error: 'Error al obtener datos de utilización.' });
  }
});

export default router;
