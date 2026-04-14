'use client';

import React, { useState } from 'react';
import { Link2, Search, ArrowRight, Loader2, KeyRound, Globe, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type XtreamCredentials } from '@/lib/xtream';

interface PlaylistInputProps {
  onLoadM3U: (url: string) => void;
  onLoadXtream: (creds: XtreamCredentials) => void;
  onLogout: () => void;
  isLoading?: boolean;
}

export const PlaylistInput: React.FC<PlaylistInputProps> = ({ onLoadM3U, onLoadXtream, onLogout, isLoading = false }) => {
  const [mode, setMode] = useState<'m3u' | 'xtream'>('m3u');
  const [m3uUrl, setM3uUrl] = useState('');
  const [xtream, setXtream] = useState<XtreamCredentials>({
    host: '',
    username: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'm3u' && m3uUrl.trim()) {
      onLoadM3U(m3uUrl.trim());
    } else if (mode === 'xtream' && xtream.host && xtream.username && xtream.password) {
      onLoadXtream(xtream);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden p-4 md:p-8">
      {/* Background Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <motion.div 
        layout
        transition={{ 
          layout: { type: "spring", stiffness: 180, damping: 24, mass: 1.0 },
          opacity: { duration: 0.35 }
        }}
        className="w-full max-w-[95%] md:max-w-2xl flex flex-col gap-6 p-4 md:p-10 glass-dark rounded-[2.5rem] md:rounded-[3rem] border border-white/20 shadow-2xl relative overflow-hidden group z-10"
      >
        {/* Decorative Inner Orbs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[120px] pointer-events-none group-hover:bg-primary/30 transition-colors" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/20 rounded-full blur-[120px] pointer-events-none group-hover:bg-secondary/30 transition-colors" />

        <div className="flex flex-col gap-4 text-center relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-black/60 flex items-center justify-center glow-primary shadow-2xl mx-auto overflow-hidden border border-white/20 group-hover:scale-110 transition-transform duration-700 relative">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/20 to-transparent" />
            <img 
              src="/logo.png" 
              alt="Crackord Logo" 
              className="w-full h-full object-cover relative z-10 brightness-110 contrast-110" 
            />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/40 uppercase">CRACKORD PLAYER</h2>
          <p className="text-primary font-black tracking-[0.5em] uppercase text-[9px] opacity-60">High Performance Streaming</p>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 self-center mb-4 relative min-w-[280px] z-10">
          {/* Sliding Pill - Animated with Framer Motion */}
          <motion.div 
            layout 
            transition={{ type: "spring", stiffness: 180, damping: 24, mass: 1.0 }}
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] h-[calc(100%-12px)] bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg glow-primary ${mode === 'm3u' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`} 
          />
          
          <button 
            onClick={() => setMode('m3u')}
            className={`relative z-10 flex-1 py-2.5 rounded-xl text-sm font-black transition-all duration-500 ${mode === 'm3u' ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
          >
            M3U URL
          </button>
          <button 
            onClick={() => setMode('xtream')}
            className={`relative z-10 flex-1 py-2.5 rounded-xl text-sm font-black transition-all duration-500 ${mode === 'xtream' ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
          >
            XTREAM CODES
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          <motion.div 
            layout="position" 
            transition={{ type: "spring", stiffness: 180, damping: 24, mass: 1.0 }}
            className="flex flex-col gap-4"
          >
            {mode === 'm3u' ? (
              <motion.div 
                key="m3u-fields"
                layout="position"
                initial={{ opacity: 0, filter: "blur(4px)", y: 5 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative group"
              >
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-white/20">
                  <Link2 className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={m3uUrl}
                  onChange={(e) => setM3uUrl(e.target.value)}
                  placeholder="https://example.com/playlist.m3u"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all duration-300 shadow-inner"
                  required
                />
              </motion.div>
            ) : (
              <motion.div 
                key="xtream-fields"
                layout="position"
                initial={{ opacity: 0, filter: "blur(4px)", y: 5 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex flex-col gap-4"
              >
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-white/20">
                    <Globe className="w-5 h-5" />
                  </div>
                  <input
                    type="url"
                    value={xtream.host}
                    onChange={(e) => setXtream({ ...xtream, host: e.target.value })}
                    placeholder="http://host:port"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                    required
                  />
                </div>
                <motion.div layout="position" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-white/20">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={xtream.username}
                      onChange={(e) => setXtream({ ...xtream, username: e.target.value })}
                      placeholder="Username"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-white/20">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      value={xtream.password}
                      onChange={(e) => setXtream({ ...xtream, password: e.target.value })}
                      placeholder="Password"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                      required
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          <motion.button
            layout
            transition={{ type: "spring", stiffness: 180, damping: 24, mass: 1.0 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-secondary py-5 rounded-2xl text-white font-black tracking-widest uppercase flex items-center justify-center gap-3 hover:brightness-125 active:scale-95 disabled:opacity-50 transition-all shadow-xl glow-primary mt-2 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Connect Server <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </motion.button>
        </form>

          <div className="flex items-center justify-center gap-6 mt-4 opacity-40 relative z-10">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">📺</span>
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Live</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">🎬</span>
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Movies</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">🍿</span>
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Series</span>
            </div>
          </div>

          <div className="mt-8 flex justify-center relative z-10">
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 text-white/30 hover:text-red-400 hover:border-red-400/20 hover:bg-red-400/5 transition-all duration-300 text-[10px] font-black uppercase tracking-widest"
            >
              <LogOut className="w-3 h-3" />
              Sign Out from Account
            </button>
          </div>
        </motion.div>
    </div>
  );
};
