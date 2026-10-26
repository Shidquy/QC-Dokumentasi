// backend/config/database.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'qc_dokumentasi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ Terhubung ke database MySQL [${process.env.DB_NAME || 'qc_dokumentasi'}]`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Gagal terhubung ke database MySQL:', error.message);
    return false;
  }
};

export default pool;

