// src/components/ListDQC/ListDQC.jsx
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MonitoringChart from '../Dashboard/MonitoringChart';
import ProgressChart from '../Dashboard/ProgressChart';

// Icons (sama seperti sebelumnya)
const IconPlus = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>);
const IconEdit = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const IconDelete = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const IconSearch = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const IconClose = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const IconCheck = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>);
const IconAlert = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>);
const IconPdf = () => <span className="text-rose-600 dark:text-rose-400 text-lg">📄</span>;
const IconArrowRight = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>);

const Toast = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-amber-600';
  const [show, setShow] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => { setShow(false); onClose(); }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);
  if (!show) return null;
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl text-white shadow-xl ${bgColor} max-w-sm`}>
      <span className="flex-shrink-0">{type === 'success' ? <IconCheck /> : <IconAlert />}</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 text-white/80 hover:text-white"><IconClose /></button>
    </div>
  );
};

export default function ListDQC({
  documents,
  addDocument,
  updateDocument,
  deleteDocument,
  CUSTOMERS,
  STATUSES,
  STATUS_COLORS,
  onNavigateToHistory, // <-- tambahan prop
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    customer: CUSTOMERS[0],
    status: STATUSES[0] || 'IRD',
    date: new Date().toISOString().slice(0, 16),
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [toast, setToast] = useState(null);

  // Hitung statistik untuk chart
  const totalDocs = documents.length;
  const releaseCount = documents.filter(d => d.status === 'Release').length;
  const prosesCount = documents.filter(d => d.status === 'Proses').length;
  const reviewCount = documents.filter(d => d.status === 'Review Status').length;
  const submitCount = releaseCount;
  const returnSubmitCount = reviewCount;

  const filteredDocs = useMemo(() => {
    let result = documents;
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter(doc => (doc.name || '').toLowerCase().includes(term));
    }
    if (filterCustomer) result = result.filter(doc => doc.customer === filterCustomer);
    if (filterStatus) result = result.filter(doc => doc.status === filterStatus);
    return result;
  }, [documents, searchTerm, filterCustomer, filterStatus]);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = () => setToast(null);

  const resetForm = () => {
    setFormData({
      name: '',
      customer: CUSTOMERS[0],
      status: STATUSES[0] || 'IRD',
      date: new Date().toISOString().slice(0, 16),
    });
    setEditingDoc(null);
  };

  const handleAddClick = () => {
    resetForm();
    setIsFormModalOpen(true);
  };
  const handleEditClick = (doc) => {
    setEditingDoc(doc);
    setFormData({
      name: doc.name,
      customer: doc.customer,
      status: doc.status,
      date: (doc.date || new Date().toISOString()).slice(0, 16),
    });
    setIsFormModalOpen(true);
  };
  const handleSaveDocument = async () => {
    if (!formData.name.trim()) {
      showToast('Part number wajib diisi!', 'error');
      return;
    }
    if (editingDoc) {
      await updateDocument(editingDoc.id, { ...formData, name: formData.name.trim() });
      showToast(`Part "${formData.name}" berhasil diperbarui!`, 'success');
    } else {
      await addDocument({ ...formData, name: formData.name.trim() });
      showToast(`Part "${formData.name}" berhasil ditambahkan!`, 'success');
    }
    setIsFormModalOpen(false);
    resetForm();
  };
  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      const doc = documents.find(d => d.id === deleteTargetId);
      await deleteDocument(deleteTargetId);
      showToast(`Part "${doc?.name || ''}" berhasil dihapus!`, 'success');
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');
  };

  const uniqueStatuses = useMemo(() => {
    const statusSet = new Set(documents.map(doc => doc.status).filter(Boolean));
    return Array.from(statusSet);
  }, [documents]);

  return (
    <div>
      {/* Dua Chart - Dipindah dari Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Monitoring Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 border border-slate-200/80 dark:border-slate-700 h-full">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Monitoring</span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">Submit</h3>
            </div>
            <span className="text-2xl">📊</span>
          </div>
          <div className="flex flex-col items-center">
            <MonitoringChart releaseCount={releaseCount} reviewCount={reviewCount} totalDocs={totalDocs} />
            <div className="w-full mt-3 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group" onClick={() => onNavigateToHistory?.('submit')}>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">Submit</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">{submitCount}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 group-hover:text-blue-400"><IconArrowRight /></span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer transition-colors group" onClick={() => onNavigateToHistory?.('return')}>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-rose-700 dark:group-hover:text-rose-400">Return Submit</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-white group-hover:text-rose-700 dark:group-hover:text-rose-400">{returnSubmitCount}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 group-hover:text-rose-400"><IconArrowRight /></span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-600"></span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">Lainnya</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-white">{totalDocs - releaseCount - reviewCount}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 text-center">
            Klik <span className="font-medium text-blue-600 dark:text-blue-400">Submit</span> atau <span className="font-medium text-rose-600 dark:text-rose-400">Return Submit</span>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 border border-slate-200/80 dark:border-slate-700 h-full">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Progress</span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">Status Dokumen</h3>
            </div>
            <span className="text-2xl">📈</span>
          </div>
          <div className="flex flex-col items-center">
            <ProgressChart releaseCount={releaseCount} prosesCount={prosesCount} totalDocs={totalDocs} />
            <div className="w-full mt-3 space-y-2">
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">Selesai</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-white">{releaseCount}</span>
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">Proses</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-white">{prosesCount}</span>
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-600"></span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">Tersisa</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-white">{totalDocs - releaseCount - prosesCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bagian tabel List Part */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200/80 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span>📋</span> List Part Monthly
            <span className="ml-2 text-sm font-normal text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 rounded-full">{filteredDocs.length}</span>
          </h2>
          {isAdmin && (
            <button
              onClick={handleAddClick}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98] whitespace-nowrap"
            >
              <IconPlus /> Tambah Part
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1 sm:min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"><IconSearch /></span>
            <input
              type="text"
              placeholder="Cari part number..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 transition-all"
            />
          </div>
          <select
            value={filterCustomer}
            onChange={e => setFilterCustomer(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 dark:text-white text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 transition-all appearance-none cursor-pointer"
          >
            <option value="">Semua Customer</option>
            {CUSTOMERS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 dark:text-white text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 transition-all appearance-none cursor-pointer"
          >
            <option value="">Semua Aktivitas</option>
            {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-700/50 border-b border-slate-200/80 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-14">No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Part Number</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aktivitas</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tanggal</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-28">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📭</span>
                      <p className="font-medium">Tidak ada part number</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Klik "Tambah Part" untuk menambahkan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc, idx) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 border-b border-slate-100/80 dark:border-slate-700/50 transition-colors">
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3 text-slate-800 dark:text-white font-medium flex items-center gap-2">
                      <IconPdf />
                      <span>{doc.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium border border-blue-100/60 dark:border-blue-800">
                        {doc.customer}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[doc.status] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">{formatDate(doc.date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {isAdmin && (
                          <>
                            <button onClick={() => handleEditClick(doc)} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"><IconEdit /></button>
                            <button onClick={() => handleDeleteClick(doc.id)} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"><IconDelete /></button>
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
        <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
          Menampilkan {filteredDocs.length} dari {documents.length} part number
        </div>
      </div>

      {/* Modal dan Toast */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setIsFormModalOpen(false); }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{editingDoc ? '✏️ Edit Part' : '➕ Tambah Part'}</h3>
              <button onClick={() => setIsFormModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"><IconClose /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Part Number <span className="text-rose-500">*</span></label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 transition-all" placeholder="Masukkan part number..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Customer <span className="text-rose-500">*</span></label>
                <select value={formData.customer} onChange={e => setFormData({ ...formData, customer: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 transition-all appearance-none cursor-pointer">
                  {CUSTOMERS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status <span className="text-rose-500">*</span></label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 transition-all appearance-none cursor-pointer">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tanggal</label>
                <input type="datetime-local" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 transition-all" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 rounded-b-2xl">
              <button onClick={() => setIsFormModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">Batal</button>
              <button onClick={handleSaveDocument} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]">{editingDoc ? 'Update' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setIsDeleteModalOpen(false); }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto mb-4"><span className="text-3xl">🗑️</span></div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Hapus Part</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Apakah Anda yakin ingin menghapus part number ini?<br />Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="flex items-center justify-center gap-3 p-5 border-t border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 rounded-b-2xl">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">Tidak</button>
              <button onClick={handleConfirmDelete} className="px-6 py-2.5 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
