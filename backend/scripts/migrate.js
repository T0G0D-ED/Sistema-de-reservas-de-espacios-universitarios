import fs from 'fs/promises';
import path from 'path';
import pool from '../services/dbService.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  console.log('Ejecutando migraciones...');
  
  const sqlFile = path.join(__dirname, '..', 'migrations', '001_init.sql');
  const sql = await fs.readFile(sqlFile, 'utf-8');
  
  try {
    await pool.query(sql);
    console.log(' Migración aplicada correctamente');
  } catch (err) {
    console.error('Error en migración:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();