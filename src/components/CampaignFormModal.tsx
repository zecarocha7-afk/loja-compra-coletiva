import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Camera, Upload, Calendar, Edit3, Type, Check } from 'lucide-react';
import { Campaign } from '../types';
import { firebaseService } from '../services/firebaseService';

interface CampaignFormModalProps {
  campaign?: Campaign | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CampaignFormModal({ campaign, onClose, onSuccess }: CampaignFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    banner: campaign?.banner || '',
    deadline: campaign?.deadline || '',
    description: campaign?.description || '',
    status: campaign?.status || 'Ativa',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, banner: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.deadline || !formData.description || !formData.banner) {
      alert('Preencha os campos obrigatórios e adicione uma imagem de banner.');
      return;
    }

    setLoading(true);
    try {
      if (campaign?.id) {
        await firebaseService.updateCampaign(campaign.id, formData as Partial<Campaign>);
      } else {
        await firebaseService.createCampaign(formData as Omit<Campaign, 'id'>);
      }
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar campanha:', error);
      alert('Ocorreu um erro ao salvar a campanha.');
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
                <h2 className="text-sm font-black text-white uppercase tracking-widest">
                  {campaign ? 'Editar Campanha' : 'Nova Campanha Coletiva'}
                </h2>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">
                  Módulo de Planejamento de Lotes
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar">
            {success && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400">
                <Check className="w-5 h-5" />
                <span className="text-sm font-black uppercase tracking-widest">Campanha salva com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Banner Upload Section */}
              <div className="flex flex-col items-center justify-center p-6 border border-dashed border-industrial-outline/50 bg-black/20 rounded-xl relative overflow-hidden group">
                {formData.banner ? (
                  <div className="relative w-full h-44 group">
                    <img src={formData.banner} alt="Preview Banner" className="w-full h-full object-cover rounded-xl border border-white/10 opacity-70 group-hover:opacity-90 transition-opacity" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-sm">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Alterar Banner da Campanha
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3 py-6">
                    <div className="w-16 h-16 bg-industrial-outline/20 rounded-full flex items-center justify-center mx-auto text-industrial-red">
                      <Camera className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Selecione uma imagem de banner *</p>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-6 py-2 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors rounded-lg flex items-center justify-center gap-2 mx-auto">
                      <Upload className="w-3 h-3" /> Fazer Upload da Foto de Capa
                    </button>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Nome da Campanha *</label>
                  <div className="relative">
                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input 
                      required
                      placeholder="EX: CAMPANHA FARDAMENTO 2026"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-red outline-none text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Descrição / Instruções da Campanha *</label>
                  <div className="relative">
                    <Edit3 className="absolute left-3 top-4 w-4 h-4 text-gray-600" />
                    <textarea 
                      required
                      placeholder="Descreva os objetivos do lote coletivo e detalhes de entrega..."
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-red outline-none text-white min-h-[5rem] custom-scrollbar"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Prazo de Encerramento *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input 
                        required
                        placeholder="EX: 31/12/2026 ou 15 dias"
                        value={formData.deadline}
                        onChange={e => setFormData({...formData, deadline: e.target.value})}
                        className="w-full bg-black/40 border border-industrial-outline p-2.5 pl-10 text-xs focus:border-industrial-red outline-none text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-400 uppercase block pl-1">Status Operacional *</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as any})}
                      className="w-full bg-black/40 border border-industrial-outline p-2.5 text-xs text-white focus:border-industrial-red outline-none appearance-none cursor-pointer"
                    >
                      <option value="Ativa" className="bg-zinc-950">Ativa (Em Loteamento)</option>
                      <option value="Em Breve" className="bg-zinc-950">Em Breve (Preparação)</option>
                      <option value="Encerrada" className="bg-zinc-950">Encerrada (Em Produção)</option>
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
                  className="bg-industrial-red text-white py-3 px-8 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'SALVANDO...' : 'SALVAR CAMPANHA'}
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
