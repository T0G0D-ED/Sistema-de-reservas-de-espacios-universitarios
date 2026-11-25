import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import pool from '../services/dbService.js';

const router = Router();
const tiposEspacio = new Set(['SALA', 'LABORATORIO', 'AUDITORIO', 'SALA_ESTUDIO']);

router.use(authMiddleware, (req, res, next) => {
  if (req.usuario.rol !== 'ADMIN') {
    return res.status(403).json({ error: 'Solo un administrador puede gestionar edificios y espacios.' });
  }
  next();
});

function validarId(id) {
  const numero = Number(id);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

function responderError(res, error, mensaje) {
  if (error.code === '23505') {
    return res.status(409).json({ error: 'Ya existe un registro con ese código o nombre.' });
  }
  if (error.code === 'INVALID_EQUIPMENT_ID') {
    return res.status(400).json({ error: 'El equipamiento indicado no pertenece a este espacio.' });
  }
  if (error.code === '23503') {
    return res.status(400).json({ error: 'El edificio seleccionado no existe o está inactivo.' });
  }
  if (error.code === '22001') {
    return res.status(400).json({ error: 'Uno de los campos supera la longitud permitida.' });
  }
  console.error(`${mensaje}:`, error);
  return res.status(500).json({ error: mensaje });
}

function validarEdificio(body = {}) {
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const codigo = typeof body.codigo === 'string' ? body.codigo.trim() : '';
  if (!nombre || nombre.length > 100 || !codigo || codigo.length > 20) return null;
  return {
    nombre,
    codigo,
    ubicacion: typeof body.ubicacion === 'string' ? body.ubicacion.trim() || null : null,
    descripcion: typeof body.descripcion === 'string' ? body.descripcion.trim() || null : null,
  };
}

function validarEquipamiento(equipamiento) {
  if (!Array.isArray(equipamiento) || equipamiento.length > 100) return null;

  const ids = new Set();
  const items = [];
  for (const item of equipamiento) {
    if (!item || typeof item !== 'object') return null;
    const nombre = typeof item.nombre === 'string' ? item.nombre.trim() : '';
    const tipo = typeof item.tipo === 'string' ? item.tipo.trim() : '';
    const cantidad = Number(item.cantidad);
    const id = item.id === undefined ? undefined : validarId(item.id);
    if (
      !nombre || nombre.length > 100 || !tipo || tipo.length > 50
      || !Number.isInteger(cantidad) || cantidad < 1
      || (item.id !== undefined && !id)
      || (id && ids.has(id))
    ) return null;

    if (id) ids.add(id);
    items.push({ id, nombre, tipo, cantidad });
  }
  return items;
}

function validarEspacio(body = {}) {
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const tipo = body.tipo;
  const edificioId = validarId(body.edificioId);
  const capacidad = Number(body.capacidad);
  const equipamiento = body.equipamiento === undefined
    ? undefined
    : validarEquipamiento(body.equipamiento);
  if (
    !nombre || nombre.length > 100 || !tiposEspacio.has(tipo)
    || !edificioId || !Number.isInteger(capacidad) || capacidad < 1
    || (body.equipamiento !== undefined && equipamiento === null)
  ) return null;

  return {
    nombre,
    tipo,
    edificioId,
    capacidad,
    ubicacion: typeof body.ubicacion === 'string' ? body.ubicacion.trim() || null : null,
    descripcion: typeof body.descripcion === 'string' ? body.descripcion.trim() || null : null,
    equipamiento,
  };
}

async function sincronizarEquipamiento(client, espacioId, equipamiento) {
  if (equipamiento === undefined) return;

  const idsGuardados = [];
  for (const item of equipamiento) {
    if (item.id) {
      const { rowCount } = await client.query(
        `UPDATE equipamiento
         SET nombre = $1, tipo = $2, cantidad = $3
         WHERE id = $4 AND espacio_id = $5`,
        [item.nombre, item.tipo, item.cantidad, item.id, espacioId]
      );
      if (!rowCount) {
        const error = new Error('El equipamiento indicado no pertenece a este espacio.');
        error.code = 'INVALID_EQUIPMENT_ID';
        throw error;
      }
      idsGuardados.push(item.id);
    } else {
      const { rows } = await client.query(
        `INSERT INTO equipamiento (espacio_id, nombre, tipo, cantidad)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [espacioId, item.nombre, item.tipo, item.cantidad]
      );
      idsGuardados.push(rows[0].id);
    }
  }

  await client.query(
    'DELETE FROM equipamiento WHERE espacio_id = $1 AND NOT (id = ANY($2::int[]))',
    [espacioId, idsGuardados]
  );
}

router.get('/edificios', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT b.id, b.nombre, b.codigo, b.ubicacion, b.descripcion, b.activo,
        COUNT(e.id)::int AS total_espacios,
        COUNT(e.id) FILTER (WHERE e.disponible = true)::int AS espacios_disponibles
      FROM edificios b
      LEFT JOIN espacios e ON e.edificio_id = b.id
      GROUP BY b.id
      ORDER BY b.nombre
    `);
    res.json(rows);
  } catch (error) {
    responderError(res, error, 'Error al obtener edificios.');
  }
});

router.post('/edificios', async (req, res) => {
  const edificio = validarEdificio(req.body);
  if (!edificio) return res.status(400).json({ error: 'Nombre y código válidos son obligatorios.' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO edificios (nombre, codigo, ubicacion, descripcion)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, codigo, ubicacion, descripcion, activo`,
      [edificio.nombre, edificio.codigo, edificio.ubicacion, edificio.descripcion]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    responderError(res, error, 'Error al crear el edificio.');
  }
});

router.put('/edificios/:id', async (req, res) => {
  const id = validarId(req.params.id);
  const edificio = validarEdificio(req.body);
  if (!id || !edificio) return res.status(400).json({ error: 'Datos del edificio inválidos.' });
  try {
    const { rows } = await pool.query(
      `UPDATE edificios
       SET nombre = $1, codigo = $2, ubicacion = $3, descripcion = $4
       WHERE id = $5
       RETURNING id, nombre, codigo, ubicacion, descripcion, activo`,
      [edificio.nombre, edificio.codigo, edificio.ubicacion, edificio.descripcion, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Edificio no encontrado.' });
    res.json(rows[0]);
  } catch (error) {
    responderError(res, error, 'Error al actualizar el edificio.');
  }
});

router.patch('/edificios/:id/activo', async (req, res) => {
  const id = validarId(req.params.id);
  if (!id || typeof req.body?.activo !== 'boolean') {
    return res.status(400).json({ error: 'El estado activo debe ser verdadero o falso.' });
  }
  try {
    const { rows } = await pool.query(
      'UPDATE edificios SET activo = $1 WHERE id = $2 RETURNING id, activo',
      [req.body.activo, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Edificio no encontrado.' });
    res.json(rows[0]);
  } catch (error) {
    responderError(res, error, 'Error al cambiar el estado del edificio.');
  }
});

router.get('/espacios', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.id, e.nombre, e.tipo, e.edificio_id, e.capacidad, e.ubicacion,
        e.descripcion, e.disponible, b.nombre AS edificio_nombre, b.activo AS edificio_activo,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', eq.id,
                'nombre', eq.nombre,
                'tipo', eq.tipo,
                'cantidad', eq.cantidad
              )
              ORDER BY eq.nombre
            )
            FROM equipamiento eq
            WHERE eq.espacio_id = e.id
          ),
          '[]'::json
        ) AS equipamiento
      FROM espacios e
      JOIN edificios b ON b.id = e.edificio_id
      ORDER BY b.nombre, e.nombre
    `);
    res.json(rows);
  } catch (error) {
    responderError(res, error, 'Error al obtener espacios.');
  }
});

router.post('/espacios', async (req, res) => {
  const espacio = validarEspacio(req.body);
  if (!espacio) return res.status(400).json({ error: 'Datos del espacio inválidos.' });
  if (espacio.equipamiento?.some((item) => item.id)) {
    return res.status(400).json({ error: 'Un espacio nuevo no puede reutilizar equipamiento existente.' });
  }
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO espacios (nombre, tipo, edificio_id, capacidad, ubicacion, descripcion)
       SELECT $1, $2::tipo_espacio, b.id, $4, $5, $6
       FROM edificios b
       WHERE b.id = $3 AND b.activo = true
       RETURNING id, nombre, tipo, edificio_id, capacidad, ubicacion, descripcion, disponible`,
      [espacio.nombre, espacio.tipo, espacio.edificioId, espacio.capacidad, espacio.ubicacion, espacio.descripcion]
    );
    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El edificio seleccionado no existe o está inactivo.' });
    }
    await sincronizarEquipamiento(client, rows[0].id, espacio.equipamiento);
    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error al revertir la creación del espacio:', rollbackError);
      }
    }
    responderError(res, error, 'Error al crear el espacio.');
  } finally {
    client?.release();
  }
});

router.put('/espacios/:id', async (req, res) => {
  const id = validarId(req.params.id);
  const espacio = validarEspacio(req.body);
  if (!id || !espacio) return res.status(400).json({ error: 'Datos del espacio inválidos.' });
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE espacios e
       SET nombre = $1, tipo = $2::tipo_espacio, edificio_id = b.id,
         capacidad = $4, ubicacion = $5, descripcion = $6
       FROM edificios b
       WHERE e.id = $7 AND b.id = $3 AND b.activo = true
       RETURNING e.id, e.nombre, e.tipo, e.edificio_id, e.capacidad,
         e.ubicacion, e.descripcion, e.disponible`,
      [espacio.nombre, espacio.tipo, espacio.edificioId, espacio.capacidad, espacio.ubicacion, espacio.descripcion, id]
    );
    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Espacio no encontrado o edificio inactivo.' });
    }
    await sincronizarEquipamiento(client, id, espacio.equipamiento);
    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error al revertir la actualización del espacio:', rollbackError);
      }
    }
    responderError(res, error, 'Error al actualizar el espacio.');
  } finally {
    client?.release();
  }
});

router.patch('/espacios/:id/disponible', async (req, res) => {
  const id = validarId(req.params.id);
  if (!id || typeof req.body?.disponible !== 'boolean') {
    return res.status(400).json({ error: 'La disponibilidad debe ser verdadera o falsa.' });
  }
  try {
    const { rows } = await pool.query(
      'UPDATE espacios SET disponible = $1 WHERE id = $2 RETURNING id, disponible',
      [req.body.disponible, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Espacio no encontrado.' });
    res.json(rows[0]);
  } catch (error) {
    responderError(res, error, 'Error al cambiar la disponibilidad del espacio.');
  }
});

export default router;
