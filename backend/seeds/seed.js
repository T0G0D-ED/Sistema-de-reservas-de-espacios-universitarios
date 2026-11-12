// Importar pool que es el puente de conexion configurado para comunicar con Postgres
import pool from '../services/dbService.js';
// Importar bcrypt para poder encriptar claves
import bcrypt from 'bcrypt';

// Funcion async para la conexion a la base de datos que toma tiempo
// Node.js espera que cada consulta termine antes de seguir con la otra
async function seed() {
  console.log('Insertando datos de prueba...');

  try {
    // 1. Usuarios (Admin, Estudiante y Docente)
    // Generamos los hashes para las contraseñas de prueba
    const hashAdmin = await bcrypt.hash('admin', 10);
    const hashEstudiante = await bcrypt.hash('estudiante123', 10);
    const hashDocente = await bcrypt.hash('docente123', 10);
    
    // Insertamos los 3 usuarios. 
    // ON CONFLICT DO UPDATE asegura que si el email ya existe, se actualice el hash y el rol 
    // (soluciona el error 401 si se ejecutó un seed anterior con contraseñas diferentes).
    await pool.query(
      `INSERT INTO usuarios (nombre, email, username, password_hash, rol) VALUES
        ('Administrador', 'admin@unab.cl', 'admin', $1, 'ADMIN'),
        ('Juan Pérez', 'estudiante@unab.cl', NULL, $2, 'ESTUDIANTE'),
        ('María López', 'docente@unab.cl', NULL, $3, 'DOCENTE')
       ON CONFLICT (email) DO UPDATE 
       SET username = EXCLUDED.username,
           password_hash = EXCLUDED.password_hash,
           rol = EXCLUDED.rol`,
      [hashAdmin, hashEstudiante, hashDocente]
    );

    // 2. Edificios
    // Insertar dos filas en la tabla edificios en una sola consulta.
    // ON CONFLICT (codigo) DO NOTHING asegura que si los codigos B o C ya existen, no se dupliquen.
    await pool.query(`
      INSERT INTO edificios (nombre, codigo, ubicacion) VALUES
        ('Edificio B', 'B', 'Campus Providencia'),
        ('Edificio C Central', 'C', 'Campus Providencia')
      ON CONFLICT (codigo) DO NOTHING
    `);

    // 3. Espacios de muestra. Se omiten los que ya existen para que el seed sea repetible.
    const espacios = [
      ['Sala B-101', 'SALA', 'B', 40, 'Piso 1, ala norte', 'Sala de clases con proyector y pizarrón.'],
      ['Sala B-203', 'SALA', 'B', 30, 'Piso 2, ala norte', 'Sala de clases con mesas modulares.'],
      ['Laboratorio B-205', 'LABORATORIO', 'B', 30, 'Piso 2, ala sur', 'Laboratorio de computación con puestos de trabajo.'],
      ['Sala de estudio B-310', 'SALA_ESTUDIO', 'B', 12, 'Piso 3', 'Espacio de estudio para grupos pequeños.'],
      ['Auditorio B-001', 'AUDITORIO', 'B', 120, 'Piso 1', 'Auditorio para charlas y presentaciones.'],
      ['Sala C-201', 'SALA', 'C', 35, 'Piso 2', 'Sala de clases con equipamiento audiovisual.'],
      ['Laboratorio C-305', 'LABORATORIO', 'C', 24, 'Piso 3', 'Laboratorio para prácticas académicas.'],
      ['Sala de estudio C-110', 'SALA_ESTUDIO', 'C', 10, 'Piso 1', 'Espacio silencioso para estudio individual o grupal.'],
      ['Sala colaborativa C-204', 'SALA_ESTUDIO', 'C', 16, 'Piso 2', 'Sala para reuniones de trabajo colaborativo.'],
    ];

    let espaciosInsertados = 0;
    for (const [nombre, tipo, codigoEdificio, capacidad, ubicacion, descripcion] of espacios) {
      const resultado = await pool.query(
        `INSERT INTO espacios (nombre, tipo, edificio_id, capacidad, ubicacion, descripcion)
         SELECT $1, $2::tipo_espacio, edificio.id, $4, $5, $6
         FROM edificios edificio
         WHERE edificio.codigo = $3::varchar
           AND NOT EXISTS (
             SELECT 1 FROM espacios existente
             WHERE existente.edificio_id = edificio.id AND existente.nombre = $1::varchar
           )`,
        [nombre, tipo, codigoEdificio, capacidad, ubicacion, descripcion]
      );
      espaciosInsertados += resultado.rowCount;
    }

    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM espacios');
    console.log(`✅ Seed completado. Espacios insertados: ${espaciosInsertados}. Total: ${rows[0].total}.`);
    
  } catch (err) {
    console.error('❌ Error en seed:', err);
    process.exitCode = 1;
  } finally {
    // finally se ejecuta siempre haya salido bien o mal
    // pool.end cierra la conexion con postgre, asi la terminal no se queda congelada 
    await pool.end();
  }
}

// Ejecutar la funcion para que empiece el proceso
seed();