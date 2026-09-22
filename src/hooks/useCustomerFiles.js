// src/hooks/useCustomerFiles.js
import { useState, useEffect } from "react";
import {
  getInitialCustomerFiles,
  CUSTOMER_FILES_STORAGE_KEY,
} from "../utils/constants";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

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

  useEffect(() => {
    localStorage.setItem(
      CUSTOMER_FILES_STORAGE_KEY,
      JSON.stringify(customerFiles),
    );
  }, [customerFiles]);

  const getFolders = (customer) => {
    return customerFiles[customer] || [];
  };

  const getFiles = (customer, folderName) => {
    const folders = getFolders(customer);
    const folder = folders.find((f) => f.name === folderName);
    return folder ? folder.files : [];
  };

  const addFolder = (customer, folderName) => {
    if (!customer || !folderName.trim()) return;
    const folders = getFolders(customer);
    if (
      folders.some(
        (f) => f.name.toLowerCase() === folderName.trim().toLowerCase(),
      )
    ) {
      alert("Folder dengan nama tersebut sudah ada!");
      return;
    }
    const newFolder = {
      id: `${customer}_${folderName.trim()}_${Date.now()}`,
      name: folderName.trim(),
      files: [],
    };
    setCustomerFiles((prev) => ({
      ...prev,
      [customer]: [...(prev[customer] || []), newFolder],
    }));
  };

  // ─── ADD FILE ──────────────────────────────────────
  const addFile = (customer, folderName, fileData) => {
    if (!customer || !folderName || !fileData) return;
    const folders = getFolders(customer);
    const folderIndex = folders.findIndex((f) => f.name === folderName);
    if (folderIndex === -1) {
      alert("Folder tidak ditemukan!");
      return;
    }
    const newFile = {
      id: `${customer}_${folderName}_${Date.now()}`,
      name: fileData.name,
      type: fileData.type || "pdf",
      size: fileData.size || "0.5 MB",
      date: new Date().toISOString().split("T")[0],
      docType: fileData.docType || "Drawing",
      url: fileData.url || "",
    };
    setCustomerFiles((prev) => {
      const updated = { ...prev };
      const foldersCopy = [...(updated[customer] || [])];
      foldersCopy[folderIndex] = {
        ...foldersCopy[folderIndex],
        files: [...foldersCopy[folderIndex].files, newFile],
      };
      updated[customer] = foldersCopy;
      return updated;
    });
  };

  // ─── DELETE FILE (HAPUS METADATA + FILE FISIK) ───
  const deleteFile = async (customer, folderName, fileId) => {
    if (!customer || !folderName || !fileId) return;

    // Cari file di state untuk mendapatkan URL
    const folders = getFolders(customer);
    const folder = folders.find((f) => f.name === folderName);
    const file = folder?.files.find((f) => f.id === fileId);

    if (file && file.url) {
      try {
        // Kirim request delete ke server untuk menghapus file fisik
        await axios.delete(`${API_BASE_URL}/api/files`, {
          data: { fileUrl: file.url },
        });
        console.log("✅ File fisik dihapus dari server");
      } catch (error) {
        console.error("❌ Gagal hapus file fisik:", error);
        // Tetap lanjutkan untuk menghapus metadata
      }
    }

    // Hapus metadata dari localStorage
    setCustomerFiles((prev) => {
      const updated = { ...prev };
      const folders = [...(updated[customer] || [])];
      const folderIndex = folders.findIndex((f) => f.name === folderName);
      if (folderIndex === -1) return prev;
      folders[folderIndex] = {
        ...folders[folderIndex],
        files: folders[folderIndex].files.filter((f) => f.id !== fileId),
      };
      updated[customer] = folders;
      return updated;
    });
  };

  // ─── DELETE FOLDER ─────────────────────────────────
  const deleteFolder = async (customer, folderName) => {
    if (!customer || !folderName) return;
    const defaultFolders = ["DRAWING", "PIS", "QCPC", "CS"];
    if (defaultFolders.includes(folderName.toUpperCase())) {
      alert("Tidak dapat menghapus folder default!");
      return;
    }
    if (!window.confirm(`Hapus folder "${folderName}" beserta semua isinya?`))
      return;

    // Hapus folder fisik dari server
    try {
      await axios.delete(`${API_BASE_URL}/api/folders`, {
        data: { customer, folder: folderName },
      });
      console.log("✅ Folder fisik dihapus dari server");
    } catch (error) {
      console.error("❌ Gagal hapus folder fisik:", error);
    }

    // Hapus dari state
    setCustomerFiles((prev) => ({
      ...prev,
      [customer]: (prev[customer] || []).filter((f) => f.name !== folderName),
    }));
  };

  const renameFolder = (customer, oldName, newName) => {
    if (!customer || !oldName || !newName.trim()) return;
    const defaultFolders = ["DRAWING", "PIS", "QCPC", "CS"];
    if (defaultFolders.includes(oldName.toUpperCase())) {
      alert("Tidak dapat mengganti nama folder default!");
      return;
    }
    setCustomerFiles((prev) => {
      const updated = { ...prev };
      const folders = [...(updated[customer] || [])];
      const folderIndex = folders.findIndex((f) => f.name === oldName);
      if (folderIndex === -1) return prev;
      folders[folderIndex] = {
        ...folders[folderIndex],
        name: newName.trim(),
        id: `${customer}_${newName.trim()}_${Date.now()}`,
      };
      updated[customer] = folders;
      return updated;
    });
  };

  return {
    customerFiles,
    getFolders,
    getFiles,
    addFolder,
    addFile,
    deleteFile,
    deleteFolder,
    renameFolder,
    setCustomerFiles,
  };
}
