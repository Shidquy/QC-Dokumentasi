import React from 'react';

const DeleteConfirmation = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🗑️</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Hapus Dokumen</h3>
          <p className="mt-2 text-sm text-slate-500">
            Apakah Anda yakin ingin menghapus dokumen ini?<br />
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 p-5 border-t border-slate-200 bg-slate-50/50 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition">
            Tidak
          </button>
          <button onClick={onConfirm} className="px-6 py-2.5 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition shadow-sm">
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;