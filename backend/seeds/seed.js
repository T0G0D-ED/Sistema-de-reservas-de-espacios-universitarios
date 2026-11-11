// Importar pool que es el puente de conexion configurado para comunicar con Postgres
import  pool  from  '../services/dbService.js';
// Importar bcrypt para poder encriptar claves
import bcrypt from 'bcrypt';

//Funcion async para para la conexion a la base de datos que toma tiempo
//Node.js espera que cada consulta termine antes de seguir con la otra
async function seed() {
  console.log('Insertando datos de prueba...');

  try {
    // 1. Usuario administrador 
    //No guardar claves en texto plano. 
    //bcrypt.hash toma admin123 y se mezcla 10 veces
    //genera cadena de texto secreta 
    const hash = await bcrypt.hash('admin123', 10);
    
    // Insertar el usuario administrador. El $1 es un marcador de posicion seguro.
    // ON CONFLICT (email) DO NOTHING evita que el script falle si se corre el seed denuevo
    // postgre ignora la insercion si ese correo ya existe en la tabla.
    await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol) 
       VALUES ('Admin Sistema', 'admin@unab.cl', $1, 'ADMIN')
       ON CONFLICT (email) DO NOTHING`,
      [hash] // Se inserta de forma segura el hash en el lugar de $1
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

    console.log('Seed completado');
    
  } catch (err) {
    // si falla algo cae aqui y avisa
    console.error('Error en seed:', err);
  } finally {
	  // finally se ejecuta siempre haya salido bien o mal
	  // pool.end cierra la conexion con postgre, asi la terminal no se queda congelada 
    await pool.end();
  }
}

// Ejecutar la funcion para que empiece el proceso
seed();
