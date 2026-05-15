import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Camera, Upload, Box, Tag, DollarSign, Building2, Package, Check, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { firebaseService } from '../services/firebaseService';

interface ProductFormModalProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductFormModal({ product, onClose, onSuccess }: ProductFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || '',
    supplierId: product?.supplierId || '',
    description: product?.description || '',
    minBatch: product?.minBatch || 10,
    currentInterests: product?.currentInterests || 0,
    price: product?.price || 0,
    status: product?.status || 'ativo',
    highlight: product?.highlight || false,
    image: product?.image || '',
    campaignId: product?.campaignId || '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.supplierId || !formData.image) {
      alert('Preencha os campos obrigatórios e adicione uma imagem.');
      return;
    }

    setLoading(true);
    try {
      if (product?.id) {
        await firebaseService.updateProduct(product.id, formData);
      } else {
        await firebaseService.createProduct(formData);
      }
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Ocorreu um erro ao salvar o produto.');
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
          className="relative w-full max-w-3xl bg-industrial-surface border border-industrial-outline shadow-2xl overflow-hidden metallic-border flex flex-col max-h-full"
        >
          {/* Header */}
          <div className="bg-industrial-bg/50 border-b border-industrial-outline p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-industrial-gold"></div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">
                  {product ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">
                  Módulo Administrativo
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar">
            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 flex items-center gap-3 text-green-500">
                <Check className="w-5 h-5" />
                <span className="text-sm font-black uppercase tracking-widest">Produto salvo com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Section */}
              <div className="flex flex-col items-center justify-center p-6 border border-dashed border-industrial-outline/50 bg-black/20 rounded-xl relative overflow-hidden group">
                {formData.image ? (
                  <div className="relative w-40 h-40 group">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover rounded-xl border border-white/10" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-sm">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Trocar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-industrial-outline/20 rounded-full flex items-center justify-center mx-auto text-industrial-gold">
                      <Camera className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Nenhuma imagem selecionada *</p>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-6 py-2 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors rounded-lg flex items-center justify-center gap-2 mx-auto">
                      <Upload className="w-3 h-3" /> Fazer Upload ou Tirar Foto
                    </button>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  ref={fileInputRef}
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Nome do Produto *</label>
                    <div className="relative">
                      <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-gold outline-none text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Categoria *</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input 
                        required
                        placeholder="Ex: FARDAMENTO, ACESSÓRIOS"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-gold outline-none text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Fornecedor *</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input 
                        required
                        value={formData.supplierId}
                        onChange={e => setFormData({...formData, supplierId: e.target.value})}
                        className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-gold outline-none text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Descrição</label>
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-black/40 border border-industrial-outline p-2.5 text-xs focus:border-industrial-gold outline-none text-white min-h-[5rem] custom-scrollbar"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Qtd. Mínima (Lote) *</label>
                      <div className="relative">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input 
                          type="number"
                          required
                          min="1"
                          value={formData.minBatch}
                          onChange={e => setFormData({...formData, minBatch: parseInt(e.target.value) || 0})}
                          className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-gold outline-none text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Interessados (Atual)</label>
                      <input 
                        type="number"
                        min="0"
                        value={formData.currentInterests}
                        onChange={e => setFormData({...formData, currentInterests: parseInt(e.target.value) || 0})}
                        className="w-full bg-black/40 border border-industrial-outline p-2.5 px-3 text-xs focus:border-industrial-gold outline-none text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Preço Estimado (R$)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                        className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-gold outline-none text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-industrial-outline/30 mt-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Status *</label>
                      <select 
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        className="w-full bg-black/40 border border-industrial-outline p-2.5 text-xs text-white focus:border-industrial-gold outline-none appearance-none cursor-pointer"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </div>

                    <div className="space-y-1 flex flex-col justify-end">
                      <label className="flex items-center gap-2 cursor-pointer h-[38px] px-3 border border-industrial-outline bg-black/40 hover:bg-white/5 transition-colors">
                        <input 
                          type="checkbox"
                          checked={formData.highlight}
                          onChange={e => setFormData({...formData, highlight: e.target.checked})}
                          className="accent-industrial-gold w-4 h-4"
                        />
                        <span className="text-[10px] font-black uppercase text-white tracking-widest">Destaque</span>
                      </label>
                    </div>
                  </div>
                  
                </div>
              </div>

              <div className="pt-6 border-t border-industrial-outline flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-industrial-gold text-black py-3 px-8 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-yellow-500 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'SALVANDO...' : 'SALVAR PRODUTO'}
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
