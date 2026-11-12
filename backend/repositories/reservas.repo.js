import pool from '../services/dbService.js';

export const reservasRepo = {
	// 1. Detectar choques de horario (regla de negocio critica)
	// Ya hay reserva activa en esta sala que se cruce cone estas nuevas fechas?
  async buscarConflicto(espacioId, fechaInicio, fechaFin) {
    const query = `
      SELECT id, fecha_inicio, fecha_fin, estado 
      FROM reservas 
      WHERE espacio_id = $1  -- 1. Solo se mira la MISMA sala
        AND estado IN ('PENDIENTE', 'APROBADA') -- 2. Solo importan reservas activas. Ignorar las canceladas/rechazadas
        AND fecha_inicio < $3  -- 3. La existente empieza antes de que termine la nueva
        AND fecha_fin > $2     -- 4. La existente termina después de que empiece la nueva
      LIMIT 1                  -- 5. Con encontrar 1 conflicto ya se detecta duplicidad
    `;
    const { rows } = await pool.query(query, [espacioId, fechaInicio, fechaFin]);
    // Si hay conflicto, retorna el objeto de esa reserva. Si no, retorna null.
    return rows[0] || null; 
  },

  // 2. Crear una nueva reserva
  // el usuario solicita y el admin aprueba o rechaza 
  async crear(usuarioId, espacioId, fechaInicio, fechaFin, motivo) {
    const query = `
      INSERT INTO reservas (usuario_id, espacio_id, fecha_inicio, fecha_fin, estado, motivo)
      VALUES ($1, $2, $3, $4, 'PENDIENTE', $5)
      RETURNING id, usuario_id, espacio_id, fecha_inicio, fecha_fin, estado, motivo, created_at
    `;
    const { rows } = await pool.query(query, [usuarioId, espacioId, fechaInicio, fechaFin, motivo]);
    return rows[0];
  },

  // 3. Listar reservas de un usuario (con JOIN para mostrar nombres en lugar de ids (Sala B-203 (Edificio B))
  // El frontend necesita mostrar Mis Reservas pero la tabla reservas
  async listarPorUsuario(usuarioId) {
    const query = `
      SELECT 
        r.id, r.usuario_id, r.fecha_inicio, r.fecha_fin, r.estado, r.motivo, r.motivo_rechazo, r.created_at,
        u.nombre AS usuario_nombre, u.email AS usuario_email,
        e.nombre AS espacio_nombre, e.tipo AS espacio_tipo,
        ed.nombre AS edificio_nombre
      FROM reservas r
      JOIN usuarios u ON u.id = r.usuario_id
      JOIN espacios e ON e.id = r.espacio_id
      JOIN edificios ed ON ed.id = e.edificio_id
      WHERE r.usuario_id = $1
      ORDER BY r.fecha_inicio DESC
    `;
    const { rows } = await pool.query(query, [usuarioId]);
    return rows;
  },

  async listarTodas() {
    const query = `
      SELECT
        r.id, r.usuario_id, r.fecha_inicio, r.fecha_fin, r.estado, r.motivo,
        r.motivo_rechazo, r.created_at,
        u.nombre AS usuario_nombre, u.email AS usuario_email,
        e.nombre AS espacio_nombre, e.tipo AS espacio_tipo,
        ed.nombre AS edificio_nombre
      FROM reservas r
      JOIN usuarios u ON u.id = r.usuario_id
      JOIN espacios e ON e.id = r.espacio_id
      JOIN edificios ed ON ed.id = e.edificio_id
      ORDER BY r.fecha_inicio DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  // 4. Actualizar estado (Para aprobar, rechazar o cancelar)
  // Modifica el estado de una reserva existente
  // NOW() marca cuándo ocurrió la acción para auditoria
  async actualizarEstado(reservaId, nuevoEstado, motivoRechazo = null, aprobadaPor = null) {
    const query = `
      UPDATE reservas 
      SET estado = $1, motivo_rechazo = $2, aprobada_por = $3
      WHERE id = $4
      RETURNING *
    `;
    const { rows } = await pool.query(query, [nuevoEstado, motivoRechazo, aprobadaPor, reservaId]);
    return rows[0];
  },

  // 5. Obtener reserva por ID (para validar permisos antes de cancelar/aprobar)
  // Ejemplo: "¿Puede este usuario cancelar esta reserva?"
  // Solo puede si el es el usuario_id de esa reserva.
  async obtenerPorId(reservaId) {
    const query = `SELECT * FROM reservas WHERE id = $1`;
    const { rows } = await pool.query(query, [reservaId]);
    return rows[0] || null;
  }
};