// server.js
import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// === KONFIGURASI UPLOAD FOLDER ===
// Ganti dengan path folder yang Anda inginkan
const uploadDir = "C:\\Users\\X380\\Documents";

// Pastikan folder upload ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Folder dibuat: ${uploadDir}`);
}

app.use(cors());
app.use(express.json());

// ─── STORAGE MULTER ──────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { customer, folder } = req.body;
    if (!customer || !folder) {
      return cb(new Error("Customer dan folder harus diisi"), null);
    }
    const dir = path.join(uploadDir, customer, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Folder dibuat: ${dir}`);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/\s+/g, "_");
    const uniqueName = `${Date.now()}-${cleanName}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/tiff",
    "image/tif",
    "image/webp",
    "image/gif",
    "image/bmp",
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = [
    ".pdf",
    ".xlsx",
    ".xls",
    ".jpg",
    ".jpeg",
    ".png",
    ".tif",
    ".tiff",
    ".webp",
    ".gif",
    ".bmp",
  ];

  if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipe file tidak didukung: ${file.mimetype || ext}`), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter,
});

// ─── ENDPOINT UPLOAD ─────────────────────────────────
app.post("/api/upload", (req, res) => {
  upload.single("file")(req, res, function (err) {
    if (err) {
      console.error("❌ Multer error:", err);
      if (err instanceof multer.MulterError) {
        if (err.code === "FILE_TOO_LARGE") {
          return res
            .status(413)
            .json({ error: "File terlalu besar (maks 50MB)" });
        }
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }

    try {
      const { customer, folder, docType } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "Tidak ada file" });
      }

      const fileUrl = `/uploads/${encodeURIComponent(customer)}/${encodeURIComponent(folder)}/${encodeURIComponent(file.filename)}`;
      console.log("✅ Upload success:", fileUrl);

      res.json({
        success: true,
        file: {
          name: file.originalname,
          filename: file.filename,
          size: (file.size / 1024 / 1024).toFixed(1) + " MB",
          type: path.extname(file.originalname).slice(1).toLowerCase(),
          url: fileUrl,
          docType: docType || "Drawing",
        },
      });
    } catch (error) {
      console.error("❌ Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
});

// ─── ENDPOINT DOWNLOAD ────────────────────────────────
app.get("/api/download", (req, res) => {
  const filePath = req.query.path;
  if (!filePath) {
    return res.status(400).json({ error: "Path tidak ditemukan" });
  }
  const fullPath = path.join(uploadDir, filePath);
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: "File tidak ditemukan" });
  }
  const fileName = path.basename(fullPath);
  res.download(fullPath, fileName, (err) => {
    if (err) {
      console.error("Download error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Gagal download" });
      }
    }
  });
});

// ─── ENDPOINT DELETE FILE ─────────────────────────────
app.delete("/api/files", (req, res) => {
  const { fileUrl, customer, folder, fileName } = req.body;

  if (!fileUrl && (!customer || !folder || !fileName)) {
    return res.status(400).json({
      error:
        "Parameter tidak lengkap. Kirim fileUrl atau (customer + folder + fileName)",
    });
  }

  let fullPath = "";

  if (fileUrl) {
    const relativePath = fileUrl.replace(/^\/uploads\//, "");
    fullPath = path.join(uploadDir, relativePath);
  } else {
    fullPath = path.join(uploadDir, customer, folder, fileName);
  }

  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`🗑️ File dihapus: ${fullPath}`);

      // Cek apakah folder kosong setelah file dihapus
      const folderPath = path.dirname(fullPath);
      const remainingFiles = fs.readdirSync(folderPath);
      if (remainingFiles.length === 0) {
        fs.rmdirSync(folderPath);
        console.log(`📁 Folder kosong dihapus: ${folderPath}`);
      }

      res.json({ success: true, message: "File berhasil dihapus" });
    } else {
      res.status(404).json({ error: "File tidak ditemukan di server" });
    }
  } catch (err) {
    console.error("❌ Gagal hapus file:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── ENDPOINT DELETE FOLDER ───────────────────────────
app.delete("/api/folders", (req, res) => {
  const { customer, folder } = req.body;

  if (!customer || !folder) {
    return res.status(400).json({ error: "Customer dan folder harus diisi" });
  }

  const folderPath = path.join(uploadDir, customer, folder);

  try {
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
      console.log(`🗑️ Folder dihapus: ${folderPath}`);
      res.json({ success: true, message: "Folder berhasil dihapus" });
    } else {
      res.status(404).json({ error: "Folder tidak ditemukan" });
    }
  } catch (err) {
    console.error("❌ Gagal hapus folder:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── SERVE STATIC FILES ──────────────────────────────
app.use("/uploads", express.static(uploadDir));

app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
  console.log(`📁 Upload folder: ${uploadDir}`);
});
