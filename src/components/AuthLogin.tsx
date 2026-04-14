'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, ShieldCheck, Sparkles, Loader2, AlertCircle, Download, Monitor, Smartphone, Info } from 'lucide-react';

interface AuthLoginProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const AuthLogin: React.FC<AuthLoginProps> = ({ onLogin, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'download'>('login');
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkSize = () => setIsDesktop(window.innerWidth >= 768);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  if (!mounted) return <div className="fixed inset-0 bg-[#05050a]" />;

  // --- RENDER STABLE MOBILE VIEW ---
  const renderMobileView = () => (
    <div className="w-full max-w-[96%] relative z-10 p-4">
      <div className="bg-[#0c0c14]/95 rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-[1.5rem] bg-black/60 flex items-center justify-center border border-white/10 mb-6 shadow-2xl">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover rounded-[1.5rem]" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-1 text-center">Crackord <span className="text-primary underline decoration-primary decoration-4 underline-offset-8">Portal</span></h1>
          <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Mobile Version v4.5.3</p>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mt-10 w-full relative">
            <div 
              className={`absolute inset-y-1 w-[calc(50%-4px)] bg-gradient-to-r from-primary to-secondary rounded-xl transition-all duration-300 ${mode === 'login' ? 'left-1' : 'left-[calc(50%+1px)]'}`}
            />
            <button type="button" onClick={() => setMode('login')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors ${mode === 'login' ? 'text-white' : 'text-white/30'}`}>Login</button>
            <button type="button" onClick={() => setMode('download')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors ${mode === 'download' ? 'text-white' : 'text-white/30'}`}>Apps</button>
          </div>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:border-primary/50 outline-none placeholder:text-white/10" required />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:border-primary/50 outline-none placeholder:text-white/10" required />
            </div>
            {error && <div className="text-red-400 text-[10px] font-bold bg-red-400/5 p-4 rounded-xl border border-red-400/10 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
            <button type="submit" disabled={isLoading} className="w-full py-5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-black uppercase text-xs tracking-[0.3em] shadow-xl touch-manipulation">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : <div className="flex items-center justify-center gap-3"><LogIn className="w-5 h-5" /><span>Initialize Access</span></div>}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
             {[
               { id: 'tv', name: 'FIRE TV STICK', icon: Monitor },
               { id: 'phone', name: 'ANDROID PHONE', icon: Smartphone }
             ].map((p) => (
               <div key={p.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between">
                 <div className="flex items-center gap-4"><p.icon className="w-6 h-6 text-primary" /><p className="text-sm font-black text-white">{p.name}</p></div>
                 <button className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20"><Download className="w-5 h-5" /></button>
               </div>
             ))}
             <div className="bg-primary/5 p-5 rounded-2xl text-[10px] text-primary/60 font-black uppercase text-center border border-primary/10">Code: <span className="text-white">88192</span></div>
          </div>
        )}
      </div>
    </div>
  );

  // --- RENDER ORIGINAL PREMIUM DESKTOP VIEW ---
  const renderDesktopView = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl relative z-10"
    >
      {/* Outer Glow Aura */}
      <div className="absolute -inset-10 bg-primary/5 rounded-[5rem] blur-[150px] animate-pulse pointer-events-none" />
      
      <div className="glass-dark rounded-[3.5rem] border border-white/10 p-20 shadow-[0_0_100px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-3xl">
        
        {/* signature: Scanner Light Beam */}
        <motion.div 
          animate={{ x: [-800, 800], opacity: [0, 0.4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-[300px] h-[1000px] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[45deg] pointer-events-none"
        />

        <div className="flex flex-col items-center mb-16 relative z-10">
          <motion.div 
            initial={{ rotate: -20, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-[1.75rem] md:rounded-[2rem] bg-black/50 flex items-center justify-center shadow-2xl glow-primary mb-10 border border-white/10 overflow-hidden group"
          >
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
          </motion.div>
          
          <h1 className="text-5xl font-black text-white tracking-[-0.05em] uppercase mb-4 text-center">
            CRACKORD <span className="text-primary underline decoration-primary decoration-4 underline-offset-[12px]">PORTAL</span>
          </h1>
          
          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 mt-10 min-w-[320px] relative backdrop-blur-2xl">
            <motion.div 
              layout
              className="absolute inset-y-1.5 bg-white/10 rounded-xl shadow-inner pointer-events-none border border-white/5"
              animate={{ 
                left: mode === 'login' ? '6px' : 'calc(50% + 3px)', 
                right: mode === 'login' ? 'calc(50% + 3px)' : '6px',
                backgroundColor: mode === 'login' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(112, 0, 255, 0.1)'
              }}
            />
            <button 
              onClick={() => setMode('login')} 
              className={`flex-1 py-3.5 text-[11px] font-black uppercase tracking-[0.3em] relative z-10 transition-all duration-500 ${mode === 'login' ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
            >
              PORTAL LOGIN
            </button>
            <button 
              onClick={() => setMode('download')} 
              className={`flex-1 py-3.5 text-[11px] font-black uppercase tracking-[0.3em] relative z-10 transition-all duration-500 ${mode === 'download' ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
            >
              APP DOWNLOADS
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.form 
              key="login-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit} 
              className="space-y-8 relative z-10 px-4"
            >
              <div className="space-y-5">
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/10 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Email Address" 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-white text-base focus:border-primary/50 outline-none transition-all placeholder:text-white/5" 
                    required 
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/10 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Password" 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-white text-base focus:border-primary/50 outline-none transition-all placeholder:text-white/5" 
                    required 
                  />
                </div>
              </div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-red-400 bg-red-400/5 p-6 rounded-2xl border border-red-400/10 flex items-center gap-4 text-xs font-black uppercase tracking-widest"
                >
                  <AlertCircle className="w-5 h-5"/>{error}
                </motion.div>
              )}

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full group relative py-6 bg-black border border-white/5 rounded-2xl text-white font-black uppercase text-sm tracking-[0.5em] shadow-2xl hover:border-primary/50 transition-all overflow-hidden flex items-center justify-center gap-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>
                  <LogIn className="w-6 h-6 text-primary" />
                  <span>INITIALIZE ACCESS</span>
                </>}
              </button>
            </motion.form>
          ) : (
            <motion.div 
              key="download-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5 px-4 relative z-10"
            >
              {[
                { name: 'FIRE TV STICK', desc: 'Optimized for TV & Remotes', icon: Monitor },
                { name: 'ANDROID MOBILE', desc: 'Gesture & Touch High-Perf', icon: Smartphone }
              ].map((p, i) => (
                <div key={i} className="group bg-white/5 border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between hover:border-primary/40 transition-all cursor-pointer">
                  <div className="flex items-center gap-8">
                    <div className="p-6 rounded-2xl bg-black shadow-2xl text-primary border border-white/5 group-hover:bg-primary group-hover:text-black transition-all"><p.icon className="w-8 h-8" /></div>
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors">{p.name}</h3>
                      <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mt-1">{p.desc}</p>
                    </div>
                  </div>
                  <button className="p-5 rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-black transition-all border border-primary/20"><Download className="w-6 h-6"/></button>
                </div>
              ))}
              <div className="text-center mt-10">
                <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.8em]">Ultimate Commercial Edition v4.5</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 z-[100] overflow-hidden bg-[#05050a]">
      {/* Universal Background Flow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0a20] via-black to-[#050510]" />
        {isDesktop && (
          <>
            <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[150px] animate-pulse" />
            {/* signature: Background Grid */}
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
          </>
        )}
      </div>

      {isDesktop ? renderDesktopView() : renderMobileView()}
    </div>
  );
};
