
import React, { useState } from 'react';
import { Contact, ScheduledMessage, InternalGroup, Order } from '../types';

interface DashboardProps {
  contacts: Contact[];
  messages: ScheduledMessage[];
  groups: InternalGroup[];
  orders: Order[];
  reminders: string[];
  setReminders: React.Dispatch<React.SetStateAction<string[]>>;
}

const Dashboard: React.FC<DashboardProps> = ({ contacts, messages, groups, orders, reminders, setReminders }) => {
  const [newReminder, setNewReminder] = useState('');

  const stats = [
    { label: 'Contatos Totais', value: contacts.length, icon: 'fa-users', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Grupos Internos', value: groups.length, icon: 'fa-layer-group', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Entregas Pendentes', value: orders.filter(o => o.status !== 'delivered').length, icon: 'fa-truck-ramp-box', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Mensagens Pendentes', value: messages.filter(m => m.status === 'pending').length, icon: 'fa-clock', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const pendingByCity = orders.filter(o => o.status !== 'delivered').reduce((acc, order) => {
    if (!acc[order.city]) acc[order.city] = [];
    acc[order.city].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.trim()) return;
    setReminders(prev => [...prev, newReminder.trim()]);
    setNewReminder('');
  };

  const removeReminder = (index: number) => {
    setReminders(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <i className={`fa-solid ${stat.icon} text-xl`}></i>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Entregas Pendentes por Cidade */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <i className="fa-solid fa-map-location-dot text-amber-500"></i>
                 Entregas Pendentes por Cidade
               </h3>
               <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-1 rounded-md tracking-widest">Tempo Real</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(pendingByCity).length === 0 ? (
                <div className="col-span-2 py-12 text-center text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Não há pedidos pendentes no momento.
                </div>
              ) : (
                Object.keys(pendingByCity).map(city => (
                  <div key={city} className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="bg-slate-200/50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                      <span className="font-bold text-slate-700 text-xs uppercase tracking-tight">{city}</span>
                      <span className="bg-white text-slate-500 text-[10px] font-black px-1.5 py-0.5 rounded border border-slate-200">{pendingByCity[city].length}</span>
                    </div>
                    <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                      {pendingByCity[city].map(order => (
                        <div key={order.id} className="bg-white p-2 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className="text-[10px] font-black text-slate-400">#{order.orderNumber}</span>
                            <span className="font-medium text-slate-800 truncate">{order.contactName}</span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{new Date(order.deliveryDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quadro de Lembretes */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-thumbtack text-emerald-500"></i>
                Quadro de Lembretes
              </h3>
              <p className="text-[10px] text-slate-400 italic">Visível para todos os operadores</p>
            </div>
            
            <form onSubmit={handleAddReminder} className="mb-6 flex gap-2">
              <input 
                type="text" 
                placeholder="Adicionar novo lembrete..." 
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={newReminder}
                onChange={e => setNewReminder(e.target.value)}
              />
              <button type="submit" className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all">
                <i className="fa-solid fa-plus"></i>
              </button>
            </form>

            <div className="space-y-2">
              {reminders.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <i className="fa-solid fa-note-sticky text-4xl mb-3 opacity-10"></i>
                  <p className="text-xs">Nenhum lembrete anotado.</p>
                </div>
              ) : (
                reminders.map((reminder, idx) => (
                  <div key={idx} className="group flex items-start gap-3 p-3 bg-emerald-50/30 rounded-xl border border-emerald-100/50 hover:bg-emerald-50 transition-colors">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                    <p className="flex-1 text-sm text-slate-700 leading-relaxed">{reminder}</p>
                    <button onClick={() => removeReminder(idx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Atividade Recente</h3>
            <i className="fa-solid fa-bolt text-indigo-500"></i>
          </div>
          <div className="flex-1 space-y-6 overflow-y-auto pr-2">
            {messages.length === 0 ? (
              <p className="text-slate-400 text-sm italic py-8 text-center">Sem atividades registradas.</p>
            ) : (
              messages.slice(0, 10).map(msg => (
                <div key={msg.id} className="relative pl-6 pb-6 border-l-2 border-slate-100 last:border-l-0">
                  <div className={`absolute -left-2 top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm ${msg.status === 'sent' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(msg.scheduledAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{msg.content}</p>
                    <p className="text-xs text-slate-500 italic mt-1">{msg.status === 'sent' ? 'Enviado com sucesso' : 'Aguardando envio'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-4 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">Ver relatório completo</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
