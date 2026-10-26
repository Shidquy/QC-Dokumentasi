// src/hooks/useCustomerFiles.js
import { useState, useEffect, useCallback } from 'react';
import { getInitialCustomerFiles, CUSTOMER_FILES_STORAGE_KEY } from '../utils/constants';
import { API_BASE_URL } from '../utils/api';
import axios from 'axios';

export function useCustomerFiles() {
  const [customerFiles, setCustomerFiles] = useState(() => {
    const stored = localStorage.getItem(CUSTOMER_FILES_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return getInitialCustomerFiles();
      }
    }
    return getInitialCustomerFiles();
  });
  const [loading, setLoading] = useState(false);

  // Fetch dari database MySQL melalui API backend
  const fetchFoldersAndFiles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/folders`);
      if (res.data?.success && res.data.data) {
        setCustomerFiles(res.data.data);
        localStorage.setItem(CUSTOMER_FILES_STORAGE_KEY, JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.warn('⚠️ Tidak dapat mengambil data customer files dari backend, menggunakan data lokal/cache:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFoldersAndFiles();
  }, [fetchFoldersAndFiles]);

  const getFolders = (customer) => {
    return customerFiles[customer] || [];
  };

  const getFiles = (customer, folderName) => {
    const folders = getFolders(customer);
    const folder = folders.find((f) => f.name === folderName);
    return folder ? folder.files : [];
  };

  const addFolder = async (customer, folderName) => {
    if (!customer || !folderName.trim()) return;
    const cleanName = folderName.trim();
    const folders = getFolders(customer);

    if (folders.some((f) => f.name.toLowerCase() === cleanName.toLowerCase())) {
      alert('Folder dengan nama tersebut sudah ada!');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/folders`, {
        customer,
        folderName: cleanName,
      });

      if (res.data?.success && res.data.data) {
        const newFolder = res.data.data;
        setCustomerFiles((prev) => ({
          ...prev,
          [customer]: [...(prev[customer] || []), newFolder],
        }));
        return;
      }
    } catch (err) {
      console.error('Gagal membuat folder di server:', err);
    }

    // Fallback lokal jika backend tidak terhubung
    const fallbackFolder = {
      id: `${customer}_${cleanName}_${Date.now()}`,
      name: cleanName,
      files: [],
    };
    setCustomerFiles((prev) => ({
      ...prev,
      [customer]: [...(prev[customer] || []), fallbackFolder],
    }));
  };

  const addFile = (customer, folderName, fileData) => {
    if (!customer || !folderName || !fileData) return;
    const folders = getFolders(customer);
    const folderIndex = folders.findIndex((f) => f.name === folderName);
    if (folderIndex === -1) {
      alert('Folder tidak ditemukan!');
      return;
    }

    const newFile = {
      id: fileData.id || `${customer}_${folderName}_${Date.now()}`,
      name: fileData.name,
      type: fileData.type || 'pdf',
      size: fileData.size || '0.5 MB',
      date: fileData.date || new Date().toISOString().split('T')[0],
      docType: fileData.docType || 'Drawing',
      url: fileData.url || '',
    };

    setCustomerFiles((prev) => {
      const updated = { ...prev };
      const foldersCopy = [...(updated[customer] || [])];
      foldersCopy[folderIndex] = {
        ...foldersCopy[folderIndex],
        files: [newFile, ...(foldersCopy[folderIndex].files || [])],
      };
      updated[customer] = foldersCopy;
      localStorage.setItem(CUSTOMER_FILES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteFile = async (customer, folderName, fileId) => {
    if (!customer || !folderName || !fileId) return;

    const folders = getFolders(customer);
    const folder = folders.find((f) => f.name === folderName);
    const file = folder?.files.find((f) => f.id === fileId);

    try {
      await axios.delete(`${API_BASE_URL}/api/files`, {
        data: {
          fileId,
          fileUrl: file?.url,
          customer,
          folder,
          fileName: file?.name,
        },
      });
      console.log('✅ File fisik dan metadata berhasil dihapus dari server');
    } catch (error) {
      console.error('❌ Gagal hapus file di server:', error);
    }

    setCustomerFiles((prev) => {
      const updated = { ...prev };
      const foldersCopy = [...(updated[customer] || [])];
      const folderIndex = foldersCopy.findIndex((f) => f.name === folderName);
      if (folderIndex === -1) return prev;
      foldersCopy[folderIndex] = {
        ...foldersCopy[folderIndex],
        files: foldersCopy[folderIndex].files.filter((f) => f.id !== fileId),
      };
      updated[customer] = foldersCopy;
      localStorage.setItem(CUSTOMER_FILES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteFolder = async (customer, folderName) => {
    if (!customer || !folderName) return;
    const defaultFolders = ['DRAWING', 'PIS', 'QCPC', 'CS'];
    if (defaultFolders.includes(folderName.toUpperCase())) {
      alert('Tidak dapat menghapus folder default!');
      return;
    }
    if (!window.confirm(`Hapus folder "${folderName}" beserta semua isinya?`)) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/folders`, {
        data: { customer, folder: folderName },
      });
      console.log('✅ Folder berhasil dihapus dari database dan server');
    } catch (error) {
      console.error('❌ Gagal hapus folder di server:', error);
    }

    setCustomerFiles((prev) => {
      const updated = {
        ...prev,
        [customer]: (prev[customer] || []).filter((f) => f.name !== folderName),
      };
      localStorage.setItem(CUSTOMER_FILES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const renameFolder = async (customer, oldName, newName) => {
    if (!customer || !oldName || !newName.trim()) return;
    const cleanNewName = newName.trim();
    const defaultFolders = ['DRAWING', 'PIS', 'QCPC', 'CS'];
    if (defaultFolders.includes(oldName.toUpperCase())) {
      alert('Tidak dapat mengganti nama folder default!');
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/api/folders/rename`, {
        customer,
        oldName,
        newName: cleanNewName,
      });
      console.log('✅ Folder berhasil di-rename di database');
    } catch (error) {
      console.error('❌ Gagal rename folder di server:', error);
    }

    setCustomerFiles((prev) => {
      const updated = { ...prev };
      const folders = [...(updated[customer] || [])];
      const folderIndex = folders.findIndex((f) => f.name === oldName);
      if (folderIndex === -1) return prev;
      folders[folderIndex] = {
        ...folders[folderIndex],
        name: cleanNewName,
        id: `${customer}_${cleanNewName}_${Date.now()}`,
      };
      updated[customer] = folders;
      localStorage.setItem(CUSTOMER_FILES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return {
    customerFiles,
    loading,
    getFolders,
    getFiles,
    addFolder,
    addFile,
    deleteFile,
    deleteFolder,
    renameFolder,
    setCustomerFiles,
    refreshCustomerFiles: fetchFoldersAndFiles,
  };
}
