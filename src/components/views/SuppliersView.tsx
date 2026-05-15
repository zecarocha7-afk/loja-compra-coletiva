import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Factory, Star, ExternalLink, ShieldCheck, Award, Plus, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { firebaseService } from '../../services/firebaseService';
import { Supplier, User } from '../../types';
import SupplierFormModal from '../SupplierFormModal';

interface SuppliersViewProps {
  user: User | null;
}

export default function SuppliersView({ user }: SuppliersViewProps) {
  const isAdmin = user?.profile?.role === 'administrador';
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.onSuppliersChange((data) => {
      setSuppliers(isAdmin ? data : data.filter(s => s.status !== 'inativo'));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isAdmin]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o fornecedor ${name}?`)) {
      await firebaseService.deleteSupplier(id);
    }
  };

  const handleToggleStatus = async (supplier: Supplier) => {
    const newStatus = supplier.status === 'inativo' ? 'ativo' : 'inativo';
    await firebaseService.updateSupplier(supplier.id, { status: newStatus });
  };

  if (loading) return (
    <div className="p-10 text-center animate-pulse text-zinc-500 font-mono uppercase tracking-widest">
      Sincronizando Fornecedores...
    </div>
  );

  return (
    <div className="p-4 lg:p-8 relative">
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
             <div className="w-2 h-8 bg-industrial-gold"></div>
             Fornecedores
          </h2>
          <p className="text-[11px] font-mono text-gray-500 uppercase tracking-tighter mt-1">
            Gestão e Catálogos de Fornecedores Homologados
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setEditingSupplier(null); setIsFormModalOpen(true); }}
            className="px-6 py-3 bg-industrial-gold text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-yellow-500 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Novo Fornecedor
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map((supplier, index) => (
          <motion.div
            key={supplier.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-industrial-surface border border-industrial-outline metallic-border p-6 group flex gap-6 relative ${supplier.status === 'inativo' ? 'opacity-60 grayscale' : ''}`}
          >
            {/* Admin Controls */}
            {isAdmin && (
              <div className="absolute top-2 right-2 flex items-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingSupplier(supplier); setIsFormModalOpen(true); }} className="p-2 bg-industrial-gold text-black rounded-lg hover:scale-110 transition-transform shadow-lg" title="Editar">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleToggleStatus(supplier)} className={`p-2 ${supplier.status === 'inativo' ? 'bg-green-500' : 'bg-gray-500'} text-white rounded-lg hover:scale-110 transition-transform shadow-lg`} title={supplier.status === 'inativo' ? 'Ativar' : 'Inativar'}>
                  {supplier.status === 'inativo' ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDelete(supplier.id, supplier.name)} className="p-2 bg-industrial-red text-white rounded-lg hover:scale-110 transition-transform shadow-lg" title="Excluir">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="w-24 h-24 bg-white rounded bg-contain bg-center bg-no-repeat p-4 flex-shrink-0 border border-white/10" style={{ backgroundImage: `url(${supplier.logo})` }} />
            
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider group-hover:text-industrial-gold transition-colors">{supplier.name}</h3>
                  {supplier.rating !== undefined && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-industrial-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < Math.floor(supplier.rating!) ? 'fill-current' : 'opacity-30'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-gray-600">{supplier.rating} / 5.0</span>
                    </div>
                  )}
                </div>
                {supplier.status === 'ativo' && (
                  <div className="bg-industrial-gold/10 px-2 py-1 border border-industrial-gold/20 flex items-center gap-1.5 hidden sm:flex">
                     <ShieldCheck className="w-3 h-3 text-industrial-gold" />
                     <span className="text-[9px] font-black text-industrial-gold uppercase">Homologado</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                {supplier.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-industrial-outline/50">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                   <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">{supplier.cityState}</span>
                </div>
                {supplier.catalogUrl && (
                  <a 
                    href={supplier.catalogUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-industrial-red/10 hover:bg-industrial-red text-industrial-red hover:text-white border border-industrial-red/20 hover:border-industrial-red px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 group/link"
                  >
                     VER CATÁLOGO 
                     <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isFormModalOpen && (
          <SupplierFormModal
            supplier={editingSupplier}
            onClose={() => { setIsFormModalOpen(false); setEditingSupplier(null); }}
            onSuccess={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
