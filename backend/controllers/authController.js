// backend/controllers/authController.js
import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_qc_dokumentasi_key_2026';

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ code: 400, error: 'Username dan password wajib diisi' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ code: 401, error: 'Username atau password salah' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ code: 401, error: 'Username atau password salah' });
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      code: 200,
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: tokenPayload,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ code: 500, error: 'Terjadi kesalahan pada server' });
  }
};

export const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, name, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, error: 'User tidak ditemukan' });
    }
    res.json({
      code: 200,
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ code: 500, error: 'Terjadi kesalahan pada server' });
  }
};

