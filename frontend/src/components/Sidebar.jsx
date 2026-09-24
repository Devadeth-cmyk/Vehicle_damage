import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Car,
  PlusCircle,
  FileCheck,
  FolderKanban,
  MessageSquareText,
  User,
  LogOut,
  X,
  ShieldAlert,
  Bot
} from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen, onOpenAssistant }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Vehicles', path: '/vehicles', icon: Car },
    { label: 'New Claim', path: '/claims/new', icon: PlusCircle },
    { label: 'My Claims', path: '/claims', icon: FileCheck },
    { label: 'Documents', path: '/documents', icon: FolderKanban },
    { label: 'Insurance Assistant', path: '/assistant', icon: MessageSquareText },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const SidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-64 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight tracking-wide">ClaimShield AI</h1>
            <p className="text-[11px] text-slate-400 font-medium">Customer Portal</p>
          </div>
        </div>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path) && item.path !== '/claims');

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive: navActive }) =>
                `flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  navActive || isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* RAG Assistant Quick Trigger in Sidebar */}
      <div className="p-3 mx-3 mb-3 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-xl">
        <div className="flex items-center space-x-2 text-blue-300 font-semibold text-xs mb-1">
          <Bot className="w-4 h-4" />
          <span>Need Assistance?</span>
        </div>
        <p className="text-[11px] text-slate-400 mb-2">Ask AI about policy coverage & claims</p>
        <button
          onClick={() => {
            if (setMobileOpen) setMobileOpen(false);
            if (onOpenAssistant) onOpenAssistant();
          }}
          className="w-full text-xs font-semibold py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center justify-center space-x-1"
        >
          <span>Open Chatbot</span>
        </button>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3 truncate">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-bold text-sm">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Customer'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-shrink-0 h-screen sticky top-0">
        {SidebarContent}
      </aside>

      {/* Mobile Responsive Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-50">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
