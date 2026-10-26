# QC-Dokumentasi (DQC System)

Sistem Sentralisasi Dokumen Quality Control (DQC) PT Sanoh Indonesia. Digunakan untuk mengelola dokumen teknis customer (Drawing, PIS, QCPC, CS) dan monitoring dokumen Part Monthly secara terpusat dan realtime.

---

## 🏗️ Arsitektur Sistem

* **Frontend**: React 18, Vite, Tailwind CSS, Axios.
* **Backend**: Node.js, Express.js 5 (Layered MVC Architecture), Multer, JWT, BcryptJS.
* **Database**: MySQL (`qc_dokumentasi`).
* **File Storage**: Folder penyimpanan lokal/server yang dapat dikonfigurasi melalui `.env` (`UPLOAD_DIR`).
* **API Testing**: Postman Collection standar PT Sanoh Indonesia (`QC-Dokumentasi.postman_collection.json`).

---

## 🚀 Panduan Setup & Menjalankan Project

### 1. Prasyarat
* Node.js v18+ atau v20+
* MySQL Server (Laragon, XAMPP, atau MySQL Standalone) aktif di port `3306`.

### 2. Setup Backend & Database
Buka terminal pertama:
```bash
cd backend

# 1. Salin konfigurasi environment
cp .env.example .env

# 2. Install dependencies backend
npm install

# 3. Jalankan migrasi dan seeder database (otomatis membuat DB & tabel)
npm run migrate

# 4. Jalankan backend development server (port 5000)
npm run dev
```

> **Catatan Database**: Script `npm run migrate` otomatis membuat database `qc_dokumentasi`, membuat tabel, menginisialisasi folder default customer, dan membuat akun user default (`admin` & `guest`).

### 3. Setup Frontend
Buka terminal kedua:
```bash
# Dari root folder project (d:\Projects\QC-Dokumentasi)
npm install

# Jalankan Vite development server (port 5173)
npm run dev
```

Buka browser di: **`http://localhost:5173`**

---

## 🔑 Kredensial Default

| Role | Username | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Akses penuh CRUD dokumen & folder |
| **Guest** | `guest` | `guest123` | Read-only & monitoring |

---

## 📁 Struktur Direktori Backend

```
backend/
├── config/
│   └── database.js             # MySQL Pool (mysql2/promise)
├── controllers/
│   ├── authController.js       # Login, Me, Profile
│   ├── documentController.js   # CRUD Part Monthly & Stats
│   └── fileController.js       # Upload file, List Folders/Files, Delete
├── database/
│   ├── schema.sql              # Skema DDL tabel MySQL
│   └── migrate.js              # Script otomatis pembuatan DB & seeding
├── middlewares/
│   ├── authMiddleware.js       # Verifikasi token JWT & Role Admin
│   ├── errorHandler.js         # Error handler terpusat
│   └── uploadMiddleware.js     # Validasi Multer & batasan file upload (50MB)
├── routes/
│   ├── authRoutes.js           # Route /api/auth/*
│   ├── documentRoutes.js       # Route /api/documents/*
│   └── fileRoutes.js           # Route /api/folders, /api/upload, /api/files
├── .env.example                # Template konfigurasi environment
├── package.json
└── server.js                   # Entry point server Express
```

---

## 🧪 Pengujian API (Postman Collection)

File Postman Collection sudah disediakan di root folder:
`QC-Dokumentasi.postman_collection.json`

### Cara Menggunakan di Postman:
1. Buka aplikasi Postman, klik tombol **Import**, dan pilih file `QC-Dokumentasi.postman_collection.json`.
2. Pastikan variabel `{{BaseURL}}` mengarah ke `http://127.0.0.1:5000`.
3. Jalankan request **Login (Admin)**. Token JWT akan otomatis tersimpan ke variabel `{{token}}` untuk seluruh request berikutnya.
