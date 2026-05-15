import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ListChecks, Clock, ChevronDown, Package, FileText, CheckCircle2, History } from 'lucide-react';
import { firebaseService } from '../../services/firebaseService';
import { PurchaseIntent, User } from '../../types';

interface CollectiveListViewProps {
  user: User | null;
}

export default function CollectiveListView({ user }: CollectiveListViewProps) {
  const [intents, setIntents] = useState<PurchaseIntent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = firebaseService.onIntentsChange(user.uid, (data) => {
      setIntents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Registrado': return 'text-industrial-gold';
      case 'Validado': return 'text-blue-400';
      case 'Consolidado': return 'text-purple-400';
      case 'Em Fabricação': return 'text-orange-400';
      case 'Entregue': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
             <div className="w-2 h-8 bg-industrial-red"></div>
             Minhas intenções
          </h2>
          <p className="text-[11px] font-mono text-gray-400 uppercase tracking-tighter mt-1">Acompanhamento das Intenções de Compra Registradas</p>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-gray-600 bg-black/40 border border-industrial-outline p-2 px-4 uppercase tracking-[0.2em]">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-industrial-gold animate-pulse"></div>
              Aguardando Lote
           </div>
           <div className="w-px h-3 bg-industrial-outline"></div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Logística Ativa
           </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex items-center justify-center">
           <div className="w-8 h-8 border-2 border-industrial-red border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : intents.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-gray-700 space-y-4 bg-black/20 border-2 border-dashed border-industrial-outline">
           <History className="w-12 h-12 opacity-10" />
           <p className="text-[11px] font-mono uppercase tracking-[0.3em]">Nenhuma intenção registrada em sua matrícula</p>
           <button className="text-[10px] font-black text-industrial-red uppercase tracking-widest border border-industrial-red/30 px-6 py-2 hover:bg-industrial-red hover:text-white transition-all">
              Abrir Catálogo
           </button>
        </div>
      ) : (
        <div className="space-y-4">
          {intents.map((intent) => (
            <motion.div
              key={intent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-industrial-surface border border-industrial-outline metallic-border overflow-hidden"
            >
              <div className="p-5 flex flex-col md:flex-row items-center gap-6">
                {/* Product Info */}
                <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                   <div className="w-16 h-16 bg-black border border-industrial-outline flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <Package className="w-8 h-8 text-industrial-outline" />
                   </div>
                   <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-mono text-industrial-red uppercase tracking-tighter">{intent.vendorId}</span>
                        <span className="text-[9px] font-mono text-gray-600">ID: {intent.id.slice(0,8)}</span>
                      </div>
                      <h3 className="text-sm font-black text-white uppercase truncate tracking-wider">{intent.productName}</h3>
                      <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase">Protocolo: <span className="text-industrial-gold">{intent.protocol}</span></p>
                   </div>
                </div>

                {/* Specs */}
                <div className="flex items-center gap-8 px-6 border-l border-industrial-outline hidden lg:flex">
                   <div>
                      <p className="text-[8px] font-mono text-gray-600 uppercase mb-1">Quantidade</p>
                      <p className="text-xs font-bold text-white uppercase">{intent.quantity} UND</p>
                   </div>
                   <div>
                      <p className="text-[8px] font-mono text-gray-600 uppercase mb-1">Grade</p>
                      <p className="text-xs font-bold text-white uppercase">{intent.size || '---'}</p>
                   </div>
                </div>

                {/* Status */}
                <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-48 border-t md:border-t-0 md:border-l border-industrial-outline pt-4 md:pt-0">
                   <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest leading-none">Status do Manifesto</p>
                   <div className={`flex items-center gap-2 ${getStatusColor(intent.status)}`}>
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-black uppercase tracking-widest">{intent.status}</span>
                   </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 md:border-l border-industrial-outline pt-4 md:pt-0 md:pl-4">
                   <button className="flex-1 md:flex-none p-2 bg-black/40 border border-industrial-outline hover:text-industrial-red transition-colors">
                      <FileText className="w-4 h-4" />
                   </button>
                   <button className="flex-1 md:flex-none p-2 bg-black/40 border border-industrial-outline hover:text-industrial-gold transition-colors">
                      <Clock className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
