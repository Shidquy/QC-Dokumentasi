// backend/database/migrate.js
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const dbName = process.env.DB_NAME || 'qc_dokumentasi';

const CUSTOMERS = ['TMMIN', 'HINO', 'ISUZU', 'ADM', 'AHM', 'SIM', 'KTB', 'HPM', 'MMIKI'];
const DEFAULT_FOLDERS = ['DRAWING', 'PIS', 'QCPC', 'CS'];

export async function runMigration() {
  console.log(`⏳ Memulai migrasi database untuk [${dbName}]...`);

  let serverConn;
  try {
    // 1. Buat database jika belum ada
    serverConn = await mysql.createConnection(dbConfig);
    await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Database \`${dbName}\` siap.`);
  } catch (err) {
    console.error('❌ Gagal memeriksa/membuat database:', err.message);
    throw err;
  } finally {
    if (serverConn) await serverConn.end();
  }

  // 2. Eksekusi Schema
  const appConn = await mysql.createConnection({ ...dbConfig, database: dbName });
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    const statements = schemaSql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await appConn.query(statement);
    }
    console.log('✅ Skema tabel berhasil dibuat / diverifikasi.');

    // 3. Seed Users Default (admin & guest)
    const [userRows] = await appConn.query('SELECT COUNT(*) AS count FROM users');
    if (userRows[0].count === 0) {
      const adminPass = await bcrypt.hash('admin123', 10);
      const guestPass = await bcrypt.hash('guest123', 10);

      await appConn.query(
        `INSERT INTO users (username, password, name, role) VALUES 
         ('admin', ?, 'Administrator', 'admin'),
         ('guest', ?, 'Guest', 'guest')`,
        [adminPass, guestPass]
      );
      console.log('✅ User default (admin / guest) berhasil di-seed.');
    }

    // 4. Seed Default Customer Folders
    for (const customer of CUSTOMERS) {
      for (const folder of DEFAULT_FOLDERS) {
        const folderId = `${customer}_${folder}_default`;
        await appConn.query(
          `INSERT IGNORE INTO customer_folders (id, customer, name, is_default) VALUES (?, ?, ?, 1)`,
          [folderId, customer, folder]
        );
      }
    }
    console.log('✅ Folder customer default (DRAWING, PIS, QCPC, CS) berhasil di-seed.');

    // 5. Seed Initial Sample Documents
    const [docRows] = await appConn.query('SELECT COUNT(*) AS count FROM part_monthly_documents');
    if (docRows[0].count === 0) {
      const now = new Date();
      await appConn.query(
        `INSERT INTO part_monthly_documents (id, name, customer, status, doc_date) VALUES 
         ('doc1', '737D_77261-KK040-C', 'TMMIN', 'Release', ?),
         ('doc2', '737D_77255-KK250-B', 'TMMIN', 'Proses', ?)`,
        [now, now]
      );
      console.log('✅ Data sample part monthly document berhasil di-seed.');
    }

    console.log('🎉 Migrasi & Seeding database selesai dengan sukses!');
  } catch (err) {
    console.error('❌ Terjadi kesalahan saat migrasi:', err.message);
    throw err;
  } finally {
    await appConn.end();
  }
}

// Jalankan langsung jika dipanggil via node database/migrate.js
if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

