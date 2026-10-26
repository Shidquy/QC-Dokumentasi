// sync-files.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── KONFIGURASI ──────────────────────────────────────
const DATA_DIR = process.env.DATA_DIR || "D:/QCC/Data centralisasi dok";
const CUSTOMER_FILES_STORAGE_KEY = "qc_customer_files";
const DEFAULT_FOLDERS = ["DRAWING", "PIS", "QCPC", "CS"];

// ─── FUNGSI SCAN ──────────────────────────────────────
function scanFiles(dir) {
  const results = {};

  if (!fs.existsSync(dir)) {
    console.error(`❌ Folder tidak ditemukan: ${dir}`);
    return {};
  }

  const customers = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  console.log(`Ditemukan ${customers.length} customer:`);
  console.log(customers);

  customers.forEach((customer) => {
    const customerPath = path.join(dir, customer);
    results[customer] = [];

    const folders = fs
      .readdirSync(customerPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    console.log(`  ${customer}: ${folders.length} folder`);

    folders.forEach((folder) => {
      const folderPath = path.join(customerPath, folder);
      const files = fs.readdirSync(folderPath);

      const fileList = files
        .filter((f) => {
          const fullPath = path.join(folderPath, f);
          try {
            return fs.statSync(fullPath).isFile();
          } catch {
            return false;
          }
        })
        .map((f) => {
          const filePath = path.join(folderPath, f);
          const stats = fs.statSync(filePath);
          const ext = path.extname(f).slice(1).toLowerCase();

          return {
            id: `${customer}_${folder}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            name: f,
            type: ext || "unknown",
            size: (stats.size / 1024 / 1024).toFixed(1) + " MB",
            date: new Date(stats.birthtime || stats.mtime)
              .toISOString()
              .split("T")[0],
            docType: DEFAULT_FOLDERS.includes(folder.toUpperCase())
              ? folder.toUpperCase()
              : "Drawing",
            url: `/uploads/${encodeURIComponent(customer)}/${encodeURIComponent(folder)}/${encodeURIComponent(f)}`,
          };
        });

      results[customer].push({
        id: `${customer}_${folder}_${Date.now()}`,
        name: folder,
        files: fileList,
      });
    });
  });

  return results;
}

// ─── SIMPAN KE FILE ──────────────────────────────────
function saveToFile(data) {
  const outputPath = path.join(__dirname, "sync-output.json");
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`\n✅ Data tersimpan di: ${outputPath}`);
  console.log("\n📋 LANGKAH SELANJUTNYA:");
  console.log("1. Buka file sync-output.json, copy seluruh isinya");
  console.log("2. Buka browser aplikasi, tekan F12 → Console");
  console.log(
    "3. Paste kode berikut (ganti DATA dengan isi sync-output.json):",
  );
  console.log(`
const data = PASTE_ISI_SYNC_OUTPUT_JSON_DISINI;
localStorage.setItem('${CUSTOMER_FILES_STORAGE_KEY}', JSON.stringify(data));
console.log('✅ Data berhasil disimpan!');
  `);
  console.log("4. Refresh halaman aplikasi");
}

// ─── EKSEKUSI ──────────────────────────────────────
try {
  console.log("📂 Membaca folder:", DATA_DIR);
  const data = scanFiles(DATA_DIR);

  const totalFiles = Object.values(data).reduce((sum, folders) => {
    return sum + folders.reduce((s, f) => s + f.files.length, 0);
  }, 0);

  console.log(`\n📊 Total: ${totalFiles} file ditemukan`);
  saveToFile(data);
} catch (error) {
  console.error("❌ Error:", error.message);
}
