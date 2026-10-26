// src/components/Login/Login.jsx
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

// Import gambar (letakkan di src/assets/images/)
import loginImage from "../../assets/DSC00210-1536x864.jpg";

export default function Login() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(username, password);
      const isSuccess = typeof result === "boolean" ? result : result?.success;
      if (!isSuccess) {
        setError(result?.error || "Username atau password salah!");
      }
    } catch (err) {
      setError(err?.message || "Terjadi kesalahan saat login!");
    } finally {
      setIsLoading(false);
    }
  };

  // Tentukan warna background berdasarkan theme
  const bgColor = theme === "dark" ? "bg-slate-900" : "bg-slate-100";

  return (
    <div
      className={`min-h-screen w-full flex ${bgColor} transition-colors duration-300`}
    >
      {/* ─── LEFT PANEL: GAMBAR ────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background image dengan overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{
            backgroundImage: `url(${loginImage})`,
          }}
        />
        {/* Overlay gelap agar teks terbaca */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />

        {/* Konten di atas gambar */}
        <div className="relative z-10 flex flex-col justify-center items-start p-16 text-white h-full">
          <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">📄</span>
              <h1 className="text-3xl font-bold tracking-tight">DQC System</h1>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Welcome to
              <br />
              <span className="text-blue-400">PT. SANOH INDONESIA</span>
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-md">
              Sistem Dokumen Quality Control untuk memudahkan pengelolaan file
              dan dokumentasi part.
            </p>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span className="w-px h-4 bg-white/20"></span>
              <span>v2.0</span>
              <span className="w-px h-4 bg-white/20"></span>
              <span>Quality Control</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL: LOGIN FORM ────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Logo untuk mobile (tampil di atas form) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">📄</span>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                DQC System
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              PT. SANOH INDONESIA
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-10 border border-slate-200/80 dark:border-slate-700">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                Selamat Datang
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                Silakan login untuk mengakses sistem
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  {error}
                </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full pl-6 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-6 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Memproses...
                  </>
                ) : (
                  <>
                    Login
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
            © 2026 DQC System - PT. SANOH INDONESIA
          </p>
        </div>
      </div>
    </div>
  );
}
