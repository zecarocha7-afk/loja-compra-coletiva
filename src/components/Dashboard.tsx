import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import ProductsView from './views/ProductsView';
import SuppliersView from './views/SuppliersView';
import CollectiveListView from './views/CollectiveListView';
import AdminView from './views/AdminView';
import Login from './Login';
import { firebaseService } from '../services/firebaseService';
import { Product } from '../types';
import { X, Bell, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.profile?.role === 'administrador';
  const [activeView, setActiveView] = useState('products');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<{ id: string; message: string; type: string }[]>([]);

  useEffect(() => {
    const unsubProducts = firebaseService.onProductsChange((data) => {
      setProducts(data);
    });
    return () => unsubProducts();
  }, []);

  useEffect(() => {
    if (!isAdmin || products.length === 0) return;

    const unsubscribe = firebaseService.onAllIntentsChange((intents) => {
      const consolidated: Record<string, number> = {};
      intents.forEach(intent => {
        consolidated[intent.productId] = (consolidated[intent.productId] || 0) + intent.quantity;
      });

      const readyProducts = products.filter(p => consolidated[p.id] >= p.minBatch);
      
      if (readyProducts.length > 0) {
        const newAlerts = readyProducts.map(p => ({
          id: p.id,
          message: `LOTE PRONTO: ${p.name.toUpperCase()} atingiu a meta de compras!`,
          type: 'success'
        }));
        setAlerts(newAlerts);
      } else {
        setAlerts([]);
      }
    });

    return () => unsubscribe();
  }, [isAdmin, products]);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const renderView = () => {
    switch (activeView) {
      case 'products':
        return <ProductsView user={user} initialFilterMode="individual" />;
      case 'campaigns':
        return <ProductsView user={user} initialFilterMode="collective" />;
      case 'suppliers':
        return <SuppliersView user={user} />;
      case 'collective-list':
        return <CollectiveListView user={user} />;
      case 'admin':
        return <AdminView />;
      case 'login':
      case 'profile':
        return (
          <div className="flex items-center justify-center py-10">
            <Login isNested />
          </div>
        );
      default:
        return <ProductsView user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-industrial-bg text-gray-200 flex">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="flex-1 lg:ml-72 min-h-screen relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 topo-bg opacity-10 pointer-events-none"></div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="pt-6 lg:pt-2">
                  {renderView()}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Info HUD */}
        <div className="fixed bottom-4 right-10 z-[45] hidden lg:flex items-center gap-6 bg-black/60 backdrop-blur-md border border-industrial-outline p-2 px-6 text-[8px] font-mono text-gray-600 uppercase tracking-[0.2em]">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-industrial-red animate-pulse"></div>
              CONECTADO
           </div>
           <div className="flex items-center gap-2">
              PMMG.CONEXAO_SEGURA
           </div>
        </div>
      </main>
    </div>
  );
}
