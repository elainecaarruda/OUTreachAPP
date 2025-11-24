import React, { useState } from 'react';
import { useAuth } from '../App';
import { MOCK_REGISTRATIONS } from '../mockData';
import { AlertCircle, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-4 bg-red-100 rounded-full text-red-500 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Acesso Negado</h2>
        <p className="text-slate-500 mt-2">Você deve ser um Administrador para visualizar esta página.</p>
      </div>
    );
  }

  const filtered = MOCK_REGISTRATIONS.filter(r => r.status === activeTab);

  const roleLabels: Record<string, string> = {
    leader: 'Líder',
    evangelist: 'Evangelista',
    intercessor: 'Intercessor',
    admin: 'Admin',
    guest: 'Visitante'
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Gestão de Inscrições</h1>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-2 shadow-sm">
           <Search className="w-4 h-4 text-slate-400" />
           <input type="text" placeholder="Buscar candidatos..." className="outline-none text-sm bg-transparent" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-1">
        {['pending', 'approved', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {statusLabels[tab]} ({MOCK_REGISTRATIONS.filter(r => r.status === tab).length})
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Nenhuma inscrição {statusLabels[activeTab].toLowerCase()} encontrada.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((reg) => (
              <motion.div 
                key={reg.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900">{reg.nome}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      reg.role === 'leader' ? 'bg-purple-100 text-purple-700' :
                      reg.role === 'evangelist' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {roleLabels[reg.role] || reg.role}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">{reg.email}</div>
                  <div className="text-xs text-slate-400 mt-1">Inscrito em: {new Date(reg.created_date).toLocaleDateString('pt-BR')}</div>
                </div>

                {activeTab === 'pending' && (
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors border border-green-200">
                      <CheckCircle className="w-4 h-4" />
                      Aprovar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200">
                      <XCircle className="w-4 h-4" />
                      Rejeitar
                    </button>
                  </div>
                )}
                
                {activeTab !== 'pending' && (
                  <div className="px-4 py-2 bg-slate-50 rounded-lg text-slate-500 text-sm italic">
                    Processado
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};