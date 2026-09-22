// src/utils/constants.js
export const CUSTOMERS = ['TMMIN', 'HINO', 'ISUZU', 'ADM', 'AHM', 'SIM', 'KTB', 'HPM', 'MMIKI'];

export const DEFAULT_FOLDERS = ['DRAWING', 'PIS', 'QCPC', 'CS'];

export const STATUSES = ['Release', 'Proses', 'Review Status'];

export const STATUS_COLORS = {
  'Release': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  'Proses': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  'Review Status': 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
};

export const AUTH_STORAGE_KEY = 'qc_auth_user';
export const CUSTOMER_FILES_STORAGE_KEY = 'qc_customer_files';
export const DOCUMENTS_STORAGE_KEY = 'qc_documents'; // untuk data part monthly

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'list-dqc', label: 'List Part Monthly', icon: '📋' },
  { id: 'data-customer', label: 'Data Customer', icon: '👥' },
];

// Data awal untuk dokumen (part monthly)
export const INITIAL_DOCUMENTS = [
  {
    id: 'doc1',
    name: '737D_77261-KK040-C',
    customer: 'TMMIN',
    status: 'Release',
    date: new Date().toISOString(),
  },
  {
    id: 'doc2',
    name: '737D_77255-KK250-B',
    customer: 'TMMIN',
    status: 'Proses',
    date: new Date().toISOString(),
  },
  // tambahkan contoh lain jika perlu
];

export function getInitialCustomerFiles() {
  const initial = {};
  CUSTOMERS.forEach(customer => {
    initial[customer] = DEFAULT_FOLDERS.map(folder => ({
      id: `${customer}_${folder}_default`,
      name: folder,
      files: [],
    }));
  });
  return initial;
}