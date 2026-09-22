import React, { useState } from 'react';
import { useDocuments } from '../hooks/useDocuments';
import MonitoringCards from '../components/Dashboard/MonitoringCards';
import DocumentTable from '../components/Documents/DocumentTable';
import DocumentForm from '../components/Documents/DocumentForm';
import DeleteConfirmation from '../components/Documents/DeleteConfirmation';
import Toast from '../components/Toast';

const DashboardPage = () => {
  const { documents, addDocument, updateDocument, deleteDocument } = useDocuments();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleAdd = () => {
    setEditingDoc(null);
    setIsFormOpen(true);
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setIsFormOpen(true);
  };

  const handleSave = (formData) => {
    if (editingDoc) {
      updateDocument(editingDoc.id, formData);
      showToast(`Dokumen "${formData.name}" berhasil diperbarui!`);
    } else {
      addDocument(formData);
      showToast(`Dokumen "${formData.name}" berhasil ditambahkan!`);
    }
    setIsFormOpen(false);
    setEditingDoc(null);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    const doc = documents.find(d => d.id === deleteId);
    deleteDocument(deleteId);
    showToast(`Dokumen "${doc?.name}" berhasil dihapus!`);
    setIsDeleteOpen(false);
    setDeleteId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-2">
            <span className="text-blue-600">📄</span> QC Document Management System
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Kelola & monitor dokumen quality control</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">👤 User</span>
          <span className="text-sm text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">⚙️ Pengaturan</span>
        </div>
      </header>

      <MonitoringCards documents={documents} />

      <DocumentTable
        documents={documents}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />

      <footer className="mt-8 text-center text-sm text-slate-400 border-t border-slate-200/60 pt-6">
        © 2020 Dokumen Quality Control System
      </footer>

      <DocumentForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingDoc(null); }}
        onSave={handleSave}
        editingDoc={editingDoc}
      />

      <DeleteConfirmation
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
      />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default DashboardPage;