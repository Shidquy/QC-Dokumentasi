// src/App.jsx
import { useState, useMemo } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./components/Login/Login";
import MainLayout from "./components/Layout/MainLayout";
import Dashboard from "./components/Dashboard/Dashboard";
import HistoryPage from "./components/History/HistoryPage";
import DataCustomer from "./components/DataCustomer/DataCustomer"; // <-- masih dipakai untuk halaman sederhana? Tidak, kita akan ganti dengan CustomerDetail
import ListDQC from "./components/ListDQC/ListDQC";
import CustomerDetail from "./components/CustomerDetail/CustomerDetail";
import { useDocuments } from "./hooks/useDocuments";
import { CUSTOMERS, STATUSES, STATUS_COLORS } from "./utils/constants";

function AppContent() {
  const { user } = useAuth();
  const { documents, addDocument, updateDocument, deleteDocument } =
    useDocuments();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [historyFilter, setHistoryFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(
    CUSTOMERS[0] || null,
  ); // default customer pertama
  const [globalSearchKeyword, setGlobalSearchKeyword] = useState("");

  const filteredDocs = useMemo(() => {
    let result = documents;
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter((doc) => doc.name.toLowerCase().includes(term));
    }
    if (filterCustomer)
      result = result.filter((doc) => doc.customer === filterCustomer);
    if (filterStatus)
      result = result.filter((doc) => doc.status === filterStatus);
    return result;
  }, [documents, searchTerm, filterCustomer, filterStatus]);

  const handleNavigateToHistory = (filterType) => {
    setHistoryFilter(filterType);
    setActiveMenu("history");
  };

  const handleBackFromHistory = () => {
    setHistoryFilter(null);
    setActiveMenu("dashboard");
  };

  const handleHistoryFilterChange = (newFilter) => {
    setHistoryFilter(newFilter);
  };

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setActiveMenu("customer-detail"); // dari Dashboard klik customer
  };
  const handleBackFromCustomerDetail = () => {
    setActiveMenu("dashboard");
    // Reset keyword agar tidak terbawa saat buka customer detail lain
    setGlobalSearchKeyword("");
  };
  const handleCustomerChange = (newCustomer) => {
    setSelectedCustomer(newCustomer);
  };

  const handleGlobalSearchNavigate = (customer, keyword) => {
    setSelectedCustomer(customer);
    setGlobalSearchKeyword(keyword || ""); // simpan keyword
    setActiveMenu("customer-detail");
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <Dashboard
            documents={documents}
            filteredDocs={filteredDocs}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCustomer={filterCustomer}
            setFilterCustomer={setFilterCustomer}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            updateDocument={updateDocument}
            deleteDocument={deleteDocument}
            CUSTOMERS={CUSTOMERS}
            STATUSES={STATUSES}
            STATUS_COLORS={STATUS_COLORS}
            onNavigateToHistory={handleNavigateToHistory}
            onCustomerClick={handleCustomerClick}
            onGlobalSearchNavigate={handleGlobalSearchNavigate}
          />
        );
      case "history":
        return (
          <HistoryPage
            documents={documents}
            filterType={historyFilter}
            onBack={handleBackFromHistory}
            onFilterChange={handleHistoryFilterChange}
            CUSTOMERS={CUSTOMERS}
            STATUSES={STATUSES}
            STATUS_COLORS={STATUS_COLORS}
          />
        );
      case "data-customer":
        return (
          <CustomerDetail
            customer={selectedCustomer}
            onBack={null}
            onCustomerChange={handleCustomerChange}
            hideBackButton={true}
            initialSearchKeyword={globalSearchKeyword}
          />
        );
      case "list-dqc":
        return (
          <ListDQC
            documents={documents}
            addDocument={addDocument}
            updateDocument={updateDocument}
            deleteDocument={deleteDocument}
            CUSTOMERS={CUSTOMERS}
            STATUSES={STATUSES}
            STATUS_COLORS={STATUS_COLORS}
            onNavigateToHistory={handleNavigateToHistory}
          />
        );
      case "customer-detail":
        return (
          <CustomerDetail
            customer={selectedCustomer}
            onBack={handleBackFromCustomerDetail}
            onCustomerChange={handleCustomerChange}
            hideBackButton={false}
            initialSearchKeyword={globalSearchKeyword} // <-- tambahkan ini
          />
        );
      default:
        return (
          <div className="p-6 text-slate-500 dark:text-slate-400">
            Halaman tidak ditemukan
          </div>
        );
    }
  };

  if (!user) return <Login />;

  return (
    <MainLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
      {renderContent()}
    </MainLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
