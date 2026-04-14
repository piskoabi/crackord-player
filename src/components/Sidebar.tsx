'use client';

import React from 'react';
import { 
  Home, 
  Tv, 
  Film, 
  PlayCircle, 
  Heart, 
  LogOut, 
  X,
  LayoutGrid
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  activeCategory: string;
  onCategorySelect: (category: string) => void;
  categories: string[];
  mode: 'm3u' | 'xtream' | null;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isPlaybackActive?: boolean;
}

const mainItems = [
  { id: 'all', label: 'Library', icon: LayoutGrid },
  { id: 'favorites', label: 'Favorites', icon: Heart },
];

export const Sidebar: React.FC<SidebarProps> = React.memo(({ 
  activeCategory, 
  onCategorySelect, 
  categories, 
  onLogout, 
  isOpen, 
  onClose,
  isPlaybackActive
}) => {
  return (
    <>
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-xl z-[60] md:hidden transition-all duration-700 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      
      <aside className={`fixed md:relative top-0 left-0 h-screen w-[280px] z-[70] flex flex-col transition-all duration-700 ease-out-expo p-4 md:p-6 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex-1 flex flex-col glass rounded-[2.5rem] border border-white/10 overflow-hidden relative">
          {/* Animated Background Decoration inside Sidebar */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          
          <div className="p-8 flex flex-col gap-10 relative z-10">
            <div className="flex items-center justify-between md:hidden">
              <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Perfect Circular Meditative Logo Orb */}
            <motion.div 
              animate={isPlaybackActive ? { opacity: 1, scale: 1, filter: 'drop-shadow(0 0 20px rgba(0, 242, 254, 0.4))' } : { 
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.05, 1],
                filter: [
                  'drop-shadow(0 0 10px rgba(0, 242, 254, 0.2))',
                  'drop-shadow(0 0 30px rgba(0, 242, 254, 0.4))',
                  'drop-shadow(0 0 10px rgba(0, 242, 254, 0.2))'
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-24 rounded-full glass-dark flex items-center justify-center border border-white/20 shadow-2xl transition-all duration-700 relative overflow-hidden group/logo mx-auto active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/20 opacity-50" />
              <img 
                src="/logo.png" 
                alt="Crackord Logo" 
                className="w-16 h-16 object-contain relative z-10 brightness-110 contrast-125" 
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
            </motion.div>
            
            <div className="flex flex-col items-center">
              <div className="w-8 h-1 bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_15px_rgba(0,242,254,0.6)]" />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar pb-8 relative z-10">
            <div className="space-y-8">
              <div>
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/15 mb-6">Discovery</p>
                <div className="space-y-1.5">
                  {mainItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => onCategorySelect(item.id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                        activeCategory === item.id 
                          ? 'bg-primary/20 text-primary shadow-[0_0_20px_rgba(0,242,254,0.15)] border border-primary/30' 
                          : 'text-white/30 hover:text-white/70 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 relative z-10 transition-transform duration-500 ${activeCategory === item.id ? 'scale-110 active-glow' : 'group-hover:scale-110'}`} />
                      <span className="text-xs font-black relative z-10 tracking-wider uppercase">{item.label}</span>
                      {activeCategory === item.id && (
                        <motion.div layoutId="active-nav-glow" className="absolute inset-0 bg-primary/5 blur-xl pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="px-5 flex items-center justify-between mb-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/15">Library</p>
                  <span className="text-[10px] font-black text-primary/50 bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">{categories.length}</span>
                </div>
                <div className="space-y-1">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => onCategorySelect(category)}
                      className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-500 group relative ${
                        activeCategory === category 
                          ? 'bg-white/5 text-primary border border-primary/10' 
                          : 'text-white/20 hover:text-white/50 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className={`text-[10px] font-bold truncate tracking-wider uppercase ${activeCategory === category ? 'text-primary' : ''}`}>{category}</span>
                      {activeCategory === category && (
                        <div className="w-1 h-1 rounded-full bg-primary shadow-[0_0_10px_rgba(0,242,254,1)] animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="p-4 relative z-10">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-white/20 hover:text-red-400 hover:bg-red-400/5 transition-all duration-500 group border border-transparent hover:border-red-400/10"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">Logout System</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';
