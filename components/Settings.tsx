
import React, { useState } from 'react';
import { Material } from '../types';

interface SettingsProps {
  googleToken: string | null;
  onGoogleAuth: (token: string) => void;
  onGoogleLogout: () => void;
  clientId: string;
  setClientId: (id: string) => void;
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  cities: string[];
  setCities: React.Dispatch<React.SetStateAction<string[]>>;
}

const Settings: React.FC<SettingsProps> = ({ googleToken, onGoogleAuth, onGoogleLogout, clientId, setClientId, materials, setMaterials, cities, setCities }) => {
  const [activeTab, setActiveTab] = useState<'system' | 'materials' | 'google' | 'cities'>('system');
  const [newMaterial, setNewMaterial] = useState({ name: '', unit: 'UN' });
  const [newCity, setNewCity] = useState('');

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.name) return;
    const mat: Material = {
      id: Math.random().toString(36).substr(2, 9),
      name: newMaterial.name.toUpperCase(),
      unit: newMaterial.unit.toUpperCase()
    };
    setMaterials(prev => [...prev, mat]);
    setNewMaterial({ name: '', unit: 'UN' });
  };

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim()) return;
    const updated = [...cities, newCity.trim()].sort((a, b) => a.localeCompare(b));
    setCities(updated);
    setNewCity('');
  };

  const removeCity = (cityToRemove: string) => {
    setCities(prev => prev.filter(c => c !== cityToRemove));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto pb-1">
        <button onClick={() => setActiveTab('system')} className={`pb-4 px-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'system' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          Configurações
        </button>
        <button onClick={() => setActiveTab('google')} className={`pb-4 px-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'google' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          Google Cloud Sync
        </button>
        <button onClick={() => setActiveTab('materials')} className={`pb-4 px-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'materials' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          Materiais
        </button>
        <button onClick={() => setActiveTab('cities')} className={`pb-4 px-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'cities' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          Cidades
        </button>
      </div>

      {activeTab === 'google' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <i className="fa-brands fa-google text-blue-500"></i>
              Vincular Google Cloud
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Google Client ID</label>
                <input 
                  type="text" 
                  placeholder="Seu ID do console.cloud.google.com"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm"
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                />
              </div>

              {/* ALERTA PARA O ERRO DE ORGANIZAÇÃO */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <h4 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation"></i> Erro: "Apenas para a Organização"?
                </h4>
                <p className="text-xs text-amber-700 mb-3">
                  Se você viu esta mensagem, siga estes passos no Google Console:
                </p>
                <ol className="text-xs text-amber-700 space-y-2 list-decimal ml-4">
                  <li>Vá em <b>"Tela de consentimento OAuth"</b>.</li>
                  <li>Em <b>"User Type"</b>, clique em <b>"MAKE EXTERNAL"</b> (ou Criar Externo).</li>
                  <li>Se o app estiver em "Testing" (Teste), você deve adicionar seu e-mail manualmente na lista de <b>"Usuários de teste"</b> logo abaixo.</li>
                </ol>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-circle-info"></i> Lembrete de URLs:
                </h4>
                <ul className="text-xs text-blue-700 space-y-1 list-disc ml-4">
                  <li>Em <b>"Origens JavaScript autorizadas"</b>:</li>
                  <li className="list-none font-mono mt-1">https://zapflow-q98d.vercel.app</li>
                </ul>
              </div>
              
              {googleToken ? (
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-bold text-emerald-700">Conectado com Sucesso</span>
                  </div>
                  <button onClick={onGoogleLogout} className="text-xs font-bold text-red-600 hover:underline">Desconectar</button>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
                   <p className="text-xs text-slate-500 italic">Após ajustar para <b>Externo</b>, tente sincronizar novamente na aba Contatos.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-slate-900 p-8 rounded-3xl text-white flex flex-col justify-center relative overflow-hidden">
             <i className="fa-solid fa-shield-halved absolute -top-4 -right-4 text-9xl opacity-10"></i>
             <h3 className="text-lg font-bold mb-4">Dica de Segurança</h3>
             <p className="text-sm text-slate-300 leading-relaxed">
                Ao mudar para <b>Externo</b>, o Google manterá o app em modo de "Teste". Isso é ideal! 
                Você pode adicionar até 100 e-mails de teste (como os seus colaboradores) sem precisar passar pelo processo burocrático de verificação do Google.
             </p>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${googleToken ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <i className="fa-brands fa-google text-xl"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Sincronização</p>
              <p className={`text-sm font-bold ${googleToken ? 'text-emerald-600' : 'text-slate-600'}`}>{googleToken ? 'Ativa' : 'Pendente'}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600`}>
              <i className="fa-solid fa-location-dot text-xl"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Cidades</p>
              <p className="text-sm font-bold text-slate-600">{cities.length} Cadastradas</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-300">
          <div className="lg:col-span-1">
             <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-folder-plus text-emerald-600"></i>
                  Cadastrar Material
                </h3>
                <form onSubmit={handleAddMaterial} className="space-y-4">
                  <input type="text" required placeholder="Descrição" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} />
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" value={newMaterial.unit} onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})}>
                    <option value="UN">UN</option>
                    <option value="PCT">PCT</option>
                    <option value="CX">CX</option>
                    <option value="KG">KG</option>
                  </select>
                  <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold">Salvar Material</button>
                </form>
             </div>
          </div>
          <div className="lg:col-span-2 overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-md">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Material</th>
                  <th className="px-6 py-4">Unidade</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map(mat => (
                  <tr key={mat.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{mat.name}</td>
                    <td className="px-6 py-4 text-slate-600">{mat.unit}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => setMaterials(prev => prev.filter(m => m.id !== mat.id))} className="text-slate-300 hover:text-red-500">
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'cities' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-300">
          <div className="lg:col-span-1">
             <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-map-location-dot text-blue-600"></i>
                  Cadastrar Cidade
                </h3>
                <form onSubmit={handleAddCity} className="space-y-4">
                  <input type="text" required placeholder="Ex: Catanduva" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={newCity} onChange={e => setNewCity(e.target.value)} />
                  <p className="text-[10px] text-slate-400 italic">As cidades serão listadas em ordem alfabética automaticamente.</p>
                  <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all">Salvar Cidade</button>
                </form>
             </div>
          </div>
          <div className="lg:col-span-2 overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-md">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Cidade</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cities.map(city => (
                  <tr key={city} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{city}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => removeCity(city)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
