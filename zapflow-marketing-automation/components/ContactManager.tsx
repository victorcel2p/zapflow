import React, { useState } from 'react';
import { Contact, InternalGroup } from '../types';

interface ContactManagerProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  groups: InternalGroup[];
  googleToken: string | null;
  onGoogleAuth: (token: string) => void;
  onGoogleLogout: () => void;
  clientId: string;
}

const ContactManager: React.FC<ContactManagerProps> = ({ contacts, setContacts, groups, googleToken, onGoogleAuth, onGoogleLogout, clientId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', group: groups[0]?.name || '' });

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleGoogleAuthClick = () => {
    if (!clientId || clientId.trim() === '') {
      alert("⚠️ Configure seu Client ID na aba 'Configurações' primeiro.");
      return;
    }

    try {
      // @ts-ignore
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/contacts.readonly',
        callback: (response: any) => {
          if (response.access_token) {
            onGoogleAuth(response.access_token);
            fetchGoogleContacts(response.access_token);
          }
        },
      });
      client.requestAccessToken();
    } catch (err) {
      console.error("Erro ao iniciar Google Auth:", err);
      alert("Erro ao conectar com o Google. Verifique se o Client ID e as origens JavaScript estão configuradas no Google Cloud.");
    }
  };

  const fetchGoogleContacts = async (token: string) => {
    setIsSyncing(true);
    try {
      // Buscando 1000 contatos por vez
      const response = await fetch('https://people.googleapis.com/v1/people/me/connections?pageSize=1000&personFields=names,phoneNumbers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.connections) {
        const mapped: Contact[] = data.connections
          .filter((c: any) => c.phoneNumbers && c.phoneNumbers.length > 0)
          .map((c: any, idx: number) => {
            let phone = c.phoneNumbers?.[0]?.value?.replace(/\D/g, '') || '';
            // Se o telefone não começar com 55 e tiver 10 ou 11 dígitos, assume que é Brasil
            if (phone.length >= 10 && !phone.startsWith('55')) {
              phone = `55${phone}`;
            }
            
            return {
              id: `g-${idx}-${Date.now()}`,
              name: c.names?.[0]?.displayName || 'Contato Sem Nome',
              phone: phone,
              group: 'Gmail Sync',
              status: 'active',
              isGoogleContact: true
            };
          })
          .filter((c: Contact) => c.phone.length >= 12); // Pelo menos 55 + DDD + 8 dígitos

        setContacts(prev => {
          const existingPhones = new Set(prev.map(p => p.phone));
          const uniques = mapped.filter(m => !existingPhones.has(m.phone));
          return [...prev, ...uniques];
        });
        
        alert(`Sucesso! Foram importados ${mapped.length} contatos da sua conta Google.`);
      } else {
        alert("Nenhum contato encontrado na sua conta Google.");
      }
    } catch (err) {
      console.error("Erro People API:", err);
      alert("Erro ao sincronizar. Verifique se a 'People API' está ativada no seu Console Google Cloud.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;
    const contact: Contact = {
      id: Math.random().toString(36).substr(2, 9),
      name: newContact.name,
      phone: newContact.phone.replace(/\D/g, ''),
      group: newContact.group,
      status: 'active'
    };
    setContacts(prev => [...prev, contact]);
    setNewContact({ name: '', phone: '', group: groups[0]?.name || '' });
    setShowAddModal(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou telefone..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {!googleToken ? (
              <button 
                onClick={handleGoogleAuthClick}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
                Sincronizar Gmail
              </button>
            ) : (
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
                  <i className="fa-brands fa-google text-blue-500"></i>
                  <span>Gmail Ativo</span>
                  <button onClick={() => fetchGoogleContacts(googleToken)} disabled={isSyncing} className="ml-2 hover:text-blue-900">
                    <i className={`fa-solid fa-arrows-rotate ${isSyncing ? 'animate-spin' : ''}`}></i>
                  </button>
                </div>
                <button onClick={onGoogleLogout} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Desconectar Google">
                  <i className="fa-solid fa-power-off"></i>
                </button>
              </div>
            )}
            <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 shadow-sm transition-all active:scale-95">
              <i className="fa-solid fa-plus mr-2"></i> Novo Manual
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">Nome do Cliente</th>
              <th className="px-6 py-4">WhatsApp (DDI+DDD+N)</th>
              <th className="px-6 py-4">Origem / Grupo</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredContacts.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-16 text-center text-slate-400 italic">Nenhum contato importado ainda. Clique em "Sincronizar Gmail".</td></tr>
            ) : (
              filteredContacts.map(contact => (
                <tr key={contact.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border ${contact.isGoogleContact ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {contact.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800">{contact.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a href={`https://wa.me/${contact.phone}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-mono text-sm hover:underline flex items-center gap-2">
                       <i className="fa-brands fa-whatsapp"></i>
                       {contact.phone}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${contact.isGoogleContact ? 'bg-blue-50 text-blue-500 border-blue-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {contact.group}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => setContacts(prev => prev.filter(c => c.id !== contact.id))} className="text-slate-300 hover:text-red-500 transition-colors">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <h3 className="text-lg font-bold">Adicionar Manual</h3>
              <button onClick={() => setShowAddModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleAddContact} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nome do Cliente</label>
                <input type="text" placeholder="Ex: João Silva" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">WhatsApp (Somente números)</label>
                <input type="text" placeholder="Ex: 5511999999999" className="w-full p-4 bg-slate-50 border rounded-2xl font-mono outline-none focus:ring-2 focus:ring-emerald-500/20" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Grupo de Segmentação</label>
                <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={newContact.group} onChange={e => setNewContact({...newContact, group: e.target.value})}>
                  {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
                Salvar Contato
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManager;