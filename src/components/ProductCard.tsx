import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Users, ChevronRight, Timer, Package, Edit, Trash2, Power, PowerOff, Image as ImageIcon } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  onInterest: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onToggleStatus?: (product: Product) => void;
  onChangePhoto?: (product: Product, file: File) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isAdmin,
  onInterest,
  onEdit,
  onDelete,
  onToggleStatus,
  onChangePhoto 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progress = Math.min((product.currentInterests / product.minBatch) * 100, 100);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onChangePhoto) {
      onChangePhoto(product, file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className={`bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden group flex flex-col h-full hover:border-industrial-red/50 transition-all duration-300 shadow-2xl ${product.status === 'inativo' ? 'opacity-60 grayscale' : ''}`}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-zinc-950">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
        />

        {/* Admin Controls */}
        {isAdmin && (
          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm z-20">
            <button onClick={(e) => { e.stopPropagation(); onEdit?.(product); }} className="p-3 bg-industrial-gold text-black rounded-lg hover:scale-110 transition-transform shadow-lg" title="Editar">
              <Edit className="w-5 h-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="p-3 bg-blue-500 text-white rounded-lg hover:scale-110 transition-transform shadow-lg" title="Trocar Foto">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onToggleStatus?.(product); }} className={`p-3 ${product.status === 'inativo' ? 'bg-green-500' : 'bg-gray-500'} text-white rounded-lg hover:scale-110 transition-transform shadow-lg`} title={product.status === 'inativo' ? 'Ativar' : 'Inativar'}>
              {product.status === 'inativo' ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete?.(product); }} className="p-3 bg-industrial-red text-white rounded-lg hover:scale-110 transition-transform shadow-lg" title="Excluir">
              <Trash2 className="w-5 h-5" />
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handlePhotoChange} />
          </div>
        )}
        
        {/* Status Overlays */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <span className="bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase text-white tracking-widest shadow-lg">
              {product.category}
            </span>
            {product.status && (
              <span className="bg-industrial-red/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg self-start">
                {product.status}
              </span>
            )}
          </div>
        </div>

        {/* Floating Interest Badge */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-2 rounded-xl flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-5 h-5 rounded-full border border-zinc-900 bg-zinc-700 overflow-hidden">
                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="avatar" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white leading-none">+{product.currentInterests}</span>
            <span className="text-[7px] text-zinc-400 font-mono uppercase tracking-tighter">Interessados</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-3 h-3 text-industrial-gold" />
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{product.supplierId}</p>
            </div>
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none group-hover:text-industrial-red transition-colors mb-2">
            {product.name}
          </h3>
          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Campaign Analytics */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2 text-zinc-500">
              <Timer className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Coleta de Demanda</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-white">{Math.round(progress)}%</span>
            </div>
          </div>
          
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`h-full rounded-full ${
                progress >= 100 ? 'bg-green-500' : 
                progress >= 75 ? 'bg-industrial-gold' : 
                'bg-industrial-red'
              }`}
            />
          </div>
          
          <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-zinc-500">
            <span>Mínimo: {product.minBatch} un</span>
            <span className={progress >= 100 ? 'text-green-500' : 'text-industrial-gold'}>
              {progress >= 100 ? 'Lote Pronto' : `${product.minBatch - product.currentInterests} Restantes`}
            </span>
          </div>
        </div>

        {/* Action Call */}
        <button 
          onClick={() => onInterest(product)}
          className="w-full bg-white text-black py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-industrial-red hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn active:scale-95 shadow-xl"
        >
          TENHO INTERESSE
          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
