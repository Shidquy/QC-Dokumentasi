// src/components/Dashboard/Dashboard.jsx
import { useState, useEffect, useMemo } from "react";
import { useCustomerFiles } from "../../hooks/useCustomerFiles";
import { CUSTOMERS } from "../../utils/constants";
import { useAuth } from "../../contexts/AuthContext";
import { customerLogos } from "../../utils/customerLogos";
import { FaBuilding } from "react-icons/fa";

// Icons
const IconEdit = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);
const IconDelete = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
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
const IconClose = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const IconCheck = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const IconAlert = () => (
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
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);
const IconFile = () => (
  <span className="text-slate-400 dark:text-slate-500 text-sm">📄</span>
);
const IconFolder = () => (
  <span className="text-amber-500 dark:text-amber-400 text-sm">📁</span>
);

const Toast = ({ message, type, onClose }) => {
  const bgColor =
    type === "success"
      ? "bg-emerald-600"
      : type === "error"
        ? "bg-rose-600"
        : "bg-amber-600";
  const [show, setShow] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);
  if (!show) return null;
  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl text-white shadow-xl ${bgColor} max-w-sm`}
    >
      <span className="flex-shrink-0">
        {type === "success" ? <IconCheck /> : <IconAlert />}
      </span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 text-white/80 hover:text-white">
        <IconClose />
      </button>
    </div>
  );
};

export default function Dashboard({
  documents,
  filteredDocs,
  searchTerm,
  setSearchTerm,
  filterCustomer,
  setFilterCustomer,
  filterStatus,
  setFilterStatus,
  updateDocument,
  deleteDocument,
  CUSTOMERS,
  STATUSES,
  STATUS_COLORS,
  onNavigateToHistory,
  onCustomerClick,
  onGlobalSearchNavigate,
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { customerFiles } = useCustomerFiles();
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalResults, setGlobalResults] = useState([]);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // ─── STATE UNTUK NOTIFIKASI PENCARIAN KOSONG ──────
  const [showNoResultToast, setShowNoResultToast] = useState(false);

  // ─── EFFECT UNTUK DETEKSI PENCARIAN KOSONG ────────
  useEffect(() => {
    if (globalSearch.trim() && globalResults.length === 0) {
      setShowNoResultToast(true);
      const timer = setTimeout(() => setShowNoResultToast(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowNoResultToast(false);
    }
  }, [globalSearch, globalResults]);

  useEffect(() => {
    if (!globalSearch.trim()) {
      setGlobalResults([]);
      setIsGlobalSearchOpen(false);
      return;
    }
    const term = globalSearch.trim().toLowerCase();
    const results = [];
    CUSTOMERS.forEach((cust) => {
      const folders = customerFiles[cust] || [];
      folders.forEach((folder) => {
        folder.files.forEach((file) => {
          if (
            file.name.toLowerCase().includes(term) ||
            folder.name.toLowerCase().includes(term) ||
            cust.toLowerCase().includes(term)
          ) {
            results.push({ customer: cust, folder: folder.name, file });
          }
        });
      });
    });
    setGlobalResults(results);
    setIsGlobalSearchOpen(results.length > 0);
  }, [globalSearch, customerFiles, CUSTOMERS]);

  const handleResultClick = (cust, keyword) => {
    if (onGlobalSearchNavigate) onGlobalSearchNavigate(cust, keyword);
    setGlobalSearch("");
    setIsGlobalSearchOpen(false);
  };

  const showToast = (message, type = "success") => setToast({ message, type });
  const hideToast = () => setToast(null);

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };
  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      const doc = documents.find((d) => d.id === deleteTargetId);
      deleteDocument(deleteTargetId);
      showToast(`Dokumen "${doc?.name || ""}" berhasil dihapus!`, "success");
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", "");
  };

  // Fungsi untuk mendapatkan logo atau fallback
  const getCustomerLogo = (customer) => {
    const logo = customerLogos[customer];
    if (logo) {
      return (
        <img src={logo} alt={customer} className="w-10 h-10 object-contain" />
      );
    }
    return (
      <FaBuilding className="w-8 h-8 text-slate-400 dark:text-slate-500" />
    );
  };

  return (
    <div>
      {/* ─── NOTIFIKASI PENCARIAN KOSONG ─────────────── */}
      {showNoResultToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-100 dark:bg-amber-900/80 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-md animate-slide-down">
          <div>
            <p className="font-medium">Dokumen Approval Tidak Tersedia</p>
            <p className="text-sm opacity-80">
              Tidak ada file yang sesuai dengan pencarian "{globalSearch}"
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

      {/* Global Search */}
      <div className="mb-6">
        <div className="relative max-w-2xl">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Cari file di semua customer (nama file, folder, atau customer)..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            onFocus={() => globalSearch.trim() && setIsGlobalSearchOpen(true)}
            onBlur={() => setTimeout(() => setIsGlobalSearchOpen(false), 200)}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 shadow-sm transition-all dark:text-white"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600"
            >
              ✕
            </button>
          )}
          {isGlobalSearchOpen && globalResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-700 max-h-80 overflow-y-auto z-50">
              <div className="p-2 text-xs text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700">
                {globalResults.length} hasil ditemukan
              </div>
              {globalResults.slice(0, 15).map((item, idx) => (
                <div
                  key={`${item.customer}-${item.file.id}-${idx}`}
                  onClick={() => handleResultClick(item.customer, globalSearch)}
                  className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors flex items-center gap-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                >
                  <div className="flex-shrink-0">
                    <IconFile />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                      {item.file.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {item.customer}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <IconFolder /> {item.folder}
                      </span>
                      <span>•</span>
                      <span>{item.file.size}</span>
                    </div>
                  </div>
                  <span className="text-xs text-blue-600 dark:text-blue-400 flex-shrink-0">
                    Lihat →
                  </span>
                </div>
              ))}
              {globalResults.length > 15 && (
                <div className="px-4 py-2 text-xs text-slate-400 dark:text-slate-500 text-center border-t border-slate-100 dark:border-slate-700">
                  + {globalResults.length - 15} hasil lainnya
                </div>
              )}
            </div>
          )}
          {isGlobalSearchOpen &&
            globalResults.length === 0 &&
            globalSearch.trim() && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-700 p-6 text-center z-50">
                <span className="text-3xl">🔍</span>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Tidak ada file yang ditemukan
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Coba kata kunci lain
                </p>
              </div>
            )}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 ml-1">
          Cari file di semua customer berdasarkan nama file, folder, atau
          customer
        </p>
      </div>

      {/* Customer / Department Grid - Full Width dengan Logo */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 border border-slate-200/80 dark:border-slate-700 mb-8">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          Customer / Department
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {CUSTOMERS.map((customer) => (
            <button
              key={customer}
              onClick={() => onCustomerClick?.(customer)}
              className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 text-center text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center gap-1.5"
            >
              <div className="h-12 flex items-center justify-center">
                {getCustomerLogo(customer)}
              </div>
              <span className="text-xs sm:text-sm">{customer}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Dokumen Terbaru */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700 overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Dokumen Terbaru
              <span className="ml-2 text-sm font-normal text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 rounded-full">
                {filteredDocs.length}
              </span>
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:min-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <IconSearch />
              </span>
              <input
                type="text"
                placeholder="Cari dokumen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 transition-all"
              />
            </div>
            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 dark:text-white text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 transition-all appearance-none cursor-pointer"
            >
              <option value="">Semua Customer</option>
              {CUSTOMERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 dark:text-white text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 transition-all appearance-none cursor-pointer"
            >
              <option value="">Semua Status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-700/50 border-b border-slate-200/80 dark:border-slate-700">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-14">
                  No
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Nama Dokumen
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tanggal Update
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-28">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="font-medium">Tidak ada dokumen</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Ubah filter atau tambah dokumen baru di halaman List DQC
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc, idx) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 border-b border-slate-100/80 dark:border-slate-700/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="px-5 py-3.5 text-slate-800 dark:text-white font-medium">
                      {doc.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium border border-blue-100/60 dark:border-blue-800">
                        {doc.customer}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[doc.status] || "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"}`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 text-xs">
                      {formatDate(doc.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => {}}
                              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                            >
                              <IconEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(doc.id)}
                              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                            >
                              <IconDelete />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 border-t border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Total {filteredDocs.length} dokumen dari {documents.length}
          </span>
          <span className="text-slate-400 dark:text-slate-500">
            Terakhir diperbarui: {new Date().toLocaleString()}
          </span>
        </div>
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDeleteModalOpen(false);
          }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗑️</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Hapus Dokumen
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Apakah Anda yakin ingin menghapus dokumen ini?
                <br />
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 p-5 border-t border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 rounded-b-2xl">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
              >
                Tidak
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
