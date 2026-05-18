import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Package, 
  Factory, 
  ListChecks, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MENU_ITEMS } from '../constants';

interface SidebarProps {
  activeView: string;
  onViewChange: (viewId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Package: <Package className="w-5 h-5" />,
  Factory: <Factory className="w-5 h-5" />,
  ListChecks: <ListChecks className="w-5 h-5" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5" />
};

export default function Sidebar({ activeView, onViewChange, isOpen, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const profile = user?.profile;
  const isAdmin = profile?.role === 'administrador';

  const menuItemsByRole = isAdmin
    ? [
        { 
          id: 'products', 
          label: 'Gestão de Produtos', 
          icon: 'Package' 
        },
        { 
          id: 'suppliers', 
          label: 'Gestão de Fornecedores', 
          icon: 'Factory' 
        },
        { 
          id: 'collective-list', 
          label: 'Consolidação de Lotes', 
          icon: 'ListChecks' 
        },
        { 
          id: 'admin', 
          label: 'Painel Estratégico', 
          icon: 'ShieldAlert'
        }
      ]
    : [
        { 
          id: 'products', 
          label: 'Gestão de Produtos', 
          icon: 'Package' 
        },
        { 
          id: 'suppliers', 
          label: 'Gestão de Fornecedores', 
          icon: 'Factory' 
        },
        { 
          id: 'campaigns', 
          label: 'Campanhas', 
          icon: 'ListChecks'
        }
      ];

  const visibleMenuItems = menuItemsByRole;

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-[60] bg-industrial-surface border border-industrial-outline p-2.5 rounded shadow-xl metallic-border"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
          onClick={onToggle}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-full w-72 bg-industrial-bg border-r border-industrial-outline z-[55] transition-transform duration-300 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="p-8 border-b border-industrial-outline relative overflow-hidden bg-black/20">
          <div className="absolute top-0 left-0 w-1 h-full bg-industrial-red"></div>
          <div className="flex items-center">
             <h1 className="text-sm font-black text-white uppercase leading-none tracking-[0.25em] text-center w-full">Gestor de Compra Coletiva</h1>
          </div>
        </div>

        {/* User Card */}
        <div className="p-6 border-b border-industrial-outline/50 bg-black/40">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full border border-industrial-red/50 bg-zinc-900 flex items-center justify-center overflow-hidden">
                <UserIcon className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{user ? (profile?.pmNumber || 'PMMG-XXX') : 'ID: VISITANTE'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                   <h3 className="text-xs font-black text-white uppercase truncate">{user ? (profile?.fullName.split(' ')[0] || 'MILITAR') : 'MODO CONSULTA'}</h3>
                   {user && (
                     <span className={`text-[7px] px-1 border ${isAdmin ? 'border-industrial-red text-industrial-red bg-industrial-red/10' : 'border-industrial-gold text-industrial-gold bg-industrial-gold/10'} font-black uppercase`}>
                       {isAdmin ? 'ADMIN' : 'OPERACIONAL'}
                     </span>
                   )}
                </div>
              </div>
           </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          <div className="px-4 mb-4">
             <p className="text-[8px] font-mono text-gray-600 uppercase tracking-[0.3em]">Módulos Operacionais</p>
          </div>
          {visibleMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                if (window.innerWidth < 1024) onToggle();
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all group relative overflow-hidden
                ${activeView === item.id 
                  ? 'text-white' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
              `}
            >
              {activeView === item.id && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-industrial-red/10 border-l-2 border-industrial-red -z-10"
                />
              )}
              <div className={`transition-colors ${activeView === item.id ? 'text-industrial-red' : 'text-gray-600 group-hover:text-industrial-red/50'}`}>
                {ICON_MAP[item.icon]}
              </div>
              <span className="flex-1 text-left font-mono">{item.label}</span>
              <ChevronRight className={`w-3 h-3 transition-transform ${activeView === item.id ? 'opacity-100' : 'opacity-0 -translate-x-2'}`} />
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-industrial-outline flex flex-col gap-2">
           <button 
             onClick={() => onViewChange('profile')}
             className="flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase text-gray-600 hover:text-white transition-all tracking-[0.2em] group"
           >
              <UserIcon className="w-4 h-4 group-hover:text-industrial-gold transition-colors" />
              {user ? 'Perfil do Militar' : 'Fazer Cadastro'}
           </button>
           {user ? (
             <button 
               onClick={logout}
               className="flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase text-gray-600 hover:text-industrial-red transition-all tracking-[0.2em] group border border-transparent hover:border-industrial-red/20"
             >
                <LogOut className="w-4 h-4 group-hover:animate-pulse" />
                Sair do Sistema
             </button>
           ) : (
             <button 
               onClick={() => onViewChange('login')}
               className="flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase text-gray-600 hover:text-industrial-red transition-all tracking-[0.2em] group border border-transparent hover:border-industrial-red/20"
             >
                <LogOut className="w-4 h-4 group-hover:animate-pulse" />
                Entrar / Login
             </button>
           )}
        </div>
      </aside>
    </>
  );
}
