
import React, { useState } from 'react';
import { Order } from '../types';

interface ReportsProps {
  orders: Order[];
  cities: string[];
  onToggleNf: (orderId: string) => void;
}

const Reports: React.FC<ReportsProps> = ({ orders, onToggleNf }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [onlyPendingNf, setOnlyPendingNf] = useState(false);

  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  
  const filteredOrders = deliveredOrders.filter(o => {
    const orderDate = o.receiptData?.receivedAt || o.deliveryDate;
    
    const dateMatch = (!startDate || orderDate >= startDate) && 
                      (!endDate || orderDate <= endDate);
                      
    const nfMatch = onlyPendingNf ? o.issueInvoice && !o.nfIssued : true;
    
    return dateMatch && nfMatch;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Conferência de Notas Fiscais</h3>
          <p className="text-xs text-slate-400">Listagem de pedidos entregues para faturamento</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase">De:</span>
            <input 
              type="date" 
              className="text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold text-slate-600 focus:ring-2 focus:ring-emerald-500/20"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase">Até:</span>
            <input 
              type="date" 
              className="text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold text-slate-600 focus:ring-2 focus:ring-emerald-500/20"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
            <input 
              type="checkbox" 
              checked={onlyPendingNf} 
              onChange={() => setOnlyPendingNf(!onlyPendingNf)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            Pendentes NF
          </label>

          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-file-export"></i> Exportar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-400 text-[9px] uppercase font-black tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">NR / ID / Data</th>
              <th className="px-6 py-4">Cliente / Cidade</th>
              <th className="px-6 py-4">Materiais Detalhados</th>
              <th className="px-6 py-4">Requer NF?</th>
              <th className="px-6 py-4">Recebedor</th>
              <th className="px-6 py-4 text-center">Status Emissão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic text-sm">Nenhum pedido encontrado para o período selecionado.</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className={`hover:bg-slate-50/50 transition-colors ${order.nfIssued ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                  <td className="px-6 py-4">
                    <p className="font-mono text-[10px] font-black text-slate-800">#{order.orderNumber}</p>
                    <p className="font-mono text-[8px] font-bold text-slate-300">{order.id}</p>
                    <p className="text-xs font-bold text-slate-700 mt-1">{new Date(order.receiptData?.receivedAt || order.deliveryDate).toLocaleDateString('pt-BR')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-sm">{order.contactName}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-medium">{order.city}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs space-y-1">
                      {order.items?.map(item => (
                        <div key={item.id} className="text-[10px] text-slate-600 flex justify-between border-b border-slate-50 pb-1 last:border-0">
                          <span className="truncate mr-2">{item.materialName}</span>
                          <span className="font-bold whitespace-nowrap">{item.quantity} {item.unit}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {order.issueInvoice ? (
                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">SIM</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">NÃO</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium text-slate-700">{order.receiptData?.fullName}</p>
                    <p className="text-[9px] text-slate-400">Doc: {order.receiptData?.document}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onToggleNf(order.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        order.nfIssued 
                        ? 'bg-emerald-100 text-emerald-600 border border-emerald-200 shadow-inner' 
                        : 'bg-white border border-slate-200 text-slate-300 hover:border-emerald-300 hover:text-emerald-500 shadow-sm'
                      }`}
                      title={order.nfIssued ? "Marcar como Pendente" : "Marcar como NF Emitida"}
                    >
                      <i className={`fa-solid ${order.nfIssued ? 'fa-check-double' : 'fa-check'}`}></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Emitidas: {deliveredOrders.filter(o => o.nfIssued).length}
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div> Aguardando NF: {deliveredOrders.filter(o => o.issueInvoice && !o.nfIssued).length}
         </div>
      </div>
    </div>
  );
};

export default Reports;
