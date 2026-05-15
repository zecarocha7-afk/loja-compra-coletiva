import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Upload, Building2, FileText, Phone, Mail, MapPin, Check, Image as ImageIcon } from 'lucide-react';
import { Supplier } from '../types';
import { firebaseService } from '../services/firebaseService';

interface SupplierFormModalProps {
  supplier?: Supplier | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SupplierFormModal({ supplier, onClose, onSuccess }: SupplierFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const catalogInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    document: supplier?.document || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    cityState: supplier?.cityState || '',
    description: supplier?.description || '',
    logo: supplier?.logo || '',
    catalogUrl: supplier?.catalogUrl || '',
    status: supplier?.status || 'ativo',
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCatalogChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, catalogUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.document || !formData.phone || !formData.email) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      if (supplier?.id) {
        await firebaseService.updateSupplier(supplier.id, formData);
      } else {
        await firebaseService.createSupplier(formData);
      }
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      alert('Ocorreu um erro ao salvar o fornecedor.');
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
                  {supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                </h2>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">
                  Gestão de Fornecedores - ADMIN
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
                <span className="text-sm font-black uppercase tracking-widest">Fornecedor salvo com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Logo Section */}
                <div className="flex flex-col items-center justify-center p-6 border border-dashed border-industrial-outline/50 bg-black/20 rounded-xl relative overflow-hidden group w-full md:w-1/3">
                  {formData.logo ? (
                    <div className="relative w-32 h-32 group">
                      <img src={formData.logo} alt="Logo" className="w-full h-full object-contain rounded-xl border border-white/10 bg-white" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-sm">
                        <button type="button" onClick={() => logoInputRef.current?.click()} className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <Upload className="w-4 h-4" /> Trocar Logo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-industrial-outline/20 rounded-full flex items-center justify-center mx-auto text-industrial-gold">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Logomarca</p>
                      <button type="button" onClick={() => logoInputRef.current?.click()} className="px-4 py-2 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors rounded-lg flex items-center justify-center gap-2 mx-auto">
                        <Upload className="w-3 h-3" /> Adicionar
                      </button>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={logoInputRef}
                    className="hidden" 
                    onChange={handleLogoChange}
                  />
                </div>

                {/* Main Fields */}
                <div className="space-y-4 w-full md:w-2/3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Nome do Fornecedor *</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-gold outline-none text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">CNPJ / CPF *</label>
                      <input 
                        required
                        value={formData.document}
                        onChange={e => setFormData({...formData, document: e.target.value})}
                        className="w-full bg-black/40 border border-industrial-outline p-2.5 text-xs focus:border-industrial-gold outline-none text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Telefone/WhatsApp *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input 
                          required
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-gold outline-none text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">E-mail *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input 
                          type="email"
                          required
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-gold outline-none text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Cidade / UF *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input 
                          required
                          value={formData.cityState}
                          onChange={e => setFormData({...formData, cityState: e.target.value})}
                          className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-gold outline-none text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Descrição</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-black/40 border border-industrial-outline p-2.5 text-xs focus:border-industrial-gold outline-none text-white min-h-[5rem] custom-scrollbar"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6 items-end">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Catálogo (PDF ou Imagem)</label>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button" 
                        onClick={() => catalogInputRef.current?.click()} 
                        className="px-4 py-2.5 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" /> 
                        {formData.catalogUrl ? 'Substituir Catálogo' : 'Carregar Catálogo'}
                      </button>
                      {formData.catalogUrl && (
                        <span className="text-[10px] text-green-500 font-mono uppercase tracking-widest flex items-center gap-1">
                          <Check className="w-3 h-3" /> Anexado
                        </span>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="application/pdf,image/png,image/jpeg,image/webp" 
                      ref={catalogInputRef}
                      className="hidden" 
                      onChange={handleCatalogChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Status *</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as 'ativo' | 'inativo'})}
                      className="w-full bg-black/40 border border-industrial-outline p-2.5 text-xs text-white focus:border-industrial-gold outline-none appearance-none cursor-pointer"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
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
                  {loading ? 'SALVANDO...' : 'SALVAR FORNECEDOR'}
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
