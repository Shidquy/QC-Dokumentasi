// src/components/CustomerDetail/CustomerDetail.jsx
import { useState, useMemo, useEffect } from "react";
import { CUSTOMERS, DEFAULT_FOLDERS } from "../../utils/constants";
import { useCustomerFiles } from "../../hooks/useCustomerFiles";
import { useAuth } from "../../contexts/AuthContext";
import { customerLogos } from "../../utils/customerLogos";
import { FaBuilding, FaEye } from "react-icons/fa";
import axios from "axios";
import * as XLSX from "xlsx";

const API_BASE_URL = "http://localhost:5000";

// ─── HELPER FUNCTIONS ──────────────────────────────
const getFileType = (file) => {
  const name = file?.name || "";
  const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
  const mime = file?.type?.toLowerCase() || "";
  return ext || mime.split("/").pop() || "";
};

const toAbsoluteFileUrl = (url) => {
  if (!url) return "";
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

const getDownloadUrl = (fileUrl) => {
  const absoluteUrl = toAbsoluteFileUrl(fileUrl);
  const marker = "/uploads/";
  const idx = absoluteUrl.indexOf(marker);
  if (idx === -1) return absoluteUrl;
  const relativePath = absoluteUrl.slice(idx + marker.length);
  return `${API_BASE_URL}/api/download?path=${encodeURIComponent(relativePath)}`;
};

// ─── ICONS ────────────────────────────────────────────
const IconSearch = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
const IconChevronDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const IconFolder = () => (
  <span className="text-amber-500 dark:text-amber-400 text-sm">📁</span>
);
const IconFile = ({ type, name }) => {
  const t = getFileType({ type, name });
  if (t === "pdf")
    return <span className="text-rose-600 dark:text-rose-400 text-xl">📄</span>;
  if (["xlsx", "xls"].includes(t))
    return (
      <span className="text-emerald-600 dark:text-emerald-400 text-xl">📊</span>
    );
  if (["jpg", "jpeg", "png", "tif", "tiff", "webp", "gif", "bmp"].includes(t))
    return <span className="text-blue-600 dark:text-blue-400 text-xl">🖼️</span>;
  return <span className="text-slate-400 dark:text-slate-500 text-xl">📎</span>;
};
const IconUpload = () => <span>📤</span>;
const IconAddFolder = () => <span>📂+</span>;
const IconDelete = () => (
  <span className="text-rose-500 dark:text-rose-400">🗑️</span>
);
const IconTrashMultiple = () => (
  <span className="text-rose-600 dark:text-rose-400">🗑️</span>
);
const IconClose = () => <span>✕</span>;

// ─── CONSTANTS ──────────────────────────────────────
const DOC_TYPE_COLORS = {
  Drawing:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  PIS: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  QCPC: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  CS: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
};
const DOC_TYPES = ["Drawing", "PIS", "QCPC", "CS"];

// ─── KOMPONEN PREVIEW TIFF ──────────────────────────
const TiffPreview = ({ fileUrl, fileName }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <span className="text-6xl mb-4">🖼️</span>
      <p className="text-xl font-medium text-slate-800 dark:text-white">
        File TIFF
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
        Browser tidak dapat menampilkan file TIFF secara native.
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
        Silakan download untuk melihat file.
      </p>
      <a
        href={getDownloadUrl(fileUrl)}
        download={fileName}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
      >
        ⬇️ Download File
      </a>
    </div>
  );
};

// ─── KOMPONEN PREVIEW EXCEL ──────────────────────────
const ExcelPreview = ({ fileUrl, fileName }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadExcel = async () => {
      try {
        setLoading(true);
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("File tidak ditemukan");
        const arrayBuffer = await response.arrayBuffer();

        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        setData(jsonData);
        setLoading(false);
      } catch (err) {
        console.error("Gagal render Excel:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    loadExcel();
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <span className="text-4xl animate-pulse mb-4">⏳</span>
        <p className="text-slate-500 dark:text-slate-400">Memuat Excel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <span className="text-5xl mb-4">❌</span>
        <p className="text-slate-600 dark:text-slate-300 font-medium">
          Gagal menampilkan Excel
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
          {error}
        </p>
        <a
          href={getDownloadUrl(fileUrl)}
          download={fileName}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          ⬇️ Download
        </a>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto max-h-[70vh]">
      <table className="w-full border-collapse text-sm">
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b border-slate-200 dark:border-slate-700"
            >
              {row.map((cell, colIdx) => (
                <td
                  key={colIdx}
                  className="px-3 py-2 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap"
                  style={{
                    backgroundColor: rowIdx === 0 ? "#f1f5f9" : "transparent",
                    fontWeight: rowIdx === 0 ? "600" : "normal",
                  }}
                >
                  {cell !== undefined && cell !== null ? String(cell) : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────
export default function CustomerDetail({
  customer,
  onBack,
  onCustomerChange,
  hideBackButton,
  initialSearchKeyword = "",
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { getFolders, addFolder, addFile, deleteFile, deleteFolder } =
    useCustomerFiles();

  // ─── STATE ──────────────────────────────────────────
  const [searchFile, setSearchFile] = useState("");
  const [filterDocType, setFilterDocType] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    folder: "",
    files: [],
    docType: "Drawing",
  });
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDeleteMultipleModal, setIsDeleteMultipleModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
    status: "",
  });

  // ─── STATE UNTUK POPUP PENCARIAN KOSONG ────────────
  const [showNoResultToast, setShowNoResultToast] = useState(false);

  // ─── DATA ──────────────────────────────────────────
  const folders = useMemo(() => getFolders(customer), [customer, getFolders]);

  const allFiles = useMemo(() => {
    const result = [];
    folders.forEach((folder) => {
      folder.files.forEach((file) => {
        result.push({ ...file, folderName: folder.name });
      });
    });
    return result;
  }, [folders]);

  const docTypeCounts = useMemo(() => {
    const counts = { Drawing: 0, PIS: 0, QCPC: 0, CS: 0 };
    allFiles.forEach((file) => {
      if (file.docType && counts.hasOwnProperty(file.docType))
        counts[file.docType] += 1;
    });
    return counts;
  }, [allFiles]);

  const filteredFiles = useMemo(() => {
    let result = allFiles;
    if (filterDocType !== "all") {
      result = result.filter((file) => file.docType === filterDocType);
    }
    if (searchFile.trim()) {
      const term = searchFile.trim().toLowerCase();
      result = result.filter(
        (file) =>
          file.name.toLowerCase().includes(term) ||
          file.folderName.toLowerCase().includes(term) ||
          (file.docType && file.docType.toLowerCase().includes(term)),
      );
    }
    return result;
  }, [allFiles, filterDocType, searchFile]);

  // ─── EFFECT UNTUK MENGISI SEARCH DARI DASHBOARD ──
  useEffect(() => {
    if (initialSearchKeyword) {
      setSearchFile(initialSearchKeyword);
    }
  }, [initialSearchKeyword]);

  // ─── EFFECT UNTUK DETEKSI PENCARIAN KOSONG ──────────
  useEffect(() => {
    // Hanya tampilkan jika ada kata kunci pencarian dan hasilnya 0
    if (searchFile.trim() && filteredFiles.length === 0) {
      setShowNoResultToast(true);
      const timer = setTimeout(() => setShowNoResultToast(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowNoResultToast(false);
    }
  }, [searchFile, filteredFiles]);

  // Reset selected saat filter berubah
  useEffect(() => {
    setSelectedFiles([]);
  }, [filterDocType, searchFile]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ─── GET FILE URL ──────────────────────────────────
  const getFileUrl = (cust, folderName, fileName) => {
    const folder = folders.find((f) => f.name === folderName);
    const fallbackUrl = `/uploads/${encodeURIComponent(cust)}/${encodeURIComponent(
      folderName,
    )}/${encodeURIComponent(fileName)}`;
    if (!folder) return toAbsoluteFileUrl(fallbackUrl);
    const exactFile = folder.files.find((f) => f.name === fileName);
    if (exactFile?.url) return toAbsoluteFileUrl(exactFile.url);
    const encodedName = encodeURIComponent(fileName);
    const fileByUrl = folder.files.find(
      (f) => f.url && (f.url.includes(encodedName) || f.url.includes(fileName)),
    );
    return toAbsoluteFileUrl(fileByUrl?.url || fallbackUrl);
  };

  // ─── PREVIEW ────────────────────────────────────────
  const handlePreview = (file) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };

  // ─── UPLOAD ─────────────────────────────────────────
  const handleUpload = async () => {
    if (!uploadData.folder) {
      alert("Pilih folder tujuan!");
      return;
    }
    if (uploadData.files.length === 0) {
      alert("Pilih minimal satu file!");
      return;
    }

    const folderName = uploadData.folder;
    const docType = uploadData.docType;
    const filesArray = uploadData.files;

    // ─── CEGAH DUPLIKAT NAMA FILE ────────────────────
    const folderData = folders.find((f) => f.name === folderName);
    const existingNames = folderData
      ? folderData.files.map((f) => f.name.toLowerCase())
      : [];

    const processedFiles = [];
    for (const file of filesArray) {
      let baseName = file.name;
      let ext = "";
      let nameWithoutExt = baseName;
      const lastDot = baseName.lastIndexOf(".");
      if (lastDot > 0) {
        nameWithoutExt = baseName.substring(0, lastDot);
        ext = baseName.substring(lastDot);
      }
      let newName = baseName;
      let counter = 1;
      while (
        existingNames.includes(newName.toLowerCase()) ||
        processedFiles.some(
          (p) => p.newName.toLowerCase() === newName.toLowerCase(),
        )
      ) {
        newName = `${nameWithoutExt} (${counter})${ext}`;
        counter++;
      }
      const renamedFile = new File([file], newName, { type: file.type });
      processedFiles.push({
        original: file,
        renamed: renamedFile,
        newName: newName,
      });
    }

    const renamedCount = processedFiles.filter(
      (p) => p.newName !== p.original.name,
    ).length;
    if (renamedCount > 0) {
      if (
        !window.confirm(
          `⚠️ ${renamedCount} file memiliki nama yang sama dengan file yang sudah ada.\nNama file akan diganti otomatis (contoh: "file (1).pdf").\n\nLanjutkan upload?`,
        )
      ) {
        return;
      }
    }

    // ─── PROGRESS UPLOAD ─────────────────────────────
    setUploadProgress({
      current: 0,
      total: processedFiles.length,
      status: "Mengupload...",
    });

    let successCount = 0;
    const errors = [];

    for (let i = 0; i < processedFiles.length; i++) {
      const { renamed: file, newName } = processedFiles[i];
      const formData = new FormData();
      formData.append("customer", customer);
      formData.append("folder", folderName);
      formData.append("docType", docType);
      formData.append("file", file);

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        const uploadedFile = response.data.file;
        addFile(customer, folderName, {
          name: newName,
          type: uploadedFile.type || getFileType({ name: newName }),
          size: uploadedFile.size,
          docType: docType,
          url: uploadedFile.url,
        });
        successCount++;
      } catch (error) {
        console.error(`Gagal upload ${newName}:`, error);
        const errorMsg =
          error.response?.data?.error || error.message || "Unknown error";
        errors.push(`${newName} (${errorMsg})`);
      }
      setUploadProgress({
        current: i + 1,
        total: processedFiles.length,
        status: `Upload ${i + 1}/${processedFiles.length}`,
      });
    }

    // ─── PROGRESS 100% DAN NOTIFIKASI ────────────────
    setUploadProgress({
      current: processedFiles.length,
      total: processedFiles.length,
      status: "Selesai!",
    });

    await new Promise((resolve) => setTimeout(resolve, 300));

    setUploadProgress({ current: 0, total: 0, status: "" });

    if (errors.length > 0) {
      alert(
        `✅ Berhasil ${successCount} dari ${processedFiles.length} file.\n❌ Gagal: ${errors.join(", ")}`,
      );
    } else {
      alert(`✅ Berhasil upload ${successCount} file ke "${folderName}"`);
    }

    setShowUploadModal(false);
    setUploadData({ folder: "", files: [], docType: "Drawing" });
  };

  // ─── HANDLER LAINNYA ──────────────────────────────
  const handleCustomerChange = (e) => {
    const newCustomer = e.target.value;
    if (newCustomer && onCustomerChange) {
      onCustomerChange(newCustomer);
      setFilterDocType("all");
      setSearchFile("");
      setSelectedFiles([]);
      closePreview();
    }
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) {
      alert("Masukkan nama folder!");
      return;
    }
    addFolder(customer, newFolderName.trim());
    setShowAddFolderModal(false);
    setNewFolderName("");
  };

  // ─── DELETE PER FILE ──────────────────────────────
  const handleDeleteFile = (folderName, fileId, fileName) => {
    if (window.confirm(`Hapus file "${fileName}"?`)) {
      deleteFile(customer, folderName, fileId);
    }
  };

  // ─── SELECT ALL ──────────────────────────────────
  const handleSelectAll = (e) => {
    e.stopPropagation();
    if (e.target.checked) {
      setSelectedFiles(filteredFiles.map((f) => f.id));
    } else {
      setSelectedFiles([]);
    }
  };

  // ─── SELECT INDIVIDUAL ──────────────────────────
  const handleSelectFile = (e, fileId) => {
    e.stopPropagation();
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId],
    );
  };

  // ─── DELETE MULTIPLE ──────────────────────────────
  const handleDeleteMultiple = () => {
    if (selectedFiles.length === 0) {
      alert("Tidak ada file yang dipilih!");
      return;
    }
    setIsDeleteMultipleModal(true);
  };

  const confirmDeleteMultiple = () => {
    const filesToDelete = filteredFiles.filter((f) =>
      selectedFiles.includes(f.id),
    );
    filesToDelete.forEach((file) => {
      deleteFile(customer, file.folderName, file.id);
    });
    setSelectedFiles([]);
    setIsDeleteMultipleModal(false);
    alert(`✅ Berhasil menghapus ${filesToDelete.length} file`);
  };

  // ─── FOLDER CUSTOM SAJA ────────────────────────────
  const customFolders = useMemo(() => {
    const defaultSet = new Set(DEFAULT_FOLDERS.map((f) => f.toUpperCase()));
    return folders
      .map((f) => f.name)
      .filter((name) => !defaultSet.has(name.toUpperCase()));
  }, [folders]);

  const getCustomerLogo = (cust) => {
    const logo = customerLogos[cust];
    return logo ? (
      <img src={logo} alt={cust} className="w-6 h-6 object-contain" />
    ) : (
      <FaBuilding className="w-6 h-6 text-slate-400" />
    );
  };

  // ─── RENDER ────────────────────────────────────────
  if (!customer) {
    return (
      <div className="p-6 text-center text-slate-500 dark:text-slate-400">
        <p>Tidak ada customer dipilih.</p>
        {!hideBackButton && onBack && (
          <button
            onClick={onBack}
            className="mt-4 text-blue-600 dark:text-blue-400 underline"
          >
            Kembali
          </button>
        )}
      </div>
    );
  }

  const getFilterButtonClass = (type) => {
    const base = "px-4 py-2 rounded-lg text-sm font-medium transition-all";
    if (filterDocType === type) {
      if (type === "all") return `${base} bg-blue-600 text-white shadow-sm`;
      if (type === "Drawing") return `${base} bg-blue-600 text-white shadow-sm`;
      if (type === "PIS") return `${base} bg-purple-600 text-white shadow-sm`;
      if (type === "QCPC") return `${base} bg-emerald-600 text-white shadow-sm`;
      if (type === "CS") return `${base} bg-amber-600 text-white shadow-sm`;
    }
    return `${base} bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600`;
  };

  return (
    <div>
      {/* ─── POPUP NOTIFIKASI PENCARIAN KOSONG ───────── */}
      {showNoResultToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-100 dark:bg-amber-900/80 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-md animate-slide-down">
          <span className="text-2xl">📂</span>
          <div>
            <p className="font-medium">Dokumen Approval Tidak Tersedia</p>
            <p className="text-sm opacity-80">
              Tidak ada file yang sesuai dengan pencarian "{searchFile}"
            </p>
          </div>
          <button
            onClick={() => setShowNoResultToast(false)}
            className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── HEADER ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span>🏢</span> <span>Detail Customer</span>
          </h1>
          {/* ─── DROPDOWN CUSTOMER ──────────────────────────── */}
          <div className="flex items-center gap-2">
            <select
              value={customer}
              onChange={handleCustomerChange}
              className="appearance-none bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white text-sm font-medium rounded-lg pl-4 pr-10 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            >
              {CUSTOMERS.map((c) => (
                <option
                  key={c}
                  value={c}
                  className="text-slate-800 dark:text-white bg-white dark:bg-slate-700"
                >
                  {c}
                </option>
              ))}
            </select>
            <div className="flex items-center justify-center w-8 h-8 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
              {getCustomerLogo(customer)}
            </div>
          </div>
          <span className="ml-2 text-sm font-normal bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
            {filteredFiles.length} file
          </span>
        </div>
        {!hideBackButton && onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-sm font-medium whitespace-nowrap"
          >
            ← Kembali
          </button>
        )}
      </div>

      {/* ─── SEARCH & AKSI ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Cari file..."
            value={searchFile}
            onChange={(e) => setSearchFile(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 transition-all"
          />
        </div>
        {isAdmin && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
            >
              <IconUpload /> Upload File
            </button>
            <button
              onClick={() => setShowAddFolderModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
            >
              <IconAddFolder /> Tambah Folder
            </button>
          </div>
        )}
      </div>

      {/* ─── FILTER TIPE DOKUMEN ──────────────────── */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterDocType("all")}
          className={getFilterButtonClass("all")}
        >
          📂 Semua ({allFiles.length})
        </button>
        {DOC_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilterDocType(type)}
            className={getFilterButtonClass(type)}
          >
            <span className="mr-1">
              {type === "Drawing" && "📐"}
              {type === "PIS" && "📋"}
              {type === "QCPC" && "📊"}
              {type === "CS" && "📑"}
            </span>
            {type} ({docTypeCounts[type] || 0})
          </button>
        ))}
      </div>

      {/* ─── TABEL ────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-700/50 border-b border-slate-200/80 dark:border-slate-700">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredFiles.length > 0 &&
                      selectedFiles.length === filteredFiles.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12">
                  No
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Nama File
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Folder
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tipe Dokumen
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Ukuran
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-28">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📭</span>
                      <p className="font-medium">Tidak ada file</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {searchFile
                          ? "Tidak ditemukan sesuai pencarian"
                          : "Upload file atau tambahkan folder"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file, idx) => (
                  <tr
                    key={file.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 border-b border-slate-100/80 dark:border-slate-700/50 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={(e) => handleSelectFile(e, file.id)}
                        className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3.5 text-slate-800 dark:text-white font-medium flex items-center gap-2">
                      <IconFile type={file.type} name={file.name} />
                      <span>{file.name}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-md text-xs font-medium border border-amber-200/60 dark:border-amber-800">
                        <IconFolder /> {file.folderName}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                          DOC_TYPE_COLORS[file.docType] ||
                          "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {file.docType || "Drawing"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs">
                      {file.size}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs">
                      {formatDate(file.date)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {isAdmin ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handlePreview(file)}
                            className="text-blue-400 dark:text-blue-500 hover:text-blue-600 dark:hover:text-blue-300 transition-all"
                            title="Preview file"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteFile(
                                file.folderName,
                                file.id,
                                file.name,
                              )
                            }
                            className="text-rose-400 dark:text-rose-500 hover:text-rose-600 dark:hover:text-rose-300 transition-all"
                            title="Hapus file"
                          >
                            <IconDelete />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePreview(file)}
                          className="text-blue-400 dark:text-blue-500 hover:text-blue-600 dark:hover:text-blue-300 transition-all"
                          title="Preview file"
                        >
                          <FaEye />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3.5 border-t border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Menampilkan {filteredFiles.length} dari {allFiles.length} file
            {filterDocType !== "all" && ` (tipe: ${filterDocType})`}
            {searchFile && ` | hasil pencarian: "${searchFile}"`}
          </span>
          <div className="flex items-center gap-3">
            {selectedFiles.length > 0 && (
              <>
                <span className="text-blue-600 dark:text-blue-400">
                  {selectedFiles.length} file dipilih
                </span>
                <button
                  onClick={handleDeleteMultiple}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white text-xs font-medium rounded-lg hover:bg-rose-700 transition-all shadow-sm"
                >
                  <IconTrashMultiple /> Hapus Terpilih
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── MODAL PREVIEW ──────────────────────────── */}
      {isPreviewOpen && previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closePreview();
          }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl">👁️</span>
                <div className="truncate">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate">
                    {previewFile.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {previewFile.folderName} • {previewFile.docType} •{" "}
                    {previewFile.size}
                  </p>
                </div>
              </div>
              <button
                onClick={closePreview}
                className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex-shrink-0"
              >
                <IconClose />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-auto bg-slate-50 dark:bg-slate-900/50">
              {(() => {
                const fileUrl = getFileUrl(
                  customer,
                  previewFile.folderName,
                  previewFile.name,
                );
                const fileType = getFileType(previewFile);
                const isImage = [
                  "jpg",
                  "jpeg",
                  "png",
                  "gif",
                  "svg",
                  "webp",
                  "bmp",
                ].includes(fileType);
                const isPdf = fileType === "pdf";
                const isTiff = ["tif", "tiff"].includes(fileType);
                const isExcel = ["xlsx", "xls"].includes(fileType);

                if (isTiff) {
                  return (
                    <TiffPreview
                      fileUrl={fileUrl}
                      fileName={previewFile.name}
                    />
                  );
                }

                if (isExcel) {
                  return (
                    <ExcelPreview
                      fileUrl={fileUrl}
                      fileName={previewFile.name}
                    />
                  );
                }

                if (isImage) {
                  return (
                    <div className="w-full h-full min-h-[400px] flex items-center justify-center">
                      <img
                        src={fileUrl}
                        alt={previewFile.name}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = `
                            <div class="text-center p-8">
                              <span class="text-5xl block mb-3">🖼️</span>
                              <p class="text-slate-600 dark:text-slate-400 font-medium">Gagal memuat gambar</p>
                              <p class="text-sm text-slate-400 dark:text-slate-500">${fileUrl}</p>
                            </div>
                          `;
                        }}
                      />
                    </div>
                  );
                }

                if (isPdf) {
                  return (
                    <div className="w-full h-full min-h-[400px] flex items-center justify-center">
                      <iframe
                        src={fileUrl}
                        title={previewFile.name}
                        className="w-full h-full min-h-[400px] rounded-lg border-0"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = `
                            <div class="text-center p-8">
                              <span class="text-5xl block mb-3">📄</span>
                              <p class="text-slate-600 dark:text-slate-400 font-medium">Gagal memuat PDF</p>
                              <p class="text-sm text-slate-400 dark:text-slate-500">${fileUrl}</p>
                            </div>
                          `;
                        }}
                      />
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <span className="text-5xl mb-4">📎</span>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      Preview tidak tersedia untuk tipe{" "}
                      <strong>{fileType || "unknown"}</strong>
                    </p>
                    <a
                      href={getDownloadUrl(fileUrl)}
                      download={previewFile.name}
                      className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                      ⬇️ Download File
                    </a>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 rounded-b-2xl flex-shrink-0">
              <button
                onClick={closePreview}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
              >
                Tutup
              </button>
              <a
                href={getDownloadUrl(
                  getFileUrl(
                    customer,
                    previewFile.folderName,
                    previewFile.name,
                  ),
                )}
                download={previewFile.name}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
              >
                ⬇️ Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL UPLOAD ──────────────────────────── */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowUploadModal(false);
          }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                📤 Upload File
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Folder Tujuan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={uploadData.folder}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, folder: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 transition-all"
                >
                  <option
                    value=""
                    className="text-slate-700 dark:text-slate-300 dark:bg-slate-700"
                  >
                    -- Pilih Folder --
                  </option>
                  {customFolders.length === 0 ? (
                    <option
                      value=""
                      disabled
                      className="text-slate-400 dark:text-slate-500 dark:bg-slate-700"
                    >
                      Belum ada folder custom. Buat folder dulu.
                    </option>
                  ) : (
                    customFolders.map((f) => (
                      <option
                        key={f}
                        value={f}
                        className="text-slate-700 dark:text-slate-200 dark:bg-slate-700"
                      >
                        {f}
                      </option>
                    ))
                  )}
                </select>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  💡 Folder default (DRAWING, PIS, QCPC, CS) tidak muncul di
                  sini. Gunakan pilihan "Tipe Dokumen" untuk kategorisasi.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Tipe Dokumen <span className="text-rose-500">*</span>
                </label>
                <select
                  value={uploadData.docType}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, docType: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 transition-all"
                >
                  {DOC_TYPES.map((type) => (
                    <option
                      key={type}
                      value={type}
                      className="text-slate-700 dark:text-slate-200 dark:bg-slate-700"
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih File <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png,.tif,.tiff,.webp,.gif,.bmp"
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      files: Array.from(e.target.files),
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
                />
                {uploadData.files.length > 0 && (
                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                    ✅ {uploadData.files.length} file siap
                  </p>
                )}
              </div>

              {/* ─── PROGRESS BAR ──────────────────────── */}
              {uploadProgress.total > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {uploadProgress.status} ({uploadProgress.current}/
                    {uploadProgress.total})
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 rounded-b-2xl">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleUpload}
                disabled={uploadProgress.total > 0}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload{" "}
                {uploadData.files.length > 0
                  ? `(${uploadData.files.length})`
                  : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL TAMBAH FOLDER ───────────────────── */}
      {showAddFolderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddFolderModal(false);
          }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                📂 Tambah Folder Custom
              </h3>
              <button
                onClick={() => setShowAddFolderModal(false)}
                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Folder <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Contoh: TMMIN_737D"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddFolder();
                  }}
                />
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Folder ini akan muncul di dropdown upload dan menjadi folder
                  fisik di server.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 rounded-b-2xl">
              <button
                onClick={() => setShowAddFolderModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleAddFolder}
                className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL KONFIRMASI HAPUS MULTIPLE ──────── */}
      {isDeleteMultipleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDeleteMultipleModal(false);
          }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗑️</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Hapus Multiple File
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Apakah Anda yakin ingin menghapus{" "}
                <strong>{selectedFiles.length}</strong> file yang dipilih?
                <br />
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 p-5 border-t border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 rounded-b-2xl">
              <button
                onClick={() => setIsDeleteMultipleModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteMultiple}
                className="px-6 py-2.5 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                Ya, Hapus {selectedFiles.length} File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
