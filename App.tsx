import React, { useState, useEffect } from 'react';
import { ViewState, Contact, InternalGroup, ScheduledMessage, Order, Material, Conversation, ChatMessage } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ContactManager from './components/ContactManager';
import Scheduler from './components/Scheduler';
import OrderScheduler from './components/OrderScheduler';
import Settings from './components/Settings';
import ChatInbox from './components/ChatInbox';
import Reports from './components/Reports';

const INITIAL_MATERIALS: Material[] = [
  { id: 'm1', name: 'ENVELOPE AWB CANGURU P/ NF DANFE 13 X 15 1000 UN', unit: 'PCT' },
  { id: 'm2', name: 'ENVELOPES SEG COEX BCO/PTO 30 X 20 1000 UN', unit: 'PCT' },
  { id: 'm22', name: 'ETIQUETA TERMICA 100 X 150 RESMA 10 MIL UNIDADES', unit: 'CX' },
  { id: 'm31', name: 'FITA ADESIVA TRANSPARENTE ACRILICA 45 X 250', unit: 'UN' },
];

const INITIAL_CITIES = [
  'Fernandópolis',
  'Jaci',
  'Mirassol',
  'São José do Rio Preto',
  'Valentim Gentil',
  'Votuporanga'
];

const INITIAL_GROUPS: InternalGroup[] = [
  { id: 'g1', name: 'VIP', description: 'Clientes recorrentes', color: 'bg-emerald-100 text-emerald-700', contactIds: [] },
  { id: 'g4', name: 'Informativo', description: 'Avisos gerais', color: 'bg-purple-100 text-purple-700', contactIds: [] },
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    contactId: '1',
    contactName: 'João Silva',
    contactPhone: '5511988887777',
    lastMessage: 'Qual o valor da promoção?',
    lastTimestamp: '10:45',
    unreadCount: 2,
    isUnread: true,
    tags: ['Novo Cliente'],
    messages: [
      { id: 'm1', sender: 'client', text: 'Olá, vi o anúncio no Instagram!', timestamp: '10:40' },
      { id: 'm2', sender: 'me', text: 'Olá João! Que bom que gostou. Em que posso ajudar?', timestamp: '10:42', status: 'read' },
      { id: 'm3', sender: 'client', text: 'Qual o valor da promoção de verão?', timestamp: '10:45' },
    ]
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<InternalGroup[]>(() => {
    const saved = localStorage.getItem('zapflow_groups');
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [cities, setCities] = useState<string[]>(INITIAL_CITIES);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [reminders, setReminders] = useState<string[]>(JSON.parse(localStorage.getItem('zapflow_reminders') || '[]'));
  const [lastOrderNumber, setLastOrderNumber] = useState<number>(() => {
    const saved = localStorage.getItem('zapflow_last_order_num');
    return saved ? parseInt(saved) : 149;
  });
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  
  const [clientId, setClientId] = useState<string>(
    localStorage.getItem('google_client_id') || '846383409558-91okq80vm5df0lskmb63ttq730j3j4p8.apps.googleusercontent.com'
  );
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('google_client_id', clientId);
  }, [clientId]);

  useEffect(() => {
    localStorage.setItem('zapflow_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('zapflow_groups', JSON.stringify(groups));
  }, [groups]);

  const addChatMessage = (contactId: string, text: string, sender: 'me' | 'client' = 'me') => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setConversations(prev => {
      const existing = prev.find(c => c.contactId === contactId);
      if (existing) {
        return prev.map(c => c.contactId === contactId ? {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessage: text,
          lastTimestamp: newMessage.timestamp,
          isUnread: sender === 'client',
          unreadCount: sender === 'client' ? c.unreadCount + 1 : 0
        } : c);
      } else {
        const contact = contacts.find(c => c.id === contactId);
        return [...prev, {
          contactId,
          contactName: contact?.name || 'Contato Novo',
          contactPhone: contact?.phone || '',
          lastMessage: text,
          lastTimestamp: newMessage.timestamp,
          unreadCount: sender === 'client' ? 1 : 0,
          messages: [newMessage]
        }];
      }
    });
  };

  const addOrder = (order: Omit<Order, 'id' | 'orderNumber'>) => {
    const nextNum = lastOrderNumber + 1;
    const newOrder: Order = {
      ...order,
      id: `ORD-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      orderNumber: nextNum,
      nfIssued: false
    };
    setOrders(prev => [newOrder, ...prev]);
    setLastOrderNumber(nextNum);
    localStorage.setItem('zapflow_last_order_num', nextNum.toString());
  };

  const updateOrderStatus = (orderId: string, status: Order['status'], receiptData?: Order['receiptData']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedOrder = { ...o, status, receiptData: receiptData || o.receiptData };
        if (status === 'delivered' && receiptData) {
          const itemsList = updatedOrder.items?.map(i => `- ${i.quantity} ${i.unit} ${i.materialName}`).join('\n') || 'Nenhum item listado';
          const autoMsg = `✅ *PEDIDO ENTREGUE (#${updatedOrder.orderNumber})*\n\nOlá *${updatedOrder.contactName}*, confirmamos que sua entrega foi realizada com sucesso!\n\n📍 *Cidade:* ${updatedOrder.city}\n📦 *Itens Entregues:*\n${itemsList}\n\n👤 *Recebido por:* ${receiptData.fullName}\n📅 *Data:* ${new Date(receiptData.receivedAt).toLocaleDateString('pt-BR')}\n\nObrigado pela parceria! 🚀`;
          addChatMessage(updatedOrder.contactId, autoMsg);
        }
        return updatedOrder;
      }
      return o;
    }));
  };

  const toggleOrderNf = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, nfIssued: !o.nfIssued } : o));
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar currentView={view} setView={setView} whatsappStatus={whatsappStatus} />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {view === 'dashboard' && 'Dashboard'}
              {view === 'contacts' && 'Gestão de Contatos'}
              {view === 'scheduler' && 'Agenda de Envios'}
              {view === 'order-scheduler' && 'Gestão de Pedidos'}
              {view === 'settings' && 'Configurações'}
              {view === 'inbox' && 'Inbox WhatsApp'}
              {view === 'reports' && 'Relatórios e Notas Fiscais'}
            </h1>
            <p className="text-slate-500 text-sm">Painel ZapFlow • Automação Inteligente</p>
          </div>
          
          {whatsappStatus === 'connected' && (
            <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-700">WhatsApp Conectado</span>
            </div>
          )}
        </header>

        {view === 'dashboard' && <Dashboard contacts={contacts} messages={messages} groups={groups} orders={orders} reminders={reminders} setReminders={setReminders} />}
        {view === 'contacts' && <ContactManager contacts={contacts} setContacts={setContacts} groups={groups} googleToken={googleToken} onGoogleAuth={setGoogleToken} onGoogleLogout={() => setGoogleToken(null)} clientId={clientId} />}
        {view === 'scheduler' && <Scheduler groups={groups} setGroups={setGroups} contacts={contacts} addMessage={(msg) => setMessages(prev => [{...msg, id: Math.random().toString(36).substr(2,9), status: 'pending'}, ...prev])} messages={messages} />}
        {view === 'order-scheduler' && (
          <OrderScheduler 
            contacts={contacts} 
            orders={orders} 
            materials={materials} 
            cities={cities}
            onAddOrder={addOrder}
            onUpdateOrderStatus={updateOrderStatus}
            initialContactId={selectedContactId}
            googleToken={googleToken}
            onNavigateToChat={(id) => { setActiveChatId(id); setView('inbox'); }}
          />
        )}
        {view === 'reports' && (
          <Reports 
            orders={orders} 
            cities={cities} 
            onToggleNf={toggleOrderNf} 
          />
        )}
        {view === 'settings' && <Settings googleToken={googleToken} onGoogleAuth={setGoogleToken} onGoogleLogout={() => setGoogleToken(null)} clientId={clientId} setClientId={setClientId} materials={materials} setMaterials={setMaterials} cities={cities} setCities={setCities} />}
        {view === 'inbox' && (
          <ChatInbox 
            conversations={conversations}
            setConversations={setConversations}
            onSendMessage={addChatMessage}
            onAddContact={(c) => setContacts(p => [...p, {...c, id: Math.random().toString(36).substr(2,9), status: 'active'}])} 
            onNavigateToOrder={(id) => { setSelectedContactId(id); setView('order-scheduler'); }} 
            whatsappStatus={whatsappStatus}
            setWhatsappStatus={setWhatsappStatus}
            initialChatId={activeChatId}
            setActiveChatId={setActiveChatId}
            orders={orders}
          />
        )}
      </main>
    </div>
  );
};

export default App;