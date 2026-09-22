// src/hooks/useDocuments.js
import { useState, useEffect } from 'react';
import { INITIAL_DOCUMENTS, DOCUMENTS_STORAGE_KEY } from '../utils/constants';

export function useDocuments() {
  const [documents, setDocuments] = useState(() => {
    const stored = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return INITIAL_DOCUMENTS;
      }
    }
    return INITIAL_DOCUMENTS;
  });

  useEffect(() => {
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documents));
  }, [documents]);

  const addDocument = (doc) => {
    const newDoc = {
      id: `doc_${Date.now()}`,
      ...doc,
    };
    setDocuments(prev => [...prev, newDoc]);
  };

  const updateDocument = (id, updatedDoc) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, ...updatedDoc } : doc));
  };

  const deleteDocument = (id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  return { documents, addDocument, updateDocument, deleteDocument };
}