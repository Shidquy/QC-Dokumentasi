import React, { useState, useEffect } from 'react';
import { CUSTOMERS, STATUSES } from '../../utils/mockData';
import { FaTimes } from 'react-icons/fa';

const DocumentForm = ({ isOpen, onClose, onSave, editingDoc }) => {
  const [formData, setFormData] = useState({
    name: '',
    customer: CUSTOMERS[0],
    status: STATUSES[0],
    date: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    if (editingDoc) {
      setFormData({
        name: editingDoc.name,
        customer: editingDoc.customer,
        status: editingDoc.status,
        date: editingDoc.date.slice(0, 16),
      });
    } else {
      setFormData({
        name: '',
        customer: CUSTOMERS[0],
        status: STATUSES[0],
        date: new Date().toISOString().slice(0, 16),
      });
    }
  }, [editingDoc, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama dokumen wajib diisi!');
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">
            {editingDoc ? '✏️ Edit Dokumen' : '➕ Tambah Dokumen'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Dokumen <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/80 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Customer <span className="text-rose-500">*</span></label>
            <select
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/80 text-sm focus:outline-none focus:border-blue-500"
              required
            >
              {CUSTOMERS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status <span className="text-rose-500">*</span></label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/80 text-sm focus:outline-none focus:border-blue-500"
              required
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Update <span className="text-rose-500">*</span></label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/80 text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition">
              Batal
            </button>
            <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm">
              {editingDoc ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentForm;