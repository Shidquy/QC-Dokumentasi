// backend/controllers/documentController.js
import pool from '../config/database.js';

export const getAllDocuments = async (req, res) => {
  try {
    const { search, customer, status } = req.query;
    let query = 'SELECT * FROM part_monthly_documents WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      query += ' AND name LIKE ?';
      params.push(`%${search.trim()}%`);
    }

    if (customer && customer.trim()) {
      query += ' AND customer = ?';
      params.push(customer.trim());
    }

    if (status && status.trim()) {
      query += ' AND status = ?';
      params.push(status.trim());
    }

    query += ' ORDER BY doc_date DESC, created_at DESC';

    const [rows] = await pool.query(query, params);

    // Map doc_date to ISO string for compatibility
    const formatted = rows.map((row) => ({
      id: row.id,
      name: row.name,
      customer: row.customer,
      status: row.status,
      date: row.doc_date ? new Date(row.doc_date).toISOString() : new Date().toISOString(),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    res.json({
      code: 200,
      success: true,
      data: formatted,
    });
  } catch (err) {
    console.error('getAllDocuments error:', err);
    res.status(500).json({ code: 500, error: 'Gagal mengambil data dokumen' });
  }
};

export const getDocumentStats = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Release' THEN 1 ELSE 0 END) AS release_count,
        SUM(CASE WHEN status = 'Proses' THEN 1 ELSE 0 END) AS proses_count,
        SUM(CASE WHEN status = 'Review Status' THEN 1 ELSE 0 END) AS review_count
      FROM part_monthly_documents
    `);

    const stats = rows[0] || { total: 0, release_count: 0, proses_count: 0, review_count: 0 };

    res.json({
      code: 200,
      success: true,
      data: {
        total: Number(stats.total) || 0,
        release: Number(stats.release_count) || 0,
        proses: Number(stats.proses_count) || 0,
        review: Number(stats.review_count) || 0,
      },
    });
  } catch (err) {
    console.error('getDocumentStats error:', err);
    res.status(500).json({ code: 500, error: 'Gagal mengambil statistik dokumen' });
  }
};

export const createDocument = async (req, res) => {
  try {
    const { name, customer, status, date } = req.body;

    if (!name || !customer) {
      return res.status(400).json({ code: 400, error: 'Nama dokumen dan customer wajib diisi' });
    }

    const docId = `doc_${Date.now()}`;
    const docDate = date ? new Date(date) : new Date();
    const docStatus = status || 'Proses';

    await pool.query(
      `INSERT INTO part_monthly_documents (id, name, customer, status, doc_date) VALUES (?, ?, ?, ?, ?)`,
      [docId, name.trim(), customer.trim(), docStatus, docDate]
    );

    const newDoc = {
      id: docId,
      name: name.trim(),
      customer: customer.trim(),
      status: docStatus,
      date: docDate.toISOString(),
    };

    res.status(201).json({
      code: 201,
      success: true,
      message: 'Dokumen berhasil ditambahkan',
      data: newDoc,
    });
  } catch (err) {
    console.error('createDocument error:', err);
    res.status(500).json({ code: 500, error: 'Gagal menambahkan dokumen' });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, customer, status, date } = req.body;

    const [existing] = await pool.query('SELECT * FROM part_monthly_documents WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ code: 404, error: 'Dokumen tidak ditemukan' });
    }

    const current = existing[0];
    const updatedName = name !== undefined ? name.trim() : current.name;
    const updatedCustomer = customer !== undefined ? customer.trim() : current.customer;
    const updatedStatus = status !== undefined ? status : current.status;
    const updatedDate = date ? new Date(date) : current.doc_date;

    await pool.query(
      `UPDATE part_monthly_documents SET name = ?, customer = ?, status = ?, doc_date = ? WHERE id = ?`,
      [updatedName, updatedCustomer, updatedStatus, updatedDate, id]
    );

    res.json({
      code: 200,
      success: true,
      message: 'Dokumen berhasil diperbarui',
      data: {
        id,
        name: updatedName,
        customer: updatedCustomer,
        status: updatedStatus,
        date: new Date(updatedDate).toISOString(),
      },
    });
  } catch (err) {
    console.error('updateDocument error:', err);
    res.status(500).json({ code: 500, error: 'Gagal memperbarui dokumen' });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM part_monthly_documents WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, error: 'Dokumen tidak ditemukan' });
    }

    res.json({
      code: 200,
      success: true,
      message: 'Dokumen berhasil dihapus',
    });
  } catch (err) {
    console.error('deleteDocument error:', err);
    res.status(500).json({ code: 500, error: 'Gagal menghapus dokumen' });
  }
};

