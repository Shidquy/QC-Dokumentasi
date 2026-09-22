// src/components/History/HistoryPage.jsx
import { useMemo, useState } from 'react';

const IconChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export default function HistoryPage({ documents, filterType, onBack, onFilterChange, CUSTOMERS, STATUSES, STATUS_COLORS }) {
  const [selectedFilter, setSelectedFilter] = useState(filterType || 'all');

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedFilter(value);
    if (onFilterChange) onFilterChange(value === 'all' ? null : value);
  };

  const filteredDocs = useMemo(() => {
    if (selectedFilter === 'submit') return documents.filter(d => d.status === 'Release');
    if (selectedFilter === 'return') return documents.filter(d => d.status === 'Review Status');
    return documents;
  }, [documents, selectedFilter]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');
  };

  const getTitle = () => {
    if (selectedFilter === 'submit') return '📤 History Submit';
    if (selectedFilter === 'return') return '📥 History Return Submit';
    return '📜 History Dokumen';
  };
  const getBadgeColor = () => {
    if (selectedFilter === 'submit') return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    if (selectedFilter === 'return') return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800';
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span>{getTitle().split(' ')[0]}</span>
            <span>History</span>
          </h1>
          <div className="relative inline-block">
            <select
              value={selectedFilter}
              onChange={handleFilterChange}
              className="appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg pl-4 pr-10 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 transition-all"
            >
              <option value="all">Semua</option>
              <option value="submit">Submit (Release)</option>
              <option value="return">Return Submit (Review Status)</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"><IconChevronDown /></span>
          </div>
          <span className={`ml-2 text-sm font-normal px-3 py-1 rounded-full border ${getBadgeColor()}`}>{filteredDocs.length} dokumen</span>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-sm font-medium whitespace-nowrap"
        >
          ← Kembali
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-700/50 border-b border-slate-200/80 dark:border-slate-700">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-14">No</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Dokumen</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tanggal Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📭</span>
                      <p className="font-medium">Tidak ada dokumen</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Belum ada dokumen dengan filter ini</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc, idx) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 border-b border-slate-100/80 dark:border-slate-700/50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-5 py-3.5 text-slate-800 dark:text-white font-medium">{doc.name}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium border border-blue-100/60 dark:border-blue-800">{doc.customer}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[doc.status] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'}`}>{doc.status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 text-xs">{formatDate(doc.date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 border-t border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Total {filteredDocs.length} dokumen</span>
        </div>
      </div>
    </div>
  );
}