import React from 'react';
import { Menu, ShieldCheck, Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TopNavbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>CUSTOMER PORTAL</span>
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-sm font-bold text-slate-800">{user?.full_name || 'Customer Account'}</span>
          <span className="text-[11px] text-slate-500">{user?.email}</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm shadow-xs">
          <User className="w-5 h-5" />
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
