import { Router } from 'express';
import { obtenerFeriadosDelAno } from '../utils/feriados.js';

const router = Router();

/**
 * @swagger
 * /api/feriados/{anio}:
 *   get:
 *     summary: Consultar los feriados de un año
 *     description: Devuelve feriados para mostrar en el formulario de reservas. La validación del backend sigue siendo la que determina si una reserva puede guardarse.
 *     security: []
 *     tags: [Feriados]
 *     parameters:
 *       - in: path
 *         name: anio
 *         required: true
 *         schema:
 *           type: integer
 *         description: Año que se desea consultar.
 *     responses:
 *       200:
 *         description: Feriados del año y origen de los datos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 anio:
 *                   type: integer
 *                 fuente:
 *                   type: string
 *                   enum: [api, respaldo]
 *                 feriados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fecha:
 *                         type: string
 *                         example: '2026-09-18'
 *                       nombre:
 *                         type: string
 *                         example: Independencia Nacional
 *       400:
 *         description: El año no es válido.
 */
router.get('/:anio', async (req, res, next) => {
  const anio = Number(req.params.anio);
  if (!Number.isInteger(anio) || anio < 1900 || anio > 2200) {
    return res.status(400).json({ error: 'El año debe ser un número entre 1900 y 2200.' });
  }

  try {
    res.json(await obtenerFeriadosDelAno(anio));
  } catch (error) {
    next(error);
  }
});

export default router;
