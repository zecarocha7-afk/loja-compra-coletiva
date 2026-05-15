import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clipboard, Printer, Share2, Shield, Calendar, Package, Tag } from 'lucide-react';
import { PurchaseIntent } from '../types';

interface ProtocolReceiptProps {
  intent: PurchaseIntent;
  onClose: () => void;
}

export default function ProtocolReceipt({ intent, onClose }: ProtocolReceiptProps) {
  const formatDate = (date: any) => {
    if (!date) return '---';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleString('pt-BR');
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg bg-white text-zinc-900 border-4 border-industrial-red shadow-[0_0_50px_rgba(218,41,28,0.3)] overflow-hidden"
      >
        {/* Banner */}
        <div className="bg-industrial-red text-white p-6 flex flex-col items-center">
          <CheckCircle2 className="w-16 h-16 mb-2" />
          <h2 className="text-xl font-black uppercase tracking-[0.2em]">Intenção Registrada</h2>
          <p className="text-[10px] font-mono uppercase opacity-80 tracking-widest mt-1">Comprovante de Manifesto de Interesse</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="flex flex-col items-center gap-1 border-b border-zinc-200 pb-6">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Protocolo Gerado</span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-industrial-red tracking-tighter">{intent.protocol}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(intent.protocol)}
                className="p-1.5 bg-zinc-100 hover:bg-zinc-200 transition-colors rounded text-zinc-500"
              >
                <Clipboard className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-y-4">
              <div className="space-y-1">
                <p className="text-[9px] font-mono text-zinc-400 uppercase flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" /> Titular
                </p>
                <p className="text-xs font-bold uppercase">{intent.fullName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-mono text-zinc-400 uppercase flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" /> Data/Hora
                </p>
                <p className="text-xs font-bold uppercase">{formatDate(intent.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-mono text-zinc-400 uppercase flex items-center gap-1">
                  <Package className="w-2.5 h-2.5" /> Produto
                </p>
                <p className="text-xs font-bold uppercase">{intent.productName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-mono text-zinc-400 uppercase flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" /> Quantidade
                </p>
                <p className="text-xs font-bold uppercase">{intent.quantity} {intent.size ? `(Tam: ${intent.size})` : ''}</p>
              </div>
            </div>

            <div className="bg-zinc-50 p-4 border border-zinc-100 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Status Inicial</p>
                <p className="text-sm font-black text-industrial-gold uppercase tracking-wider">Intenção registrada</p>
              </div>
              <div className="w-12 h-12 bg-zinc-200/50 flex items-center justify-center rounded-full text-zinc-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-industrial-red/5 p-4 border border-industrial-red/10 rounded-sm">
               <p className="text-[9px] font-black text-industrial-red uppercase tracking-widest leading-relaxed">
                 A compra será confirmada após atingir o mínimo coletivo. Você será notificado via e-mail e telefone para os próximos passos.
               </p>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              className="flex-1 border-2 border-zinc-200 p-3 text-xs font-black uppercase tracking-widest hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <button className="border-2 border-zinc-200 p-3 px-4 hover:bg-zinc-50 transition-all">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full bg-zinc-950 text-white p-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all active:scale-[0.98]"
          >
            Concluído
          </button>
        </div>

        {/* Security Footer */}
        <div className="bg-zinc-100 p-3 text-center border-t border-zinc-200">
           <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Autenticado Via Córtex - PMMG // ID: {intent.id.slice(0, 12)}</p>
        </div>
      </motion.div>
    </div>
  );
}
