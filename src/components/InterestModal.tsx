import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, ShieldCheck, Mail, Phone, MapPin, User, Hash, Box, ClipboardList } from 'lucide-react';
import { Product, PurchaseIntent, User as AppUser } from '../types';
import { firebaseService } from '../services/firebaseService';

interface InterestModalProps {
  product: Product;
  user: AppUser | null;
  onClose: () => void;
  onSuccess: (intent: PurchaseIntent) => void;
}

export default function InterestModal({ product, user, onClose, onSuccess }: InterestModalProps) {
  const profile = user?.profile;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    pmNumber: profile?.pmNumber || '',
    unit: profile?.unit || '',
    city: profile?.city || '',
    phone: profile?.phone || '',
    email: user?.email || profile?.email || '',
    quantity: 1,
    size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : '',
    color: product.colors && product.colors.length > 0 ? product.colors[0] : '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const intentData = {
        userId: user?.uid || 'guest-' + Date.now(),
        productId: product.id,
        productName: product.name,
        supplierId: product.supplierId,
        ...formData,
        status: 'Registrado' as const,
      };
      
      const intent = await firebaseService.createPurchaseIntent(intentData);
      onSuccess(intent);
    } catch (error) {
      console.error("Error submitting interest:", error);
      alert("Falha ao registrar interesse. Verifique sua conexão tática.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-industrial-surface border border-industrial-outline shadow-2xl overflow-hidden metallic-border flex flex-col max-h-full"
        >
          {/* Header */}
          <div className="bg-industrial-bg/50 border-b border-industrial-outline p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-industrial-red"></div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Registro de interesse</h2>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">Manifesto de Demanda Coletiva</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar">
            {/* Product Summary */}
            <div className="flex gap-4 p-3 bg-black/40 border border-industrial-outline/30 mb-6 shrink-0">
              <div className="w-20 h-20 bg-black border border-industrial-outline overflow-hidden flex-shrink-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale opacity-80" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-mono text-industrial-red uppercase">{product.supplierId}</p>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">{product.name}</h3>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Valor final será informado após o fechamento do lote coletivo.</p>
              </div>
              <div className="text-right min-w-[120px] hidden sm:block">
                 <p className="text-[9px] font-mono text-zinc-500 uppercase">Status do Lote</p>
                 <p className="text-xs font-black text-industrial-gold uppercase">Em Coleta de Intenções</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Identification */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono text-industrial-gold uppercase tracking-[0.2em] border-b border-industrial-outline/30 pb-2">Informações do Interessado</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Nome Completo *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input 
                        required
                        placeholder="Nome Completo"
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-red transition-all outline-none text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Matrícula/PM *</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input 
                          required
                          placeholder="000.000-0"
                          value={formData.pmNumber}
                          onChange={e => setFormData({...formData, pmNumber: e.target.value})}
                          className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-red outline-none text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Unidade *</label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input 
                          required
                          placeholder="Ex: 5º BPM"
                          value={formData.unit}
                          onChange={e => setFormData({...formData, unit: e.target.value})}
                          className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-red outline-none text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Telefone *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input 
                          required
                          placeholder="(31) 99999-9999"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-red outline-none text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Cidade *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input 
                          required
                          placeholder="Cidade de Atuação"
                          value={formData.city}
                          onChange={e => setFormData({...formData, city: e.target.value})}
                          className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-red outline-none text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono text-industrial-gold uppercase tracking-[0.2em] border-b border-industrial-outline/30 pb-2">Detalhes do Pedido</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Quantidade *</label>
                      <div className="relative">
                        <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input 
                          type="number"
                          min="1"
                          required
                          value={formData.quantity}
                          onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                          className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-red outline-none text-white"
                        />
                      </div>
                    </div>
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Tamanho / Grade</label>
                        <select 
                          value={formData.size}
                          onChange={e => setFormData({...formData, size: e.target.value})}
                          className="w-full bg-black/40 border border-industrial-outline p-2.5 text-xs text-white focus:border-industrial-red outline-none appearance-none cursor-pointer"
                        >
                          {product.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                  {product.colors && product.colors.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Cor Selecionada</label>
                      <select 
                        value={formData.color}
                        onChange={e => setFormData({...formData, color: e.target.value})}
                        className="w-full bg-black/40 border border-industrial-outline p-2.5 text-xs text-white focus:border-industrial-red outline-none appearance-none cursor-pointer"
                      >
                        {product.colors.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">E-mail Operacional *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input 
                        type="email"
                        required
                        placeholder="email@pmmg.gov.br"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-red outline-none text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Observações Externas</label>
                    <div className="relative">
                      <ClipboardList className="absolute left-3 top-3 w-4 h-4 text-gray-600" />
                      <textarea 
                        placeholder="Ex: Reforço extra no solado..."
                        value={formData.notes}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                        className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-red min-h-[5.5rem] outline-none text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 text-[8px] font-mono text-gray-500 uppercase leading-relaxed text-center md:text-left">
                  Ao registrar, sua demanda será consolidada para viabilizar o lote coletivo. 
                  O valor final e as instruções de pagamento serão enviados após atingir o quórum mínimo.
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto bg-industrial-red text-white py-4 px-10 text-xs font-black uppercase tracking-[0.4em] hover:bg-red-600 transition-all flex items-center justify-center gap-3 glow-red disabled:opacity-50"
                >
                  {loading ? 'PROCESSANDO...' : 'REGISTRAR INTERESSE'}
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
