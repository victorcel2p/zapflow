
import React, { useState } from 'react';
import { Material, WhatsAppConfig } from '../types';

interface SettingsProps {
  config: WhatsAppConfig;
  setConfig: (config: WhatsAppConfig) => void;
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  cities: string[];
  setCities: React.Dispatch<React.SetStateAction<string[]>>;
}

const Settings: React.FC<SettingsProps> = ({ config, setConfig, materials, setMaterials, cities, setCities }) => {
  const [activeTab, setActiveTab] = useState<'wa' | 'webhook' | 'materials' | 'cities'>('wa');
  const [newCity, setNewCity] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [verifyToken, setVerifyToken] = useState('zapflow_token_seguro');

  const updateConfig = (updates: Partial<WhatsAppConfig>) => {
    setConfig({ ...config, ...updates });
  };

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('wa')} className={`pb-4 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${activeTab === 'wa' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'}`}>
          <i className="fa-solid fa-paper-plane mr-2"></i> Envio (API)
        </button>
        <button onClick={() => setActiveTab('webhook')} className={`pb-4 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${activeTab === 'webhook' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>
          <i className="fa-solid fa-reply-all mr-2"></i> Recebimento (Webhook)
        </button>
        <button onClick={() => setActiveTab('materials')} className={`pb-4 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${activeTab === 'materials' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'}`}>
          Materiais
        </button>
        <button onClick={() => setActiveTab('cities')} className={`pb-4 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${activeTab === 'cities' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'}`}>
          Cidades
        </button>
      </div>

      {activeTab === 'wa' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Configuração de Saída</h3>
              <p className="text-sm text-slate-500 mb-6">Como o ZapFlow envia mensagens para seus clientes.</p>
            </div>
            <button 
              onClick={() => setShowHelp(true)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-circle-question"></i> Ajuda com chaves
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => updateConfig({ method: 'manual' })}
              className={`p-4 border-2 rounded-2xl text-left transition-all ${config.method === 'manual' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100'}`}
            >
              <i className="fa-solid fa-hand-pointer mb-2 text-emerald-600"></i>
              <p className="font-bold text-sm">Manual</p>
              <p className="text-xs opacity-60">Abre link wa.me</p>
            </button>

            <button 
              onClick={() => updateConfig({ method: 'official' })}
              className={`p-4 border-2 rounded-2xl text-left transition-all ${config.method === 'official' ? 'border-blue-500 bg-blue-50' : 'border-slate-100'}`}
            >
              <i className="fa-brands fa-facebook mb-2 text-blue-600"></i>
              <p className="font-bold text-sm">API Oficial</p>
              <p className="text-xs opacity-60">Direto com a Meta</p>
            </button>

            <button 
              onClick={() => updateConfig({ method: 'gateway' })}
              className={`p-4 border-2 rounded-2xl text-left transition-all ${config.method === 'gateway' ? 'border-purple-500 bg-purple-50' : 'border-slate-100'}`}
            >
              <i className="fa-solid fa-server mb-2 text-purple-600"></i>
              <p className="font-bold text-sm">Gateway</p>
              <p className="text-xs opacity-60">Evolution/WPP</p>
            </button>
          </div>

          {config.method === 'official' && (
            <div className="pt-6 border-t space-y-4 animate-in slide-in-from-top-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Access Token</label>
                  <input type="password" placeholder="EAAB..." className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={config.accessToken || ''} onChange={e => updateConfig({ accessToken: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Phone Number ID</label>
                  <input type="text" placeholder="10546..." className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={config.phoneNumberId || ''} onChange={e => updateConfig({ phoneNumberId: e.target.value })} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'webhook' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center gap-4 bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              <i className="fa-solid fa-route"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold">Fluxo de Recebimento</h3>
              <p className="text-xs text-blue-100">WhatsApp (Meta) → Webhook → ZapFlow</p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-sm text-slate-600 leading-relaxed">
              O Webhook permite que as mensagens que seus clientes enviam apareçam automaticamente na sua aba <b>Mensagens</b>. Sem isso, você só conseguirá enviar, mas nunca receber.
            </p>

            <div className="space-y-4">
               <div className="p-4 bg-slate-50 border rounded-2xl">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">1. Callback URL (Copie para o Painel Meta)</label>
                  <div className="flex gap-2">
                    <input readOnly type="text" value="https://oehrjplxsgewixvpstry.supabase.co/functions/v1/whatsapp-webhook" className="flex-1 p-3 bg-white border rounded-xl text-xs font-mono text-blue-600" />
                    <button onClick={() => navigator.clipboard.writeText('https://oehrjplxsgewixvpstry.supabase.co/functions/v1/whatsapp-webhook')} className="px-4 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-black transition-all">Copiar</button>
                  </div>
               </div>

               <div className="p-4 bg-slate-50 border rounded-2xl">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">2. Verify Token (Escolha uma senha)</label>
                  <div className="flex gap-2">
                    <input type="text" value={verifyToken} onChange={e => setVerifyToken(e.target.value)} className="flex-1 p-3 bg-white border rounded-xl text-xs font-mono text-blue-600" />
                    <button onClick={() => navigator.clipboard.writeText(verifyToken)} className="px-4 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-black transition-all">Copiar</button>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-2">* Use este mesmo texto no campo "Token de Verificação" na Meta.</p>
               </div>
            </div>

            <div className="pt-6 border-t">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-list-check text-emerald-500"></i>
                Onde configurar na Meta?
              </h4>
              <div className="space-y-3">
                <div className="flex gap-3 text-sm">
                  <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <p>Vá em <a href="https://developers.facebook.com" target="_blank" className="text-blue-600 underline">developers.facebook.com</a> e abra seu App.</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <p>No menu lateral esquerdo, clique em <b>WhatsApp</b> &gt; <b>Configuração</b>.</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <p>Em <b>Webhooks</b>, clique em <b>Editar</b>. Cole a URL e o Token acima.</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                  <p><b>IMPORTANTE:</b> Clique no botão <b>Gerenciar</b> e ative (Subscribe) o campo <b>messages</b>.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ajuda Meta API */}
      {showHelp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Guia: API Oficial WhatsApp</h3>
              <button onClick={() => setShowHelp(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6 text-slate-700">
              <section>
                <h4 className="font-bold text-blue-600 flex items-center gap-2 mb-2">1. Criar Aplicativo</h4>
                <p className="text-sm">No site de desenvolvedores da Meta, crie um app do tipo "Empresa".</p>
              </section>
              <section className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <h4 className="font-bold text-amber-700 flex items-center gap-2 mb-2">Token Permanente</h4>
                <p className="text-xs">O token que você pega na tela inicial expira em 24h. Vá em "Configurações do Negócio" no Facebook para gerar um Token de Sistema que nunca expira.</p>
              </section>
              <div className="pt-4 border-t flex justify-end">
                <button onClick={() => setShowHelp(false)} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm">Entendido</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
           <h3 className="text-lg font-bold text-slate-800">Materiais Disponíveis</h3>
           <div className="grid grid-cols-1 gap-2">
             {materials.map(m => (
               <div key={m.id} className="p-4 bg-slate-50 border rounded-xl flex justify-between items-center group">
                 <div>
                   <p className="text-sm font-bold text-slate-800">{m.name}</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase">Unidade: {m.unit}</p>
                 </div>
                 <button onClick={() => setMaterials(materials.filter(item => item.id !== m.id))} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                   <i className="fa-solid fa-trash-can"></i>
                 </button>
               </div>
             ))}
           </div>
        </div>
      )}

      {activeTab === 'cities' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
           <h3 className="text-lg font-bold text-slate-800">Cidades de Atendimento</h3>
           <form onSubmit={(e) => { e.preventDefault(); if(newCity) { setCities([...cities, newCity].sort()); setNewCity(''); } }} className="flex gap-2">
              <input type="text" placeholder="Nova cidade..." className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20" value={newCity} onChange={e => setNewCity(e.target.value)} />
              <button type="submit" className="px-6 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/10">Adicionar</button>
           </form>
           <div className="flex flex-wrap gap-2">
              {cities.map(c => (
                <span key={c} className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-2 border border-slate-200">
                  {c}
                  <button onClick={() => setCities(cities.filter(item => item !== c))} className="text-red-400 hover:text-red-600"><i className="fa-solid fa-xmark"></i></button>
                </span>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
