// src/hooks/useDocuments.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { INITIAL_DOCUMENTS, DOCUMENTS_STORAGE_KEY } from '../utils/constants';

const API_BASE_URL = 'http://localhost:5000';

export function useDocuments() {
  const [documents, setDocuments] = useState(() => {
    const stored = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return INITIAL_DOCUMENTS;
      }
    }
    return INITIAL_DOCUMENTS;
  });
  const [loading, setLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/documents`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setDocuments(res.data.data);
        localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.warn('⚠️ Tidak dapat mengambil data dokumen dari backend, menggunakan data lokal/cache:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Sinkronisasi otomatis ke localStorage saat documents berubah
  useEffect(() => {
    if (Array.isArray(documents)) {
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documents));
    }
  }, [documents]);

  const addDocument = async (doc) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/documents`, doc);
      if (res.data?.success && res.data.data) {
        const createdDoc = res.data.data;
        setDocuments((prev) => [createdDoc, ...(Array.isArray(prev) ? prev : [])]);
        return createdDoc;
      }
    } catch (err) {
      console.error('Gagal menambah dokumen ke database:', err);
    }
    // Fallback lokal jika backend gagal
    const fallbackDoc = {
      id: `doc_${Date.now()}`,
      ...doc,
      date: doc.date || new Date().toISOString(),
    };
    setDocuments((prev) => [fallbackDoc, ...(Array.isArray(prev) ? prev : [])]);
    return fallbackDoc;
  };

  const updateDocument = async (id, updatedDoc) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/documents/${id}`, updatedDoc);
      if (res.data?.success && res.data.data) {
        const newDoc = res.data.data;
        setDocuments((prev) =>
          (Array.isArray(prev) ? prev : []).map((doc) => (doc.id === id ? { ...doc, ...newDoc } : doc))
        );
        return newDoc;
      }
    } catch (err) {
      console.error('Gagal memperbarui dokumen di database:', err);
    }
    // Fallback lokal
    setDocuments((prev) =>
      (Array.isArray(prev) ? prev : []).map((doc) => (doc.id === id ? { ...doc, ...updatedDoc } : doc))
    );
  };

  const deleteDocument = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/documents/${id}`);
    } catch (err) {
      console.error('Gagal menghapus dokumen dari database:', err);
    }
    setDocuments((prev) => (Array.isArray(prev) ? prev : []).filter((doc) => doc.id !== id));
  };

  return {
    documents: Array.isArray(documents) ? documents : [],
    loading,
    addDocument,
    updateDocument,
    deleteDocument,
    refreshDocuments: fetchDocuments,
  };
}
