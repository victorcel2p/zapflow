
import React, { useState, useEffect, useRef } from 'react';
import { Contact, Order, OrderItem, Material } from '../types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oehrjplxsgewixvpstry.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9laHJqcGx4c2dld2l4dnBzdHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5ODMwMTYsImV4cCI6MjA4NTU1OTAxNn0._WULolX4-eG6XAw0kbi1TVlvjntPZOjU9hYNWiOUVP0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface OrderSchedulerProps {
  contacts: Contact[];
  orders: Order[];
  materials: Material[];
  cities: string[];
  onAddOrder: (order: Omit<Order, 'id' | 'orderNumber'>) => void;
  onUpdateOrder?: (orderId: string, updates: Partial<Order>) => void;
  onUpdateOrderStatus?: (orderId: string, status: Order['status'], receiptData?: Order['receiptData'], driveUrl?: string) => void;
  initialContactId?: string | null;
  googleToken: string | null;
  onNavigateToChat?: (contactId: string) => void;
}

const OrderScheduler: React.FC<OrderSchedulerProps> = ({ contacts, orders, materials, cities, onAddOrder, onUpdateOrder, onUpdateOrderStatus, initialContactId, googleToken, onNavigateToChat }) => {
  const [formData, setFormData] = useState({
    contactId: initialContactId || '',
    city: cities[0] || '',
    description: '',
    deliveryDate: '',
    issueInvoice: false,
    status: 'pending' as const,
    items: [] as OrderItem[]
  });

  const [newItem, setNewItem] = useState<Partial<OrderItem>>({
    materialName: materials[0]?.name || '',
    unit: materials[0]?.unit || 'un',
    quantity: 1
  });

  const [receiptModal, setReceiptModal] = useState<{ isOpen: boolean; orderId: string | null }>({ isOpen: false, orderId: null });
  const [viewDetailsModal, setViewDetailsModal] = useState<{ isOpen: boolean; order: Order | null }>({ isOpen: false, order: null });
  const [showHistory, setShowHistory] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [receiptForm, setReceiptForm] = useState({ fullName: '', document: '', receivedAt: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    if (initialContactId) setFormData(prev => ({ ...prev, contactId: initialContactId }));
  }, [initialContactId]);

  const handleMaterialSelect = (name: string) => {
    const mat = materials.find(m => m.name === name);
    setNewItem({
      ...newItem,
      materialName: name,
      unit: mat?.unit || 'un'
    });
  };

  const addItemToOrder = () => {
    if (!newItem.materialName || !newItem.quantity || newItem.quantity <= 0) return;
    const item: OrderItem = {
      id: Math.random().toString(36).substr(2, 9),
      materialName: newItem.materialName!,
      unit: newItem.unit!,
      quantity: newItem.quantity!
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, item] }));
    setNewItem({ materialName: materials[0]?.name || '', unit: materials[0]?.unit || 'un', quantity: 1 });
  };

  const removeItemFromOrder = (id: string) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contact = contacts.find(c => c.id === formData.contactId);
    if (!contact) return;

    onAddOrder({
      ...formData,
      contactName: contact.name
    });
    setFormData({ contactId: '', city: cities[0] || '', description: '', deliveryDate: '', issueInvoice: false, status: 'pending', items: [] });
    alert('Pedido agendado com sucesso!');
  };

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleConfirmReceipt = async () => {
    const canvas = canvasRef.current;
    const order = orders.find(o => o.id === receiptModal.orderId);
    if (!canvas || !receiptModal.orderId || !order) return;
    setIsSyncing(true);
    const signature = canvas.toDataURL();
    
    const receiptData = { fullName: receiptForm.fullName, document: receiptForm.document, receivedAt: receiptForm.receivedAt, signature };
    if (onUpdateOrderStatus) onUpdateOrderStatus(receiptModal.orderId, 'delivered', receiptData);
    
    setIsSyncing(false);
    setReceiptModal({ isOpen: false, orderId: null });
    alert('Entrega confirmada! Uma notificação será enviada ao cliente.');
  };

  const pendingOrders = orders.filter(o => o.status !== 'delivered');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário Novo Pedido */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-4">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-cart-plus text-emerald-600"></i>
              Novo Pedido
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cliente</label>
                <select required className="w-full p-3 bg-white border border-slate-300 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20" value={formData.contactId} onChange={e => setFormData({...formData, contactId: e.target.value})}>
                  <option value="">Selecione o Cliente...</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cidade de Entrega</label>
                <select required className="w-full p-3 bg-white border border-slate-300 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                  {cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>

              {/* Adicionar Itens */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Adicionar Material</p>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 mb-1">Descrição</label>
                  <select 
                    className="w-full p-3 bg-white border border-slate-300 text-slate-900 text-sm rounded-xl outline-none mb-2" 
                    value={newItem.materialName} 
                    onChange={e => handleMaterialSelect(e.target.value)}
                  >
                    {materials.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Quantidade</label>
                      <input 
                        type="number" 
                        placeholder="Qtd" 
                        className="w-full p-3 bg-white border border-slate-300 text-slate-900 text-sm rounded-xl outline-none" 
                        value={newItem.quantity} 
                        onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Unidade</label>
                      <input 
                        type="text" 
                        readOnly 
                        className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-500 text-sm rounded-xl outline-none font-bold" 
                        value={newItem.unit || ''} 
                      />
                    </div>
                  </div>
                </div>
                <button type="button" onClick={addItemToOrder} className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all">
                  + Adicionar à Lista
                </button>
              </div>

              {/* Lista de Itens Adicionados */}
              {formData.items.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Itens do Pedido ({formData.items.length})</p>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {formData.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl text-xs shadow-sm">
                        <div className="flex-1 pr-2">
                          <p className="font-bold text-slate-900">{item.materialName}</p>
                          <p className="text-emerald-600 font-bold">{item.quantity} {item.unit}</p>
                        </div>
                        <button type="button" onClick={() => removeItemFromOrder(item.id)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Observações / Descrição</label>
                <textarea className="w-full p-3 bg-white border border-slate-300 text-slate-900 rounded-xl outline-none min-h-[80px] text-sm focus:ring-2 focus:ring-emerald-500/20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Informações adicionais da entrega..." />
              </div>

              <div className="flex items-center gap-2 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <input type="checkbox" id="orderInvoice" checked={formData.issueInvoice} onChange={e => setFormData({...formData, issueInvoice: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded" />
                <label htmlFor="orderInvoice" className="text-xs font-bold text-emerald-800 cursor-pointer">Emitir Nota Fiscal (DANFE)</label>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Previsão de Entrega</label>
                <input type="date" required className="w-full p-3 bg-white border border-slate-300 text-slate-900 rounded-xl focus:ring-2 focus:ring-emerald-500/20" value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} />
              </div>

              <button type="submit" disabled={formData.items.length === 0} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 disabled:opacity-50 active:scale-95">
                Confirmar Agendamento
              </button>
            </form>
          </div>
        </div>

        {/* Fila de Pedidos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Fila de Entregas</h3>
                  <p className="text-xs text-slate-400">Pedidos aguardando processamento</p>
                </div>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {pendingOrders.length} Pendentes
                </span>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 text-slate-400 text-[9px] uppercase font-bold tracking-widest">
                   <tr>
                     <th className="px-6 py-4">NR / Cliente</th>
                     <th className="px-6 py-4">Itens</th>
                     <th className="px-6 py-4">Data Prevista</th>
                     <th className="px-6 py-4 text-right">Ações</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {pendingOrders.length === 0 ? (
                     <tr>
                       <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">Nenhum pedido na fila.</td>
                     </tr>
                   ) : (
                     pendingOrders.map(order => (
                       <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                         <td className="px-6 py-4">
                           <div className="flex flex-col">
                             <div className="flex items-center gap-2">
                               <span className="font-mono text-[10px] font-black text-slate-400">#{order.orderNumber}</span>
                               <p className="font-bold text-slate-800">{order.contactName}</p>
                             </div>
                             <p className="text-[10px] text-slate-500 flex items-center gap-1">
                               <i className="fa-solid fa-location-dot"></i> {order.city}
                             </p>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex flex-wrap gap-1">
                             {order.items?.map(i => (
                               <span key={i.id} className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded-md font-medium text-slate-600 border border-slate-200">
                                 {i.quantity}{i.unit} {i.materialName}
                               </span>
                             ))}
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <p className="text-xs font-bold text-slate-600">{new Date(order.deliveryDate).toLocaleDateString('pt-BR')}</p>
                           {order.issueInvoice && <span className="text-[8px] bg-blue-100 text-blue-600 px-1 rounded font-bold uppercase tracking-tighter">Emitir NF</span>}
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button onClick={() => setReceiptModal({ isOpen: true, orderId: order.id })} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10">
                              Finalizar
                            </button>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
          </div>

          {/* Histórico Simplificado */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <button onClick={() => setShowHistory(!showHistory)} className="w-full p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-slate-800">Pedidos Entregues</h3>
                  <p className="text-xs text-slate-400">Registros finalizados com assinatura</p>
                </div>
              </div>
              <i className={`fa-solid fa-chevron-down transition-transform ${showHistory ? 'rotate-180' : ''}`}></i>
            </button>
            {showHistory && (
              <div className="border-t animate-in slide-in-from-top-2 duration-200">
                {deliveredOrders.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 italic text-sm">Nenhuma entrega registrada ainda.</div>
                ) : (
                  deliveredOrders.map(order => (
                    <div key={order.id} className="p-4 border-b last:border-0 flex justify-between items-center hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-black text-slate-300">#{order.orderNumber}</span>
                        <div>
                          <p className="font-bold text-slate-800">{order.contactName}</p>
                          <p className="text-[10px] text-slate-400">Cidade: {order.city} | Recebido por: {order.receiptData?.fullName}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => onNavigateToChat && onNavigateToChat(order.contactId)} className="w-10 h-10 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors" title="Enviar comprovante via WhatsApp">
                          <i className="fa-brands fa-whatsapp"></i>
                        </button>
                        <button onClick={() => setViewDetailsModal({ isOpen: true, order })} className="w-10 h-10 flex items-center justify-center text-blue-600 hover:bg-blue-100 rounded-xl transition-colors">
                          <i className="fa-solid fa-magnifying-glass"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes Completo */}
      {viewDetailsModal.isOpen && viewDetailsModal.order && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
           <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
             <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Comprovante de Recebimento</h3>
                  <p className="text-xs text-slate-400">Pedido #{viewDetailsModal.order.orderNumber} | ID: {viewDetailsModal.order.id}</p>
                </div>
                <button onClick={() => setViewDetailsModal({ isOpen: false, order: null })} className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20">
                  <i className="fa-solid fa-xmark"></i>
                </button>
             </div>
             <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-bold text-slate-400 uppercase tracking-widest mb-1">Destinatário</p>
                    <p className="font-bold text-slate-800 text-lg">{viewDetailsModal.order.contactName}</p>
                    <p className="text-sm text-slate-600 italic">Cidade: {viewDetailsModal.order.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-400 uppercase tracking-widest mb-1">Data da Entrega</p>
                    <p className="font-bold text-slate-800 text-lg">{new Date(viewDetailsModal.order.receiptData?.receivedAt || '').toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-inner">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-200/50 text-slate-500 font-bold uppercase tracking-widest">
                      <tr>
                        <th className="px-4 py-3">Material Entregue</th>
                        <th className="px-4 py-3 text-right">Qtd/Un</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewDetailsModal.order.items?.map(item => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 font-medium text-slate-700">{item.materialName}</td>
                          <td className="px-4 py-3 text-right font-black text-slate-900">{item.quantity} {item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identificação do Recebedor</p>
                      <p className="text-sm font-bold text-slate-800">{viewDetailsModal.order.receiptData?.fullName}</p>
                      <p className="text-xs text-slate-500">Documento: {viewDetailsModal.order.receiptData?.document}</p>
                   </div>
                   <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-center bg-white shadow-sm h-32 relative">
                      <p className="absolute top-2 left-3 text-[8px] font-bold text-slate-300 uppercase">Assinatura Digital</p>
                      {viewDetailsModal.order.receiptData?.signature ? (
                        <img src={viewDetailsModal.order.receiptData.signature} className="max-h-24 object-contain" alt="Assinatura" />
                      ) : <span className="text-slate-200 italic">Sem assinatura</span>}
                   </div>
                </div>
                
                <button onClick={() => window.print()} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all">
                   <i className="fa-solid fa-print"></i> Gerar PDF / Imprimir
                </button>
             </div>
           </div>
        </div>
      )}

      {/* Modal de Assinatura */}
      {receiptModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-600 text-white">
              <h3 className="text-xl font-bold">Protocolo de Entrega</h3>
              <button onClick={() => setReceiptModal({ isOpen: false, orderId: null })} className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Quem recebeu?</label>
                  <input type="text" placeholder="Nome do recebedor" className="w-full p-4 bg-white border border-slate-300 text-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20" value={receiptForm.fullName} onChange={e => setReceiptForm({...receiptForm, fullName: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Documento (ID)</label>
                  <input type="text" placeholder="CPF ou RG" className="w-full p-4 bg-white border border-slate-300 text-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20" value={receiptForm.document} onChange={e => setReceiptForm({...receiptForm, document: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest text-center">Assinatura no Painel</label>
                <div className="border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 overflow-hidden relative shadow-inner h-44">
                  <canvas ref={canvasRef} width={500} height={180} className="w-full touch-none cursor-crosshair" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                    <i className="fa-solid fa-file-pen text-9xl"></i>
                  </div>
                </div>
              </div>
              <button onClick={handleConfirmReceipt} disabled={isSyncing || !receiptForm.fullName} className={`w-full py-5 rounded-2xl font-bold text-white transition-all ${isSyncing ? 'bg-slate-400' : 'bg-emerald-600 shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95'}`}>
                {isSyncing ? 'Arquivando...' : 'Finalizar Entrega'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderScheduler;
