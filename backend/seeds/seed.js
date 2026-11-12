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
    const hashAdmin = await bcrypt.hash('admin123', 10);
    const hashEstudiante = await bcrypt.hash('estudiante123', 10);
    const hashDocente = await bcrypt.hash('docente123', 10);
    
    // Insertamos los 3 usuarios. 
    // ON CONFLICT DO UPDATE asegura que si el email ya existe, se actualice el hash y el rol 
    // (soluciona el error 401 si se ejecutó un seed anterior con contraseñas diferentes).
    await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
        ('Admin Sistema', 'admin@unab.cl', $1, 'ADMIN'),
        ('Juan Pérez', 'estudiante@unab.cl', $2, 'ESTUDIANTE'),
        ('María López', 'docente@unab.cl', $3, 'DOCENTE')
       ON CONFLICT (email) DO UPDATE 
       SET password_hash = EXCLUDED.password_hash,
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

    // 3. ESPACIOS 
    // Consulta para hacer SELECT interno y buscar el id del edificio que la sala necesita
    await pool.query(`
      INSERT INTO espacios (nombre, tipo, edificio_id, capacidad, ubicacion)
      SELECT 'Sala B-203', 'SALA', id, 30, 'Piso 2, ala norte'
      FROM edificios WHERE codigo = 'B'
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Seed completado');
    
  } catch (err) {
    // si falla algo cae aqui y avisa
    console.error('❌ Error en seed:', err);
  } finally {
    // finally se ejecuta siempre haya salido bien o mal
    // pool.end cierra la conexion con postgre, asi la terminal no se queda congelada 
    await pool.end();
  }
}

// Ejecutar la funcion para que empiece el proceso
seed();