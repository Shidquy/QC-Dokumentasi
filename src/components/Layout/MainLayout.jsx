// src/components/Layout/MainLayout.jsx
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function MainLayout({ children, activeMenu, setActiveMenu }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar_state');
    if (saved) {
      setIsSidebarOpen(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar_state', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <div className="sidebar-container">
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />
      </div>

      <main className="main-content w-full flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200/80 dark:border-slate-700 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
               Dokumen Quality Control
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
              aria-label="Toggle theme"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                  {userInitial}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">
                  {user?.name || 'User'}
                </span>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                  {user?.role === 'admin' ? 'Admin' : 'Guest'}
                </span>
                <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-700 py-1 z-10">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role === 'admin' ? 'Administrator' : 'Guest'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-900">
          {children}
        </div>
      </main>
    </div>
  );
}