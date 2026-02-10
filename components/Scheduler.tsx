
import React, { useState, useRef } from 'react';
import { InternalGroup, ScheduledMessage, Contact } from '../types';

interface SchedulerProps {
  groups: InternalGroup[];
  setGroups: React.Dispatch<React.SetStateAction<InternalGroup[]>>;
  contacts: Contact[];
  addMessage: (msg: Omit<ScheduledMessage, 'id' | 'status'>) => void;
  messages: ScheduledMessage[];
}

const Scheduler: React.FC<SchedulerProps> = ({ groups, setGroups, contacts, addMessage, messages }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    groupId: groups[0]?.id || '',
    content: '',
    scheduledAt: ''
  });

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    contactIds: [] as string[]
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("O arquivo é muito grande. O limite é de 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.groupId || !formData.content || !formData.scheduledAt) return;
    
    addMessage({
      ...formData,
      attachment: attachment || undefined
    });

    setFormData({
      groupId: groups[0]?.id || '',
      content: '',
      scheduledAt: ''
    });
    setAttachment(null);
    alert('Mensagem agendada com sucesso!');
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name) return;

    const colors = [
      'bg-emerald-100 text-emerald-700',
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-amber-100 text-amber-700',
      'bg-rose-100 text-rose-700'
    ];
    
    const group: InternalGroup = {
      id: `g-${Math.random().toString(36).substr(2, 9)}`,
      name: newGroup.name,
      description: newGroup.description,
      color: colors[groups.length % colors.length],
      contactIds: newGroup.contactIds
    };

    setGroups(prev => [...prev, group]);
    setNewGroup({ name: '', description: '', contactIds: [] });
    setShowGroupModal(false);
  };

  const toggleContactInGroup = (contactId: string) => {
    setNewGroup(prev => ({
      ...prev,
      contactIds: prev.contactIds.includes(contactId) 
        ? prev.contactIds.filter(id => id !== contactId)
        : [...prev.contactIds, contactId]
    }));
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Agendar Nova Mensagem</h3>
            <button 
              onClick={() => setShowGroupModal(true)}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-layer-group"></i> Criar Grupo
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Selecione o Grupo de Destino</label>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                {groups.map(group => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setFormData({...formData, groupId: group.id})}
                    className={`p-3 text-left rounded-xl border-2 transition-all relative ${
                      formData.groupId === group.id 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-600'
                    }`}
                  >
                    <p className="font-bold text-sm">{group.name}</p>
                    <p className="text-[10px] opacity-60 truncate">
                      {group.contactIds?.length || 0} contatos vinculados
                    </p>
                    {formData.groupId === group.id && (
                      <div className="absolute top-2 right-2 text-emerald-500">
                        <i className="fa-solid fa-circle-check"></i>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Conteúdo da Mensagem</label>
              <div className="relative">
                <textarea
                  required
                  rows={5}
                  placeholder="Escreva sua mensagem aqui... Use emojis para maior engajamento 🚀"
                  className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none bg-slate-50"
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                ></textarea>
                
                {attachment && (
                  <div className="mt-3 relative inline-block">
                    <img 
                      src={attachment} 
                      alt="Preview anexo" 
                      className="h-32 w-auto rounded-lg border border-slate-200 object-cover shadow-sm"
                    />
                    <button 
                      type="button"
                      onClick={removeAttachment}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                    >
                      <i className="fa-solid fa-xmark text-xs"></i>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-2">
                 <div className="flex gap-4">
                   <input 
                     type="file" 
                     accept="image/*" 
                     className="hidden" 
                     ref={fileInputRef}
                     onChange={handleFileChange}
                   />
                   <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className={`text-xs font-semibold flex items-center gap-1 transition-colors ${attachment ? 'text-emerald-700' : 'text-slate-600 hover:text-emerald-600'}`}
                   >
                      <i className="fa-solid fa-paperclip"></i> {attachment ? 'Trocar Imagem' : 'Anexar Imagem/Banner'}
                   </button>
                 </div>
                 <span className="text-xs text-slate-400">{formData.content.length} caracteres</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Data e Hora de Envio</label>
              <input 
                type="datetime-local" 
                required
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-slate-50"
                value={formData.scheduledAt}
                onChange={e => setFormData({...formData, scheduledAt: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
            >
              Confirmar Agendamento
            </button>
          </form>
        </div>
      </div>

      <div className="bg-slate-100 p-8 rounded-2xl border border-dashed border-slate-300 flex flex-col h-full">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Próximos Envios</h3>
        <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
               <i className="fa-solid fa-calendar-xmark text-4xl mb-4"></i>
               <p className="font-medium">Nenhuma mensagem na fila</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative group">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${groups.find(g => g.id === msg.groupId)?.color || 'bg-slate-100'}`}>
                    {groups.find(g => g.id === msg.groupId)?.name}
                  </span>
                  <div className="flex gap-2">
                    <span className="text-xs text-slate-500 font-medium">
                       {new Date(msg.scheduledAt).toLocaleDateString()} às {new Date(msg.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
                
                {msg.attachment && (
                  <img src={msg.attachment} className="w-full h-32 object-cover rounded-lg mb-3 border border-slate-100" alt="Anexo agendado" />
                )}

                <p className="text-slate-700 text-sm whitespace-pre-line line-clamp-3">
                  {msg.content}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                   <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Aguardando
                   </span>
                   <button className="text-xs text-slate-400 hover:text-red-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Cancelar Envio
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Criação de Grupo */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-600 text-white">
              <div>
                <h3 className="text-xl font-bold">Criar Grupo Interno</h3>
                <p className="text-xs opacity-80">Selecione os contatos para promoções específicas</p>
              </div>
              <button onClick={() => setShowGroupModal(false)} className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Nome do Grupo</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Promoção de Natal" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20" 
                    value={newGroup.name} 
                    onChange={e => setNewGroup({...newGroup, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Descrição (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Clientes interessados em ofertas" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20" 
                    value={newGroup.description} 
                    onChange={e => setNewGroup({...newGroup, description: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selecionar Contatos ({newGroup.contactIds.length})</label>
                  <div className="relative">
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    <input 
                      type="text" 
                      placeholder="Buscar contato..." 
                      className="pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {filteredContacts.length === 0 ? (
                    <p className="col-span-2 text-center text-xs text-slate-400 py-4 italic">Nenhum contato encontrado.</p>
                  ) : (
                    filteredContacts.map(contact => (
                      <button 
                        key={contact.id}
                        type="button"
                        onClick={() => toggleContactInGroup(contact.id)}
                        className={`p-3 text-left border rounded-xl flex items-center justify-between transition-all ${
                          newGroup.contactIds.includes(contact.id)
                            ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500'
                            : 'bg-white border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${newGroup.contactIds.includes(contact.id) ? 'text-emerald-700' : 'text-slate-800'}`}>{contact.name}</p>
                          <p className="text-[10px] text-slate-400">{contact.phone}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          newGroup.contactIds.includes(contact.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'
                        }`}>
                          {newGroup.contactIds.includes(contact.id) && <i className="fa-solid fa-check text-[8px]"></i>}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setShowGroupModal(false)}
                className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateGroup}
                disabled={!newGroup.name || newGroup.contactIds.length === 0}
                className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95"
              >
                Salvar Grupo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler;
