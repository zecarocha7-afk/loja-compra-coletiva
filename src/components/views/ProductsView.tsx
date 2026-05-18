import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, Timer, ArrowRight, Edit, Trash2, Plus } from 'lucide-react';
import { firebaseService } from '../../services/firebaseService';
import { Product, PurchaseIntent, User, Campaign } from '../../types';
import { ProductCard } from '../ProductCard';
import InterestModal from '../InterestModal';
import ProtocolReceipt from '../ProtocolReceipt';
import ProductFormModal from '../ProductFormModal';
import CampaignFormModal from '../CampaignFormModal';

interface ProductsViewProps {
  user: User | null;
}

export default function ProductsView({ user }: ProductsViewProps) {
  const [filterMode, setFilterMode] = useState<'collective' | 'individual'>('collective');
  const [search, setSearch] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [receiptIntent, setReceiptIntent] = useState<PurchaseIntent | null>(null);
  
  // Product Form Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Campaign Form Modals
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const isAdmin = user?.profile?.role === 'administrador';

  useEffect(() => {
    let productsUnsubscribe: (() => void) | null = null;
    let campaignsUnsubscribe: (() => void) | null = null;

    productsUnsubscribe = firebaseService.onProductsChange((data) => {
      setProducts(data);
      setLoading(false);
    });

    campaignsUnsubscribe = firebaseService.onCampaignsChange((data) => {
      setCampaigns(data);
    });

    return () => {
      if (productsUnsubscribe) productsUnsubscribe();
      if (campaignsUnsubscribe) campaignsUnsubscribe();
    };
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.vendorId.toLowerCase().includes(search.toLowerCase()) ||
                         p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCampaign = selectedCampaignId ? p.campaignId === selectedCampaignId : true;
    return matchesSearch && matchesCampaign;
  });

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  const handleDeleteProduct = async (p: Product) => {
    if (confirm(`Tem certeza que deseja excluir o produto ${p.name}?`)) {
      await firebaseService.deleteProduct(p.id);
    }
  };

  const handleDeleteCampaign = async (campaign: Campaign) => {
    if (confirm(`Excluir campanha "${campaign.name}"? Os produtos vinculados perderão a associação de lote coletivo.`)) {
      await firebaseService.deleteCampaign(campaign.id);
      if (selectedCampaignId === campaign.id) {
        setSelectedCampaignId(null);
      }
    }
  };

  const handleToggleStatus = async (p: Product) => {
    const newStatus = p.status === 'inativo' ? 'ativo' : 'inativo';
    await firebaseService.updateProduct(p.id, { status: newStatus });
  };

  const handleChangePhoto = (p: Product, file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      await firebaseService.updateProduct(p.id, { image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  if (loading) return (
    <div className="p-10 text-center animate-pulse text-zinc-500 font-mono uppercase tracking-widest">
      Sincronizando Demandas...
    </div>
  );

  return (
    <div className="p-4 lg:p-10 space-y-12">
      {/* Filter Mode Selector */}
      <div className="flex gap-4 p-1 bg-zinc-900 border border-white/5 rounded-2xl w-fit mx-auto lg:mx-0">
        <button 
          onClick={() => setFilterMode('collective')}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterMode === 'collective' ? 'bg-industrial-red text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
        >
          Campanhas Coletivas
        </button>
        <button 
          onClick={() => setFilterMode('individual')}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterMode === 'individual' ? 'bg-industrial-gold text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
        >
          Compras Individuais
        </button>
      </div>

      {/* Campaign Banner / Hero Section */}
      {filterMode === 'collective' && (
        <>
          <section>
        <AnimatePresence mode="wait">
          {!selectedCampaignId ? (
            <motion.div 
              key="general-hero"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 p-8 lg:p-16 flex flex-col items-center text-center gap-6"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2000')] opacity-10 bg-cover bg-center"></div>
              <div className="relative z-10 space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-industrial-red/10 border border-industrial-red/20 text-industrial-red text-[10px] font-black uppercase tracking-[0.2em]">
                  <Sparkles className="w-3 h-3" />
                  Compras Coletivas PMMG
                </div>
                <h1 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tight leading-none">
                  Sua farda com preço de <span className="text-industrial-gold">fábrica</span>.
                </h1>
                <p className="text-zinc-400 text-sm lg:text-lg leading-relaxed">
                  Consolidamos a demanda de todos os militares para garantir lotes de fabricação com condições premium. Escolha sua campanha abaixo.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key={selectedCampaignId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="relative rounded-3xl overflow-hidden min-h-[300px] flex items-center p-8 lg:p-12 border border-white/5"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
                style={{ backgroundImage: `url(${selectedCampaign?.banner})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
              </div>
              
              <div className="relative z-10 max-w-xl space-y-6">
                <div>
                  <button 
                    onClick={() => setSelectedCampaignId(null)}
                    className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors mb-4 flex items-center gap-2"
                  >
                    ← Voltar para todos
                  </button>
                  <h2 className="text-3xl lg:text-5xl font-black text-white uppercase tracking-tight leading-none">
                    {selectedCampaign?.name}
                  </h2>
                </div>
                <p className="text-zinc-300 text-sm lg:text-base leading-relaxed font-mono">
                  {selectedCampaign?.description}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="bg-industrial-red px-4 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Timer className="w-3 h-3" />
                    Encerra em: {selectedCampaign?.deadline}
                  </div>
                  {isAdmin && selectedCampaign && (
                    <button
                      onClick={() => {
                        setEditingCampaign(selectedCampaign);
                        setIsCampaignModalOpen(true);
                      }}
                      className="px-4 py-2 bg-black/60 border border-white/10 hover:border-industrial-gold text-[10px] font-black uppercase text-white hover:text-industrial-gold rounded-full transition-colors flex items-center gap-1.5"
                    >
                      <Edit className="w-3 h-3" /> Editar Campanha
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Campaign Selectors */}
      {!selectedCampaignId && (
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
              <div className="w-1 h-6 bg-industrial-gold"></div>
              Compras Coletivas
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="relative group rounded-2xl overflow-hidden border border-white/5 h-48 bg-zinc-950">
                {/* Admin controls */}
                {isAdmin && (
                  <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCampaign(campaign);
                        setIsCampaignModalOpen(true);
                      }}
                      className="p-2 bg-black/85 border border-white/10 hover:border-industrial-gold rounded-lg text-white hover:text-industrial-gold transition-all"
                      title="Editar Campanha"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCampaign(campaign);
                      }}
                      className="p-2 bg-black/85 border border-white/10 hover:border-industrial-red rounded-lg text-white hover:text-industrial-red transition-all"
                      title="Excluir Campanha"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setSelectedCampaignId(campaign.id)}
                  className="w-full h-full text-left relative block"
                >
                  <img 
                    src={campaign.banner} 
                    alt={campaign.name} 
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute inset-0 p-6 flex flex-col justify-end gap-2">
                    <span className="text-industrial-gold text-[10px] font-black uppercase tracking-[0.2em]">{campaign.status}</span>
                    <div className="flex justify-between items-end">
                      <h4 className="text-xl font-black text-white uppercase tracking-tight">{campaign.name}</h4>
                      <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )}

  {/* Main Catalog */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div>
             <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
              <div className="w-1 h-6 bg-industrial-red"></div>
              {selectedCampaignId ? 'Produtos da Campanha' : 'Todos os Produtos'}
            </h3>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
              {filteredProducts.length} itens disponíveis para interesse coletivo
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {isAdmin && (
              <>
                <button 
                  onClick={() => { setEditingCampaign(null); setIsCampaignModalOpen(true); }}
                  className="w-full sm:w-auto whitespace-nowrap px-6 py-4 bg-industrial-red text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-industrial-red/10 border border-white/5"
                >
                  <Plus className="w-4 h-4" /> Nova Campanha
                </button>
                <button 
                  onClick={() => { setEditingProduct(null); setIsFormModalOpen(true); }}
                  className="w-full sm:w-auto whitespace-nowrap px-6 py-4 bg-industrial-gold text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-yellow-500 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Novo Produto
                </button>
              </>
            )}
            <div className="flex bg-zinc-900 border border-white/5 rounded-xl overflow-hidden items-center w-full max-w-md focus-within:border-industrial-red/50 transition-all">
            <div className="pl-4 text-zinc-600">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="PESQUISAR NO CATÁLOGO..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-white p-4 font-black tracking-widest placeholder:text-zinc-700"
            />
          </div>
        </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              isAdmin={isAdmin}
              onInterest={(p) => setSelectedProduct(p)} 
              onEdit={(p) => { setEditingProduct(p); setIsFormModalOpen(true); }}
              onDelete={handleDeleteProduct}
              onToggleStatus={handleToggleStatus}
              onChangePhoto={handleChangePhoto}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-zinc-700 space-y-6">
             <Search className="w-16 h-16 opacity-10" />
             <div className="text-center">
               <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Nenhum item encontrado</p>
               <p className="text-[10px] text-zinc-600 mt-2">Tente ajustar seus filtros ou termos de pesquisa.</p>
             </div>
             {selectedCampaignId && (
               <button 
                 onClick={() => setSelectedCampaignId(null)}
                 className="px-8 py-3 bg-zinc-800 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all"
               >
                 Ver todos os itens
               </button>
             )}
          </div>
        )}
      </section>

      {/* Modals remain the same */}
      <AnimatePresence>
        {selectedProduct && (
          <InterestModal 
            product={selectedProduct}
            user={user}
            onClose={() => setSelectedProduct(null)}
            onSuccess={(intent) => {
              setSelectedProduct(null);
              setReceiptIntent(intent);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {receiptIntent && (
          <ProtocolReceipt 
            intent={receiptIntent}
            onClose={() => setReceiptIntent(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFormModalOpen && (
          <ProductFormModal
            product={editingProduct}
            onClose={() => { setIsFormModalOpen(false); setEditingProduct(null); }}
            onSuccess={() => {}}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCampaignModalOpen && (
          <CampaignFormModal
            campaign={editingCampaign}
            onClose={() => { setIsCampaignModalOpen(false); setEditingCampaign(null); }}
            onSuccess={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
