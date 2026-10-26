// backend/controllers/fileController.js
import fs from 'fs';
import path from 'path';
import pool from '../config/database.js';

export const getUploadDir = (req) => {
  return process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), 'uploads');
};

export const getAllFoldersAndFiles = async (req, res) => {
  try {
    const [folders] = await pool.query(
      'SELECT * FROM customer_folders ORDER BY customer ASC, is_default DESC, name ASC'
    );
    const [files] = await pool.query(
      'SELECT * FROM customer_files ORDER BY created_at DESC'
    );

    const result = {};

    for (const folder of folders) {
      if (!result[folder.customer]) {
        result[folder.customer] = [];
      }

      const folderFiles = files
        .filter((f) => f.customer === folder.customer && f.folder_name === folder.name)
        .map((f) => ({
          id: f.id,
          name: f.name,
          filename: f.filename,
          type: f.file_type,
          size: f.file_size,
          docType: f.doc_type,
          url: f.file_url,
          date: f.doc_date ? new Date(f.doc_date).toISOString().split('T')[0] : f.created_at?.toISOString().split('T')[0],
        }));

      result[folder.customer].push({
        id: folder.id,
        name: folder.name,
        isDefault: Boolean(folder.is_default),
        files: folderFiles,
      });
    }

    res.json({
      code: 200,
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('getAllFoldersAndFiles error:', err);
    res.status(500).json({ code: 500, error: 'Gagal mengambil data folder dan file' });
  }
};

export const createFolder = async (req, res) => {
  const { customer, folderName } = req.body;

  if (!customer || !folderName || !folderName.trim()) {
    return res.status(400).json({ code: 400, error: 'Customer dan nama folder wajib diisi' });
  }

  const cleanFolderName = folderName.trim();
  const folderId = `${customer}_${cleanFolderName}_${Date.now()}`;

  try {
    // 1. Simpan di DB
    await pool.query(
      'INSERT INTO customer_folders (id, customer, name, is_default) VALUES (?, ?, ?, 0)',
      [folderId, customer, cleanFolderName]
    );

    // 2. Buat folder fisik
    const uploadDir = getUploadDir(req);
    const physicalDir = path.join(uploadDir, customer, cleanFolderName);
    if (!fs.existsSync(physicalDir)) {
      fs.mkdirSync(physicalDir, { recursive: true });
    }

    res.status(201).json({
      code: 201,
      success: true,
      message: 'Folder berhasil dibuat',
      data: {
        id: folderId,
        customer,
        name: cleanFolderName,
        isDefault: false,
        files: [],
      },
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ code: 400, error: 'Folder dengan nama tersebut sudah ada' });
    }
    console.error('createFolder error:', err);
    res.status(500).json({ code: 500, error: 'Gagal membuat folder' });
  }
};

export const renameFolder = async (req, res) => {
  const { customer, oldName, newName } = req.body;

  if (!customer || !oldName || !newName || !newName.trim()) {
    return res.status(400).json({ code: 400, error: 'Parameter tidak lengkap' });
  }

  const defaultFolders = ['DRAWING', 'PIS', 'QCPC', 'CS'];
  if (defaultFolders.includes(oldName.toUpperCase())) {
    return res.status(400).json({ code: 400, error: 'Tidak dapat mengganti nama folder default' });
  }

  const cleanNewName = newName.trim();

  try {
    // 1. Rename folder fisik jika ada
    const uploadDir = getUploadDir(req);
    const oldPhysical = path.join(uploadDir, customer, oldName);
    const newPhysical = path.join(uploadDir, customer, cleanNewName);

    if (fs.existsSync(oldPhysical)) {
      fs.renameSync(oldPhysical, newPhysical);
    }

    // 2. Update di database (Foreign Key ON UPDATE CASCADE akan otomatis mengupdate file-file di bawahnya!)
    const [result] = await pool.query(
      'UPDATE customer_folders SET name = ? WHERE customer = ? AND name = ?',
      [cleanNewName, customer, oldName]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, error: 'Folder tidak ditemukan di database' });
    }

    // 3. Update file_url di customer_files agar mengarah ke path baru
    const oldUrlPrefix = `/uploads/${encodeURIComponent(customer)}/${encodeURIComponent(oldName)}/`;
    const newUrlPrefix = `/uploads/${encodeURIComponent(customer)}/${encodeURIComponent(cleanNewName)}/`;
    await pool.query(
      `UPDATE customer_files 
       SET file_url = REPLACE(file_url, ?, ?) 
       WHERE customer = ? AND folder_name = ?`,
      [oldUrlPrefix, newUrlPrefix, customer, cleanNewName]
    );

    res.json({
      code: 200,
      success: true,
      message: 'Folder berhasil diubah namanya',
      data: {
        customer,
        oldName,
        newName: cleanNewName,
      },
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ code: 400, error: 'Folder dengan nama tujuan sudah ada' });
    }
    console.error('renameFolder error:', err);
    res.status(500).json({ code: 500, error: 'Gagal mengubah nama folder' });
  }
};

export const deleteFolder = async (req, res) => {
  const { customer, folder } = req.body;

  if (!customer || !folder) {
    return res.status(400).json({ code: 400, error: 'Customer dan nama folder harus diisi' });
  }

  const defaultFolders = ['DRAWING', 'PIS', 'QCPC', 'CS'];
  if (defaultFolders.includes(folder.toUpperCase())) {
    return res.status(400).json({ code: 400, error: 'Tidak dapat menghapus folder default' });
  }

  try {
    // 1. Hapus folder fisik
    const uploadDir = getUploadDir(req);
    const folderPath = path.join(uploadDir, customer, folder);
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }

    // 2. Hapus dari DB (ON DELETE CASCADE otomatis menghapus data file terkait)
    const [result] = await pool.query(
      'DELETE FROM customer_folders WHERE customer = ? AND name = ?',
      [customer, folder]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, error: 'Folder tidak ditemukan' });
    }

    res.json({
      code: 200,
      success: true,
      message: 'Folder berhasil dihapus',
    });
  } catch (err) {
    console.error('deleteFolder error:', err);
    res.status(500).json({ code: 500, error: 'Gagal menghapus folder' });
  }
};

export const handleFileUploadRecord = async (req, res) => {
  try {
    const { customer, folder, docType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ code: 400, error: 'Tidak ada file yang diunggah' });
    }

    const fileUrl = `/uploads/${encodeURIComponent(customer)}/${encodeURIComponent(folder)}/${encodeURIComponent(file.filename)}`;
    const fileId = `${customer}_${folder}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cleanName = file.originalname;
    const ext = path.extname(cleanName).slice(1).toLowerCase() || 'unknown';
    const fileSizeStr = (file.size / 1024 / 1024).toFixed(1) + ' MB';
    const finalDocType = docType || 'Drawing';
    const today = new Date().toISOString().split('T')[0];

    // Pastikan folder terdaftar di database
    await pool.query(
      'INSERT IGNORE INTO customer_folders (id, customer, name, is_default) VALUES (?, ?, ?, 0)',
      [`${customer}_${folder}_auto`, customer, folder]
    );

    // Simpan metadata file ke customer_files
    await pool.query(
      `INSERT INTO customer_files 
       (id, customer, folder_name, name, filename, file_type, file_size, doc_type, file_url, doc_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fileId, customer, folder, cleanName, file.filename, ext, fileSizeStr, finalDocType, fileUrl, today]
    );

    res.json({
      code: 200,
      success: true,
      message: 'File berhasil diunggah',
      file: {
        id: fileId,
        name: cleanName,
        filename: file.filename,
        size: fileSizeStr,
        type: ext,
        url: fileUrl,
        docType: finalDocType,
        date: today,
      },
    });
  } catch (err) {
    console.error('handleFileUploadRecord error:', err);
    res.status(500).json({ code: 500, error: err.message || 'Gagal menyimpan data file' });
  }
};

export const deleteFile = async (req, res) => {
  const { fileUrl, customer, folder, fileName, fileId } = req.body;

  if (!fileUrl && !fileId && (!customer || !folder || !fileName)) {
    return res.status(400).json({
      code: 400,
      error: 'Parameter tidak lengkap. Sertakan fileUrl, fileId, atau (customer + folder + fileName)',
    });
  }

  const uploadDir = getUploadDir(req);
  let fullPath = '';
  let deleteCondition = '';
  let queryParams = [];

  if (fileId) {
    deleteCondition = 'WHERE id = ?';
    queryParams = [fileId];
  } else if (fileUrl) {
    deleteCondition = 'WHERE file_url = ?';
    queryParams = [fileUrl];
  } else {
    deleteCondition = 'WHERE customer = ? AND folder_name = ? AND name = ?';
    queryParams = [customer, folder, fileName];
  }

  try {
    // Ambil data file dari DB untuk mendapatkan path fisik
    const [rows] = await pool.query(`SELECT * FROM customer_files ${deleteCondition}`, queryParams);
    
    if (rows.length > 0) {
      const fileRecord = rows[0];
      fullPath = path.join(uploadDir, fileRecord.customer, fileRecord.folder_name, fileRecord.filename);
      // Hapus dari DB
      await pool.query('DELETE FROM customer_files WHERE id = ?', [fileRecord.id]);
    } else if (fileUrl) {
      const relativePath = fileUrl.replace(/^\/uploads\//, '');
      fullPath = path.join(uploadDir, decodeURIComponent(relativePath));
    }

    // Hapus fisik jika ada
    if (fullPath && fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`🗑️ File fisik dihapus: ${fullPath}`);
    }

    res.json({
      code: 200,
      success: true,
      message: 'File berhasil dihapus',
    });
  } catch (err) {
    console.error('deleteFile error:', err);
    res.status(500).json({ code: 500, error: 'Gagal menghapus file' });
  }
};

export const downloadFile = (req, res) => {
  const filePath = req.query.path;
  if (!filePath) {
    return res.status(400).json({ code: 400, error: 'Parameter path tidak ditemukan' });
  }

  const uploadDir = getUploadDir(req);
  const fullPath = path.join(uploadDir, filePath);

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ code: 404, error: 'File tidak ditemukan di server' });
  }

  const fileName = path.basename(fullPath);
  res.download(fullPath, fileName, (err) => {
    if (err && !res.headersSent) {
      console.error('Download error:', err);
      res.status(500).json({ code: 500, error: 'Gagal mendownload file' });
    }
  });
};

