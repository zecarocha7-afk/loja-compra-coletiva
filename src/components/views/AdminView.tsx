import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  Users, 
  Package,
  Edit2,
  X,
  Save,
  Trash2
} from 'lucide-react';
import { firebaseService } from '../../services/firebaseService';
import { PurchaseIntent, Product } from '../../types';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../../constants';

export default function AdminView() {
  const [intents, setIntents] = useState<PurchaseIntent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Seed and listen to products
    firebaseService.seedProducts(DEFAULT_PRODUCTS);
    
    const unsubIntents = firebaseService.onAllIntentsChange((data) => {
      setIntents(data);
    });

    const unsubProducts = firebaseService.onProductsChange((data) => {
      setProducts(data);
      setLoading(false);
    });

    const unsubUsers = firebaseService.onUsersChange((data) => {
      setUsersCount(data.length);
    });

    return () => {
      unsubIntents();
      unsubProducts();
      unsubUsers();
    };
  }, []);

  // Consolidation Logic
  const consolidated = intents.reduce((acc: any, intent) => {
    const key = `${intent.productId}-${intent.size || 'default'}-${intent.color || 'default'}`;
    if (!acc[key]) {
      acc[key] = {
        productId: intent.productId,
        productName: intent.productName,
        vendorId: intent.vendorId,
        size: intent.size,
        color: intent.color,
        totalQuantity: 0,
        requestors: 0
      };
    }
    acc[key].totalQuantity += intent.quantity;
    acc[key].requestors += 1;
    return acc;
  }, {});

  const consolidatedList = Object.values(consolidated);

  const globalGoal = products.length > 0 ? (consolidatedList.length / products.length) * 100 : 0;

  const exportReport = () => {
    const headers = ['Produto', 'Fabricante', 'Grade/Cor', 'Qtd Total', 'Preço Unitário Atacado', 'Total Lote', 'Interessados'];
    const rows = consolidatedList.map((item: any) => {
      const product = products.find(p => p.id === item.productId) || products.find(p => p.name === item.productName);
      const price = product?.price || 0;
      return [
        item.productName,
        item.vendorId,
        `${item.size || '---'} / ${item.color || '---'}`,
        item.totalQuantity.toString(),
        `R$ ${price.toFixed(2)}`,
        `R$ ${(price * item.totalQuantity).toFixed(2)}`,
        item.requestors.toString()
      ];
    });
    
    const csvContent = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `RELATORIO_CONSOLIDADO_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDetailedList = () => {
    const headers = ['Protocolo', 'Data', 'Nome', 'Matrícula', 'Unidade', 'Cidade', 'Telefone', 'E-mail', 'Produto', 'Qtd', 'Tamanho/Cor', 'Status'];
    const rows = intents.map(intent => [
      intent.protocol,
      new Date(intent.createdAt.seconds * 1000).toLocaleString(),
      intent.fullName,
      intent.pmNumber,
      intent.unit,
      intent.city,
      intent.phone,
      intent.email,
      intent.productName,
      intent.quantity.toString(),
      `${intent.size || '---'} / ${intent.color || '---'}`,
      intent.status
    ]);

    const csvContent = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LISTA_INTERESSADOS_DETALHADA_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatus = (item: any) => {
    const product = products.find(p => p.id === item.productId) || products.find(p => p.name === item.productName);
    if (!product) return { label: 'Desconhecido', color: 'text-gray-500' };
    
    const progress = (item.totalQuantity / product.minBatch) * 100;
    if (progress >= 100) return { label: 'META ATINGIDA', color: 'text-green-500' };
    if (progress >= 70) return { label: 'ALTA DEMANDA', color: 'text-industrial-gold' };
    return { label: 'EM PROGRESSO', color: 'text-blue-400' };
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    try {
      await firebaseService.updateProduct(editingProduct.id, editingProduct);
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar produto');
    }
  };

  if (loading) return (
    <div className="p-10 text-center animate-pulse text-gray-500 font-mono uppercase tracking-widest">
      Carregando Dados...
    </div>
  );

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
             <div className="w-2 h-8 bg-industrial-gold"></div>
             Gestão de Compras Coletivas
          </h2>
          <p className="text-[11px] font-mono text-gray-500 uppercase tracking-tighter mt-1">Sincronização de Interesses e Consolidação de Lotes</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={exportDetailedList}
            className="bg-zinc-800 text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all border border-industrial-outline flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Lista de Interessados (Detalhada)
          </button>
          <button 
            onClick={exportReport}
            className="bg-industrial-gold text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Relatório de Consolidação
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Efetivo no Sistema', value: usersCount + 1, icon: Users, color: 'text-blue-400' },
          { label: 'Intenções Ativas', value: intents.length, icon: FileSpreadsheet, color: 'text-industrial-red' },
          { label: 'Materiais em Campanha', value: consolidatedList.length, icon: Package, color: 'text-industrial-gold' },
          { label: 'Otimização Lotes', value: `${Math.round(globalGoal)}%`, icon: BarChart3, color: 'text-green-500' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-industrial-surface border border-industrial-outline p-4 metallic-border hover:border-white/20 transition-colors"
          >
             <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-2">{stat.label}</p>
             <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-white tracking-widest">{stat.value}</span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
             </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-industrial-surface border border-industrial-outline metallic-border overflow-hidden mb-8">
        <div className="p-4 border-b border-industrial-outline bg-black/40">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-industrial-gold" />
              Tabela de Consolidação Operacional
            </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-industrial-outline bg-black/20">
                <th className="p-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Produto</th>
                <th className="p-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Fabricante</th>
                <th className="p-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest text-center">Membros</th>
                <th className="p-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest text-right">Qtd Total</th>
                <th className="p-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest text-right">Progresso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-outline/50">
              {consolidatedList.map((item: any, idx) => {
                const status = getStatus(item);
                const product = products.find(p => p.id === item.productId) || products.find(p => p.name === item.productName);
                const progress = product ? Math.min(100, (item.totalQuantity / product.minBatch) * 100) : 0;
                
                return (
                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{item.productName}</span>
                        <span className="text-[9px] font-mono text-gray-600 uppercase mt-1">Grade: {item.size || 'Unica'}</span>
                      </div>
                  </td>
                  <td className="p-4">
                      <span className="text-[10px] font-mono text-gray-400 uppercase">{item.vendorId}</span>
                  </td>
                  <td className="p-4 text-center">
                      <span className="text-xs font-black text-white">{item.requestors}</span>
                  </td>
                  <td className="p-4 text-right">
                      <span className="text-sm font-black text-industrial-red">{item.totalQuantity}</span>
                  </td>
                  <td className="p-4 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <div className={`text-[9px] font-black uppercase tracking-widest ${status.color}`}>
                            {Math.round(progress)}%
                        </div>
                        <div className="w-24 h-1 bg-black/50 overflow-hidden border border-industrial-outline/30">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              className={`h-full ${progress >= 100 ? 'bg-green-500' : progress >= 70 ? 'bg-industrial-gold' : 'bg-blue-400'}`}
                            />
                        </div>
                      </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products Catalog - Management */}
      <div className="bg-industrial-surface border border-industrial-outline metallic-border overflow-hidden">
        <div className="p-4 border-b border-industrial-outline bg-black/40">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Package className="w-4 h-4 text-industrial-red" />
              Catálogo de Produtos (Edição de Metas e Preços)
            </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-industrial-outline bg-black/20">
                <th className="p-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Material</th>
                <th className="p-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Preço Un.</th>
                <th className="p-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Meta Lote</th>
                <th className="p-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-outline/50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{product.name}</span>
                      <span className="text-[9px] font-mono text-gray-600 uppercase mt-0.5">{product.vendorId}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-mono text-white">R$ {product.price.toFixed(2)}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-mono text-industrial-gold">{product.minBatch} un</span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setEditingProduct(product)}
                      className="p-2 text-gray-500 hover:text-industrial-gold transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-industrial-bg border border-industrial-outline w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-industrial-outline bg-industrial-surface flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Editar Detalhes do Produto</h3>
              <button onClick={() => setEditingProduct(null)}>
                <X className="w-5 h-5 text-gray-500 hover:text-white" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProduct} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1.5">Nome do Produto</label>
                  <input 
                    type="text"
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full bg-black/40 border border-industrial-outline p-3 text-sm text-white focus:border-industrial-gold outline-none transition-colors font-bold"
                  />
                </div>
                
                <div>
                  <label className="block text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1.5">Descrição Operacional</label>
                  <textarea 
                    value={editingProduct.description}
                    onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                    rows={3}
                    className="w-full bg-black/40 border border-industrial-outline p-3 text-xs text-white focus:border-industrial-gold outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1.5">Preço Unitário (R$)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                      className="w-full bg-black/40 border border-industrial-outline p-3 text-sm text-white focus:border-industrial-gold outline-none transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1.5">Meta Mínima (Unidades)</label>
                    <input 
                      type="number"
                      value={editingProduct.minBatch}
                      onChange={e => setEditingProduct({...editingProduct, minBatch: parseInt(e.target.value)})}
                      className="w-full bg-black/40 border border-industrial-outline p-3 text-sm text-white focus:border-industrial-gold outline-none transition-colors font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1.5">Status/Tag</label>
                  <input 
                    type="text"
                    value={editingProduct.status}
                    onChange={e => setEditingProduct({...editingProduct, status: e.target.value})}
                    className="w-full bg-black/40 border border-industrial-outline p-3 text-[10px] text-industrial-gold focus:border-industrial-gold outline-none transition-colors font-black uppercase tracking-widest"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 border border-industrial-outline p-4 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-industrial-gold text-white p-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
