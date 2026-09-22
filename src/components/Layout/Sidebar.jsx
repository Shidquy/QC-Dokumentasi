// src/components/Layout/Sidebar.jsx
import { useAuth } from "../../contexts/AuthContext";
import { MENU_ITEMS } from "../../utils/constants";

const IconChevronLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const IconChevronRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
const IconExit = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

export default function Sidebar({
  isOpen,
  setIsOpen,
  activeMenu,
  setActiveMenu,
}) {
  const { logout } = useAuth();

  const handleMenuClick = (id) => {
    if (id === "exit") {
      if (window.confirm("Apakah Anda yakin ingin keluar?")) {
        logout();
      }
      return;
    }
    setActiveMenu(id);
  };

  // Filter menu: hanya Dashboard, List Part Monthly, Data Customer
  const filteredMenuItems = MENU_ITEMS.filter((item) =>
    ["dashboard", "list-dqc", "data-customer"].includes(item.id),
  );

  return (
    <aside
      className={`bg-white dark:bg-slate-800 border-r border-slate-200/80 dark:border-slate-700 flex flex-col h-full transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <div
        className={`p-4 border-b border-slate-200/80 dark:border-slate-700 flex items-center flex-shrink-0 ${isOpen ? "justify-between" : "justify-center"}`}
      >
        {isOpen && (
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-tight whitespace-nowrap">
            DQC System
          </h1>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex-shrink-0"
          title={isOpen ? "Sembunyikan sidebar" : "Tampilkan sidebar"}
        >
          {isOpen ? <IconChevronLeft /> : <IconChevronRight />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => (
          <div key={item.id} className="relative group">
            <button
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeMenu === item.id
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white hover:scale-[1.02]"
              } ${!isOpen && "justify-center"}`}
              title={!isOpen ? item.label : ""}
            >
              <span
                className={`flex-shrink-0 text-lg transition-transform ${activeMenu === item.id ? "scale-110" : "group-hover:scale-110"}`}
              >
                {item.icon}
              </span>
              {isOpen && <span className="truncate">{item.label}</span>}
            </button>
            {activeMenu === item.id && (
              <span
                className={`absolute inset-y-0 left-0 w-1 bg-blue-600 dark:bg-blue-400 rounded-r-full transition-all ${isOpen ? "block" : "hidden"}`}
              />
            )}
            {!isOpen && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </div>
        ))}

        <div className="relative group border-t border-slate-200/80 dark:border-slate-700 pt-2 mt-2">
          <button
            onClick={() => handleMenuClick("exit")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-700 dark:hover:text-rose-300 ${
              !isOpen && "justify-center"
            }`}
            title={!isOpen ? "Keluar" : ""}
          >
            <span className="flex-shrink-0 text-lg">
              <IconExit />
            </span>
            {isOpen && <span className="truncate">Keluar</span>}
          </button>
          {!isOpen && (
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Keluar
            </div>
          )}
        </div>
      </nav>

      {isOpen && (
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 text-center flex-shrink-0">
          © 2026 DQC System
        </div>
      )}
    </aside>
  );
}
