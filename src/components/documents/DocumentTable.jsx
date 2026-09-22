import React, { useState } from 'react';
import { CUSTOMERS, STATUSES } from '../../utils/mockData';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';

const DocumentTable = ({ documents, onEdit, onDelete, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredDocs = documents.filter(doc => {
    const matchSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCustomer = filterCustomer ? doc.customer === filterCustomer : true;
    const matchStatus = filterStatus ? doc.status === filterStatus : true;
    return matchSearch && matchCustomer && matchStatus;
  });

  const statusColors = {
    'Release': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Proses': 'bg-amber-100 text-amber-700 border-amber-200',
    'Review Status': 'bg-orange-100 text-orange-700 border-orange-200',
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).replace(',', '');
  };

  return (
    <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
      {/* Header dengan filter dan search */}
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span>📋</span> Dokumen Terbina
          <span className="ml-2 text-sm font-normal text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {filteredDocs.length}
          </span>
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari dokumen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/80 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <select
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/80 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">Semua Customer</option>
            {CUSTOMERS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/80 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">Semua Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
          >
            <FaPlus /> Tambah
          </button>
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase w-14">No</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase">Nama Dokumen</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase">Customer</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase">Tanggal Update</th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase w-28">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">📭</span>
                    <p className="font-medium">Tidak ada dokumen</p>
                    <p className="text-xs text-slate-400">Coba ubah filter atau tambahkan baru</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc, idx) => (
                <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition">
                  <td className="px-5 py-3.5 text-slate-500 font-medium">{idx + 1}</td>
                  <td className="px-5 py-3.5 text-slate-800 font-medium">{doc.name}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
                      {doc.customer}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${statusColors[doc.status] || 'bg-slate-100 text-slate-700'}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 text-xs">{formatDate(doc.date)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => onEdit(doc)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition">
                        <FaEdit />
                      </button>
                      <button onClick={() => onDelete(doc.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <span>Total {filteredDocs.length} dokumen dari {documents.length}</span>
        <span className="text-slate-400">Terakhir diperbarui: {new Date().toLocaleString()}</span>
      </div>
    </div>
  );
};

export default DocumentTable;