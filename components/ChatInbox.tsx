
import React, { useState, useEffect } from 'react';
import { Conversation, ChatMessage, Contact, Order } from '../types';

interface ChatInboxProps {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  onSendMessage: (contactId: string, text: string) => void;
  onAddContact?: (contact: Omit<Contact, 'id' | 'status'>) => void;
  onNavigateToOrder?: (contactId: string) => void;
  whatsappStatus: 'connected' | 'disconnected' | 'connecting';
  setWhatsappStatus: (status: 'connected' | 'disconnected' | 'connecting') => void;
  initialChatId?: string | null;
  setActiveChatId?: (id: string | null) => void;
  orders: Order[];
}

const ChatInbox: React.FC<ChatInboxProps> = ({ 
  conversations, 
  setConversations, 
  onSendMessage, 
  onAddContact, 
  onNavigateToOrder, 
  whatsappStatus, 
  setWhatsappStatus, 
  initialChatId, 
  setActiveChatId, 
  orders 
}) => {
  const [activeChat, setActiveChat] = useState<string | null>(initialChatId || null);
  const [newMessage, setNewMessage] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, contactId: string } | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    if (initialChatId) setActiveChat(initialChatId);
  }, [initialChatId]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleStartConnection = () => {
    setWhatsappStatus('connecting');
    setTimeout(() => {
      setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ZapFlow-' + Math.random());
    }, 1000);
    setTimeout(() => {
      setWhatsappStatus('connected');
      setQrCode(null);
    }, 4000);
  };

  const handleContextMenu = (e: React.MouseEvent, contactId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, contactId });
  };

  const toggleUnread = (contactId: string) => {
    setConversations(prev => prev.map(c => 
      c.contactId === contactId ? { ...c, isUnread: !c.isUnread, unreadCount: !c.isUnread ? 1 : 0 } : c
    ));
    setContextMenu(null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    onSendMessage(activeChat, newMessage);
    setNewMessage('');
  };

  const currentConv = conversations.find(c => c.contactId === activeChat);
  const contactOrders = orders.filter(o => o.contactId === activeChat && o.status !== 'delivered');

  if (whatsappStatus === 'disconnected' || whatsappStatus === 'connecting') {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col items-center justify-center p-12 h-[calc(100vh-200px)] animate-in fade-in zoom-in duration-300">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 mb-2 mx-auto shadow-inner">
             <i className="fa-brands fa-whatsapp text-5xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Conectar ao WhatsApp</h2>
            <p className="text-slate-500 text-sm">Escaneie o QR Code abaixo para habilitar o envio automático de protocolos de entrega.</p>
          </div>
          {!qrCode && whatsappStatus === 'disconnected' && (
            <button onClick={handleStartConnection} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-600/20">
              Gerar QR Code de Acesso
            </button>
          )}
          {whatsappStatus === 'connecting' && qrCode && (
            <div className="bg-white p-4 rounded-3xl border-4 border-slate-100 inline-block">
               <img src={qrCode} alt="QR Code" className="w-64 h-64 rounded-xl" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex h-[calc(100vh-200px)] relative">
      {contextMenu && (
        <div className="fixed bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] w-64 py-2" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <button onClick={() => { if(onNavigateToOrder) onNavigateToOrder(contextMenu.contactId); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-sm flex items-center gap-3 text-emerald-700 font-bold">
            <i className="fa-solid fa-cart-plus w-4"></i> Adicionar Pedido
          </button>
          <button onClick={() => toggleUnread(contextMenu.contactId)} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm flex items-center gap-3 text-slate-700">
            <i className="fa-solid fa-envelope-open text-slate-400 w-4"></i> Marcar como não lida
          </button>
        </div>
      )}

      <div className="w-full md:w-80 border-r border-slate-100 flex flex-col">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100">
           <input type="text" placeholder="Buscar conversa..." className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => {
            const hasPending = orders.some(o => o.contactId === conv.contactId && o.status !== 'delivered');
            return (
              <button
                key={conv.contactId}
                onContextMenu={(e) => handleContextMenu(e, conv.contactId)}
                onClick={() => { setActiveChat(conv.contactId); if(setActiveChatId) setActiveChatId(conv.contactId); }}
                className={`w-full p-4 flex items-center gap-3 border-b border-slate-50 transition-colors ${activeChat === conv.contactId ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0 relative">
                  {conv.contactName.charAt(0)}
                  {hasPending && <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm"><i className="fa-solid fa-truck-fast text-white text-[8px]"></i></div>}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-baseline">
                    <h4 className={`text-sm truncate ${conv.isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{conv.contactName}</h4>
                    <span className="text-[10px] text-slate-400">{conv.lastTimestamp}</span>
                  </div>
                  <p className="text-xs truncate text-slate-500">{conv.lastMessage}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden md:flex flex-1 flex-col bg-slate-50/30">
        {currentConv ? (
          <>
            <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">{currentConv.contactName.charAt(0)}</div>
                <div><h3 className="font-bold text-slate-800">{currentConv.contactName}</h3><p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online</p></div>
              </div>
            </div>

            {contactOrders.length > 0 && (
              <div className="bg-amber-50 border-b border-amber-100 p-3 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center"><i className="fa-solid fa-truck-ramp-box text-sm"></i></div>
                    <div className="text-xs text-amber-800"><b>Pedido Pendente:</b> {contactOrders[0].items?.length} itens agendados.</div>
                 </div>
                 <button onClick={() => onNavigateToOrder && onNavigateToOrder(activeChat!)} className="px-3 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-amber-700">Gerenciar</button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentConv.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'me' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <div className="text-[10px] mt-1 text-right opacity-60">{msg.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input type="text" placeholder="Digite uma mensagem..." className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                <button type="submit" disabled={!newMessage.trim()} className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50"><i className="fa-solid fa-paper-plane"></i></button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center"><i className="fa-brands fa-whatsapp text-6xl mb-4 opacity-10"></i><h3 className="text-xl font-bold text-slate-800 mb-2">Selecione uma conversa</h3><p className="max-w-xs text-sm">O histórico de protocolos de entrega aparecerá aqui automaticamente.</p></div>
        )}
      </div>
    </div>
  );
};

export default ChatInbox;
