
import React from 'react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  whatsappStatus: 'connected' | 'disconnected' | 'connecting';
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, whatsappStatus }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Painel' },
    { id: 'inbox', icon: 'fa-comments', label: 'Mensagens' },
    { id: 'contacts', icon: 'fa-users', label: 'Contatos' },
    { id: 'scheduler', icon: 'fa-calendar-check', label: 'Agenda de Envios' },
    { id: 'order-scheduler', icon: 'fa-truck-fast', label: 'Agenda de Pedidos' },
    { id: 'reports', icon: 'fa-file-invoice-dollar', label: 'Relatórios / NF' },
    { id: 'settings', icon: 'fa-gear', label: 'Configurações' },
  ];

  const statusConfig = {
    connected: { color: 'bg-emerald-400', label: 'Conectado', bg: 'bg-emerald-900' },
    disconnected: { color: 'bg-red-400', label: 'Desconectado', bg: 'bg-slate-800' },
    connecting: { color: 'bg-amber-400', label: 'Conectando...', bg: 'bg-slate-800' },
  };

  const currentStatus = statusConfig[whatsappStatus];

  return (
    <aside className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
          <i className="fa-brands fa-whatsapp text-2xl"></i>
        </div>
        <span className="text-xl font-bold text-emerald-600 hidden md:block">ZapFlow</span>
      </div>

      <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewState)}
            className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors text-left ${
              currentView === item.id 
                ? 'bg-emerald-50 text-emerald-700' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-xl w-8 text-center`}></i>
            <span className="font-medium text-sm hidden md:block">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className={`p-4 ${currentStatus.bg} rounded-xl text-white hidden md:block transition-colors duration-500 cursor-pointer hover:opacity-90`} onClick={() => setView('inbox')}>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-1">Status WhatsApp</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${currentStatus.color} ${whatsappStatus !== 'disconnected' ? 'animate-pulse' : ''}`}></div>
            <p className="text-sm font-medium">{currentStatus.label}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
