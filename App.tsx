
import React, { useState, useEffect } from 'react';
import { ViewState, Contact, InternalGroup, ScheduledMessage, Order, Material, Conversation, ChatMessage, WhatsAppConfig } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ContactManager from './components/ContactManager';
import Scheduler from './components/Scheduler';
import OrderScheduler from './components/OrderScheduler';
import Settings from './components/Settings';
import ChatInbox from './components/ChatInbox';
import Reports from './components/Reports';
import { sendWhatsAppMessage } from './services/whatsappService';

const INITIAL_MATERIALS: Material[] = [
  { id: 'm1', name: 'ENVELOPE AWB CANGURU P/ NF DANFE 13 X 15 1000 UN', unit: 'PCT' },
  { id: 'm2', name: 'ENVELOPES SEG COEX BCO/PTO 30 X 20 1000 UN', unit: 'PCT' },
  { id: 'm22', name: 'ETIQUETA TERMICA 100 X 150 RESMA 10 MIL UNIDADES', unit: 'CX' },
  { id: 'm31', name: 'FITA ADESIVA TRANSPARENTE ACRILICA 45 X 250', unit: 'UN' },
];

const INITIAL_CITIES = ['Fernandópolis', 'Jaci', 'Mirassol', 'São José do Rio Preto', 'Valentim Gentil', 'Votuporanga'];

// Configuração atualizada com os dados fornecidos pelo usuário
const INITIAL_CONFIG: WhatsAppConfig = {
  method: 'official',
  phoneNumberId: '1054620444391410',
  wabaId: '1204490601856199',
  accessToken: 'EAAhlS9I3C0kBQhu5evZBresVZBFvkki2p02AQXrTDFCp7zaaLGZCNhoF9zeyRCkW9KE9abtWYQt6fyfC6vO5lj4Yrgv5EN5jNndqJE88XrZA1ZCJmstdSvSQZCsWzMJPuZA6Vj8zfYsTjyqwqOqHAQiAmCa5PesFKq0KGR8gTlGTGqZBLt3PhhNDO6xvnytRNRNLCLXM9LFoP9iX9HZBv1PuCe5d4xRsfCxIh65jAzLnf5JnT37YUvaIFn4P3qnZCy84XXIZCmmZCHcpUfAZAY4H7xRib',
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [contacts, setContacts] = useState<Contact[]>(() => JSON.parse(localStorage.getItem('zapflow_contacts') || '[]'));
  const [groups, setGroups] = useState<InternalGroup[]>(() => JSON.parse(localStorage.getItem('zapflow_groups') || '[]'));
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => JSON.parse(localStorage.getItem('zapflow_orders') || '[]'));
  const [materials, setMaterials] = useState<Material[]>(() => JSON.parse(localStorage.getItem('zapflow_materials') || JSON.stringify(INITIAL_MATERIALS)));
  const [cities, setCities] = useState<string[]>(() => JSON.parse(localStorage.getItem('zapflow_cities') || JSON.stringify(INITIAL_CITIES)));
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [reminders, setReminders] = useState<string[]>(JSON.parse(localStorage.getItem('zapflow_reminders') || '[]'));
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig>(() => JSON.parse(localStorage.getItem('zapflow_wa_config') || JSON.stringify(INITIAL_CONFIG)));
  
  useEffect(() => {
    localStorage.setItem('zapflow_contacts', JSON.stringify(contacts));
    localStorage.setItem('zapflow_orders', JSON.stringify(orders));
    localStorage.setItem('zapflow_materials', JSON.stringify(materials));
    localStorage.setItem('zapflow_cities', JSON.stringify(cities));
    localStorage.setItem('zapflow_wa_config', JSON.stringify(whatsappConfig));
  }, [contacts, orders, materials, cities, whatsappConfig]);

  const addChatMessage = async (contactId: string, text: string, sender: 'me' | 'client' = 'me') => {
    const contact = contacts.find(c => c.id === contactId);
    
    if (sender === 'me' && contact) {
      const result = await sendWhatsAppMessage(contact.phone, text, whatsappConfig);
      if (!result.success) {
        alert(`Erro ao enviar WhatsApp: ${result.error}`);
      }
    }

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
          lastTimestamp: newMessage.timestamp
        } : c);
      }
      return [...prev, {
        contactId,
        contactName: contact?.name || 'Contato Novo',
        contactPhone: contact?.phone || '',
        lastMessage: text,
        lastTimestamp: newMessage.timestamp,
        unreadCount: 0,
        messages: [newMessage]
      }];
    });
  };

  const updateOrderStatus = (orderId: string, status: Order['status'], receiptData?: Order['receiptData']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedOrder = { ...o, status, receiptData: receiptData || o.receiptData };
        if (status === 'delivered' && receiptData) {
          const itemsList = updatedOrder.items?.map(i => `- ${i.quantity} ${i.unit} ${i.materialName}`).join('\n') || '';
          const msg = `✅ *PEDIDO ENTREGUE (#${updatedOrder.orderNumber})*\n\nOlá *${updatedOrder.contactName}*, sua entrega foi realizada!\n\n📦 *Itens:*\n${itemsList}\n\n👤 *Recebido por:* ${receiptData.fullName}\n📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}\n\nObrigado! 🚀`;
          addChatMessage(updatedOrder.contactId, msg);
        }
        return updatedOrder;
      }
      return o;
    }));
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar currentView={view} setView={setView} whatsappStatus={whatsappConfig.method !== 'manual' ? 'connected' : 'disconnected'} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">
            {view === 'dashboard' && 'Dashboard'}
            {view === 'contacts' && 'Contatos'}
            {view === 'order-scheduler' && 'Pedidos'}
            {view === 'inbox' && 'WhatsApp Inbox'}
            {view === 'settings' && 'Integrações'}
            {view === 'reports' && 'Relatórios'}
          </h1>
        </header>

        {view === 'dashboard' && <Dashboard contacts={contacts} messages={messages} groups={groups} orders={orders} reminders={reminders} setReminders={setReminders} />}
        {view === 'contacts' && <ContactManager contacts={contacts} setContacts={setContacts} groups={groups} googleToken={null} onGoogleAuth={() => {}} onGoogleLogout={() => {}} clientId="" />}
        {view === 'order-scheduler' && <OrderScheduler contacts={contacts} orders={orders} materials={materials} cities={cities} onAddOrder={(o) => setOrders(prev => [{...o, id: Math.random().toString(36).substr(2,5), orderNumber: prev.length + 1}, ...prev])} onUpdateOrderStatus={updateOrderStatus} />}
        {view === 'inbox' && <ChatInbox conversations={conversations} setConversations={setConversations} onSendMessage={addChatMessage} whatsappStatus={whatsappConfig.method !== 'manual' ? 'connected' : 'disconnected'} setWhatsappStatus={() => {}} orders={orders} config={whatsappConfig} setView={setView} />}
        {view === 'settings' && <Settings config={whatsappConfig} setConfig={setWhatsappConfig} materials={materials} setMaterials={setMaterials} cities={cities} setCities={setCities} />}
        {view === 'reports' && <Reports orders={orders} cities={cities} onToggleNf={(id) => setOrders(prev => prev.map(o => o.id === id ? {...o, nfIssued: !o.nfIssued} : o))} />}
      </main>
    </div>
  );
};

export default App;
