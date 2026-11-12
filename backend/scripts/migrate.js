import fs from 'fs/promises';
import path from 'path';
import pool from '../services/dbService.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  console.log('Ejecutando migraciones...');

  try {
    const migrationsDirectory = path.join(__dirname, '..', 'migrations');
    const files = (await fs.readdir(migrationsDirectory))
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const sql = await fs.readFile(path.join(migrationsDirectory, file), 'utf-8');
      await pool.query(sql);
      console.log(`Migración aplicada: ${file}`);
    }
  } catch (err) {
    console.error('Error en migración:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();