
import React, { useState, useEffect } from 'react';
import { Conversation, ChatMessage, Contact, Order, WhatsAppConfig } from '../types';

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
  config: WhatsAppConfig;
  setView: (view: any) => void;
}

const ChatInbox: React.FC<ChatInboxProps> = ({ 
  conversations, 
  setConversations, 
  onSendMessage, 
  onNavigateToOrder, 
  whatsappStatus, 
  initialChatId, 
  setActiveChatId, 
  orders,
  config,
  setView
}) => {
  const [activeChat, setActiveChat] = useState<string | null>(initialChatId || null);
  const [newMessage, setNewMessage] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, contactId: string } | null>(null);

  useEffect(() => {
    if (initialChatId) setActiveChat(initialChatId);
  }, [initialChatId]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

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

      {/* Sidebar de conversas */}
      <div className="w-full md:w-80 border-r border-slate-100 flex flex-col">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100">
           <div className="flex flex-col gap-2">
              <input type="text" placeholder="Buscar conversa..." className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              {config.method === 'official' && (
                <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                  <p className="text-[9px] font-bold text-blue-600 flex items-center gap-1 uppercase tracking-tight">
                    <i className="fa-solid fa-tower-broadcast"></i> API Ativa: ID {config.phoneNumberId?.slice(-4)}
                  </p>
                </div>
              )}
           </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs italic">
              <i className="fa-solid fa-inbox text-4xl mb-3 opacity-10"></i>
              <p>Nenhuma conversa recente</p>
            </div>
          ) : (
            conversations.map(conv => {
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
            })
          )}
        </div>
      </div>

      {/* Janela de Chat */}
      <div className="hidden md:flex flex-1 flex-col bg-slate-50/30">
        {currentConv ? (
          <>
            <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">{currentConv.contactName.charAt(0)}</div>
                <div><h3 className="font-bold text-slate-800">{currentConv.contactName}</h3><p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Cloud API Online</p></div>
              </div>
              {config.method === 'official' && (
                <div className="animate-pulse flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200 text-[10px] font-bold">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  RECEBIMENTO PENDENTE DE WEBHOOK
                </div>
              )}
            </div>

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
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <i className="fa-solid fa-comments text-4xl opacity-20"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Seu Chat Business</h3>
            <p className="max-w-xs text-sm mb-8">As mensagens que você enviar aparecerão aqui. Para ver o que os clientes respondem, você precisa ativar o Webhook.</p>
            
            {config.method === 'official' && (
              <button 
                onClick={() => setView('settings')}
                className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                <i className="fa-solid fa-gear"></i>
                Configurar Recebimento Agora
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInbox;
