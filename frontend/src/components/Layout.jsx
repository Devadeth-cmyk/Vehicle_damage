import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import Chatbot from './Chatbot';
import { MessageSquareText } from 'lucide-react';

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenAssistant={() => setAssistantOpen(true)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Persistent Floating RAG Assistant Button */}
      <button
        onClick={() => setAssistantOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm px-4 py-3 rounded-full shadow-xl shadow-blue-600/30 flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 active:scale-95"
      >
        <MessageSquareText className="w-5 h-5" />
        <span className="hidden sm:inline">💬 Insurance Assistant</span>
        <span className="sm:hidden">💬 AI Chat</span>
      </button>

      {/* RAG Chatbot Modal Drawer */}
      <Chatbot isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
};

export default Layout;
