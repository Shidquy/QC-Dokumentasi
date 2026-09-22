import React, { useEffect } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type = 'success', onClose }) => {
  const bgColor = type === 'success' ? 'bg-emerald-600' : 'bg-rose-600';
  const icon = type === 'success' ? <FaCheck /> : <FaTimes />;

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl text-white shadow-xl ${bgColor} max-w-sm animate-slide-in-right`}>
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 text-white/80 hover:text-white transition">
        <FaTimes />
      </button>
    </div>
  );
};

export default Toast;