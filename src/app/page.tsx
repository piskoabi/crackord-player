'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Volume2, Maximize2, Play, Pause, RefreshCw, Tv, Film, PlayCircle, Star, LayoutGrid, Heart, Loader2, AlertCircle, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ChannelCard } from '@/components/ChannelCard';
import { PlaylistInput } from '@/components/PlaylistInput';
import type { IPTVChannel, IPTVPlaylist } from '@/lib/m3u-parser';
import { type XtreamCredentials } from '@/lib/xtream';
import { SeriesDetail } from '@/components/SeriesDetail';
import { BottomNav } from '@/components/BottomNav';
import { VirtuosoGrid } from 'react-virtuoso';
import { get, set, del } from 'idb-keyval';
import { AuthLogin } from '@/components/AuthLogin';
import { supabase } from '@/lib/supabase';
import { type User } from '@supabase/supabase-js';

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [playlist, setPlaylist] = useState<IPTVPlaylist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState<IPTVChannel | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'newest' | 'name-asc' | 'name-desc'>('default');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<'m3u' | 'xtream' | null>(null);
  const [xtreamCreds, setXtreamCreds] = useState<XtreamCredentials | null>(null);
  const [xtreamType, setXtreamType] = useState<'live' | 'vod' | 'series'>('live');
  const [selectedSeries, setSelectedSeries] = useState<IPTVChannel | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    setHasMounted(true);
    
    // Fail-safe timeout for mobile/slow connections
    const timer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 3500);

    // Check Supabase session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Auth session error:", err);
      } finally {
        setIsAuthLoading(false);
        clearTimeout(timer);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    checkSession();
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    const init = async () => {
      try {
        const savedFavorites = localStorage.getItem('iptv-favorites');
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
        
        const lastMode = localStorage.getItem('iptv-last-mode') as 'm3u' | 'xtream';
        if (lastMode === 'm3u') {
          const url = localStorage.getItem('iptv-last-url');
          if (url) {
            const cached = await get(`playlist-${url}`);
            if (cached) {
              setPlaylist(cached);
              setLoginMode('m3u');
            } else {
              loadM3U(url);
            }
          }
        } else if (lastMode === 'xtream') {
          const credsStr = localStorage.getItem('iptv-last-xtream');
          if (credsStr) {
            const creds = JSON.parse(credsStr);
            setXtreamCreds(creds);
            const cacheKey = `xtream-${creds.username}-${creds.host}-live-v2`;
            const cached = await get(cacheKey);
            if (cached) {
              setPlaylist(cached);
              setLoginMode('xtream');
            } else {
              loadXtream(creds, 'live');
            }
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    init();
  }, [hasMounted]);

  useEffect(() => {
    localStorage.setItem('iptv-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const loadM3U = async (url: string, force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!force) {
        const cached = await get(`playlist-${url}`);
        if (cached) {
          setPlaylist(cached);
          setLoginMode('m3u');
          localStorage.setItem('iptv-last-mode', 'm3u');
          localStorage.setItem('iptv-last-url', url);
          setIsLoading(false);
          return;
        }
      }
      const response = await fetch(`/api/playlist?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Failed to load M3U');
      const data = await response.json();
      setPlaylist(data);
      await set(`playlist-${url}`, data);
      setLoginMode('m3u');
      localStorage.setItem('iptv-last-mode', 'm3u');
      localStorage.setItem('iptv-last-url', url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChannelSelect = (channel: IPTVChannel) => {
    if (xtreamType === 'series') {
      setSelectedSeries(channel);
    } else {
      setActiveChannel(channel);
    }
  };

  const loadXtream = async (creds: XtreamCredentials, action: 'live' | 'vod' | 'series', force = false) => {
    setIsLoading(true);
    setError(null);
    setXtreamType(action);
    setActiveCategory('all');
    setSelectedSeries(null);
    try {
      const cacheVersion = action === 'series' ? 'v3' : 'v2';
      const cacheKey = `xtream-${creds.username}-${creds.host}-${action}-${cacheVersion}`;
      if (!force) {
        const cached = await get(cacheKey);
        if (cached) {
          setPlaylist(cached);
          setXtreamCreds(creds);
          setLoginMode('xtream');
          localStorage.setItem('iptv-last-mode', 'xtream');
          localStorage.setItem('iptv-last-xtream', JSON.stringify(creds));
          setIsLoading(false);
          return;
        }
      }
      const response = await fetch(`/api/xtream?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      if (!response.ok) throw new Error(`Failed to fetch ${action}`);
      const data = await response.json();
      const normalizedHost = creds.host.replace(/\/+$/, '');
      const encodedUser = encodeURIComponent(creds.username);
      const encodedPass = encodeURIComponent(creds.password);
      const mappedPlaylist: IPTVPlaylist = {
        header: { name: action.toUpperCase() },
        items: (data.items || []).map((item: any) => {
          const streamId = item.stream_id || item.series_id || item.id || `item-${Math.random()}`;
          let streamUrl = '';
          if (action === 'series') {
            streamUrl = `${normalizedHost}/series/${encodedUser}/${encodedPass}/${streamId}.mp4`;
          } else {
            const ext = item.container_extension || (action === 'vod' ? 'mp4' : 'ts');
            streamUrl = `${normalizedHost}/${action === 'vod' ? 'movie' : 'live'}/${encodedUser}/${encodedPass}/${streamId}.${ext}`;
          }
          return {
            id: `xtream-${streamId}`,
            name: item.name || '',
            group: data.categories?.find((c: any) => c.category_id === item.category_id)?.category_name || 'Other',
            logo: item.stream_icon || item.cover || '',
            url: streamUrl,
            tvgId: (item.stream_id || item.series_id)?.toString() ?? '',
            added: item.added,
          };
        })
      };
      setPlaylist(mappedPlaylist);
      await set(cacheKey, mappedPlaylist);
      setXtreamCreds(creds);
      setLoginMode('xtream');
      localStorage.setItem('iptv-last-mode', 'xtream');
      localStorage.setItem('iptv-last-xtream', JSON.stringify(creds));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = useMemo(() => {
    if (!playlist) return [];
    const groups = new Set(playlist.items.map(item => item.group));
    return Array.from(groups).sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const isANew = aLower.includes('neue') || aLower.includes('neu') || aLower.includes('new');
      const isBNew = bLower.includes('neue') || bLower.includes('neu') || bLower.includes('new');
      if (isANew && !isBNew) return -1;
      if (!isANew && isBNew) return 1;
      return aLower.localeCompare(bLower);
    });
  }, [playlist]);

  const filteredChannels = useMemo(() => {
    if (!playlist) return [];
    let filtered = playlist.items;
    if (activeCategory === 'favorites') {
      filtered = filtered.filter(item => favorites.includes(item.id));
    } else if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.group === activeCategory);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const nameMatch = (item.name || '').toLowerCase().includes(query);
        const groupMatch = (item.group || '').toLowerCase().includes(query);
        return nameMatch || groupMatch;
      });
    }
    filtered = [...filtered];
    if (sortBy === 'newest') {
      filtered.sort((a, b) => (Number(b.added) || 0) - (Number(a.added) || 0));
    } else if (sortBy === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }
    return filtered;
  }, [playlist, activeCategory, searchQuery, favorites, sortBy]);

  const toggleFavorite = (channel: IPTVChannel) => {
    setFavorites(prev => prev.includes(channel.id) ? prev.filter(id => id !== channel.id) : [...prev, channel.id]);
  };

  const handleLogin = async (email: string, pass: string) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      if (data?.user) setUser(data.user);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setPlaylist(null); setLoginMode(null); setXtreamCreds(null); setActiveChannel(null); setSelectedSeries(null);
    localStorage.removeItem('iptv-last-mode'); localStorage.removeItem('iptv-last-url'); localStorage.removeItem('iptv-last-xtream');
  };

  const refresh = () => {
    if (loginMode === 'm3u') {
      const url = localStorage.getItem('iptv-last-url');
      if (url) loadM3U(url, true);
    } else if (loginMode === 'xtream' && xtreamCreds) {
      loadXtream(xtreamCreds, xtreamType, true);
    }
    setSelectedSeries(null);
  };

  const handleMobileNavChange = (type: 'live' | 'vod' | 'series' | 'favorites') => {
    if (type === 'favorites') {
      setActiveCategory('favorites');
      setXtreamType('live');
    } else {
      setActiveCategory('all');
      if (loginMode === 'xtream' && xtreamCreds) loadXtream(xtreamCreds, type);
    }
  };

  // Start directly with the Auth screen to prevent black screens/hangs on mobile
  if (!user) {
    return <AuthLogin onLogin={handleLogin} isLoading={isLoading} error={authError} />;
  }

  if (!playlist && !isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <PlaylistInput onLoadM3U={loadM3U} onLoadXtream={(c) => loadXtream(c, 'live')} onLogout={logout} isLoading={isLoading} />
      </main>
    );
  }

  return (
    <main className={`flex h-screen overflow-hidden bg-background text-foreground font-sans selection:bg-primary/30 ${activeChannel ? 'video-active' : ''}`}>
      {/* Premium Background Mesh */}
      <div className="bg-mesh">
        <div className="bg-orb w-[600px] h-[600px] bg-primary/20 -top-48 -left-48 animate-orb" />
        <div className="bg-orb w-[500px] h-[500px] bg-secondary/20 -bottom-24 -right-24 animate-orb [animation-delay:-5s]" />
      </div>

      <Sidebar 
        activeCategory={activeCategory} 
        onCategorySelect={(cat) => { setActiveCategory(cat); setSelectedSeries(null); setIsSidebarOpen(false); }} 
        categories={categories} 
        mode={loginMode}
        onLogout={logout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isPlaybackActive={!!activeChannel}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <header className="h-24 flex items-center justify-between px-6 md:px-12 z-20 gap-4 md:gap-10">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-3 rounded-2xl glass-dark text-white/40 hover:text-white flex-shrink-0">
            <LayoutGrid className="w-6 h-6" />
          </button>
          
          <div className="flex-1 min-w-0 md:max-w-2xl relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] py-4 pl-14 pr-6 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all duration-300 backdrop-blur-md font-bold tracking-wider uppercase"
            />
          </div>

          <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
            <div className="hidden lg:flex items-center glass rounded-2xl p-1 border-white/5">
              {[
                { id: 'default', label: 'ALL' },
                { id: 'newest', label: 'NEW' },
                { id: 'name-asc', label: 'A-Z' }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => setSortBy(opt.id as any)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black tracking-[0.2em] transition-all ${sortBy === opt.id ? 'bg-white/10 text-white active-glow' : 'text-white/20 hover:text-white/40'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={refresh} disabled={isLoading} className="p-4 rounded-2xl glass-dark text-white/20 hover:text-primary hover:border-primary/20 transition-all active:scale-95 disabled:opacity-50 group" title="Refresh Playlist">
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 duration-700'}`} />
              </button>

              <button onClick={logout} className="p-4 rounded-2xl glass-dark text-red-400/20 hover:text-red-400 hover:border-red-400/20 transition-all active:scale-95 border border-transparent" title="Logout System">
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {loginMode === 'xtream' && xtreamCreds && (
              <div className="hidden lg:flex glass p-1.5 rounded-[1.5rem] border border-white/10 ml-2">
                <button onClick={() => loadXtream(xtreamCreds, 'live')} className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${xtreamType === 'live' ? 'bg-primary text-white active-glow shadow-[0_0_20px_rgba(0,242,254,0.3)]' : 'text-white/30 hover:text-white/60'}`}><Tv className="w-4 h-4" /> Live</button>
                <button onClick={() => loadXtream(xtreamCreds, 'vod')} className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${xtreamType === 'vod' ? 'bg-primary text-white active-glow shadow-[0_0_20px_rgba(0,242,254,0.3)]' : 'text-white/30 hover:text-white/60'}`}><Film className="w-4 h-4" /> Movies</button>
                <button onClick={() => loadXtream(xtreamCreds, 'series')} className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${xtreamType === 'series' ? 'bg-primary text-white active-glow shadow-[0_0_20px_rgba(0,242,254,0.3)]' : 'text-white/30 hover:text-white/60'}`}><PlayCircle className="w-4 h-4" /> Series</button>
              </div>
            )}
          </div>
        </header>

        <section className="flex-1 flex flex-col overflow-hidden p-6 md:p-12 gap-8 min-h-0 relative">
          {selectedSeries && xtreamCreds ? (
            <SeriesDetail series={selectedSeries} credentials={xtreamCreds} onBack={() => setSelectedSeries(null)} onPlay={(ch) => { setSelectedSeries(null); setActiveChannel(ch); }} />
          ) : (
            <>
              {activeChannel && (
                <div key={activeChannel.id} className="w-full max-w-6xl mx-auto flex-shrink-0 animate-in zoom-in-95 fade-in duration-700 relative group/player-section">
                  {/* Ambilight-style glow behind player */}
                  <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full opacity-50 -z-10 animate-pulse" />
                  
                  <VideoPlayer url={activeChannel.url} />
                  
                  <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-[9px] font-black text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20 uppercase tracking-[0.3em]">
                          {activeChannel.group}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,242,254,1)]" />
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Broadcast Active</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                        {activeChannel.name}
                      </h2>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleFavorite(activeChannel)} 
                        className={`p-5 rounded-3xl transition-all duration-500 overflow-hidden relative group/fav ${
                          favorites.includes(activeChannel.id) 
                            ? 'active-glow scale-110' 
                            : 'glass-dark text-white/20 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <Heart className={`w-6 h-6 relative z-10 icon-shadow ${favorites.includes(activeChannel.id) ? 'fill-primary text-primary' : ''}`} />
                      </button>
                      
                      <button 
                        onClick={() => setActiveChannel(null)}
                        className="p-5 rounded-3xl glass-dark text-white/20 hover:text-white hover:border-white/20 transition-all active:scale-95 group/close"
                        title="Dismiss Player"
                      >
                        <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 flex flex-col overflow-hidden mt-4">
                <div className="flex items-center justify-between mb-8 px-2">
                  <div className="flex flex-col">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                      {activeCategory === 'favorites' ? 'Personal Favorites' : activeCategory === 'all' ? 'Master Library' : activeCategory}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-8 h-0.5 bg-primary/40 rounded-full" />
                      <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.5em]">{filteredChannels.length} Objects Indexed</span>
                    </div>
                  </div>

                  <div className="lg:hidden flex border-white/5 border rounded-2xl p-1 bg-white/5">
                    {loginMode === 'xtream' && xtreamCreds && (
                      <button onClick={() => loadXtream(xtreamCreds, xtreamType === 'live' ? 'vod' : xtreamType === 'vod' ? 'series' : 'live')} className="p-2 text-primary">
                        {xtreamType === 'live' ? <Film className="w-5 h-5" /> : xtreamType === 'vod' ? <PlayCircle className="w-5 h-5" /> : <Tv className="w-5 h-5" />}
                      </button>
                    )}
                  </div>
                </div>

                {isLoading && !playlist ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-6 text-white/10">
                    <div className="relative">
                      <Loader2 className="w-16 h-16 animate-spin text-primary opacity-40" />
                      <div className="absolute inset-0 blur-2xl bg-primary/20 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black tracking-[0.5em] uppercase animate-pulse">Synchronizing Data</span>
                  </div>
                ) : filteredChannels.length > 0 ? (
                  <div className="flex-1 -mx-2">
                    <VirtuosoGrid
                      data={filteredChannels as IPTVChannel[]}
                      totalCount={filteredChannels.length}
                      overscan={400}
                      itemContent={(index, channel: IPTVChannel) => (
                        <div className="p-2.5">
                          <ChannelCard key={channel.id} channel={channel} isActive={activeChannel?.id === channel.id} onSelect={handleChannelSelect} onToggleFavorite={toggleFavorite} isFavorite={favorites.includes(channel.id)} />
                        </div>
                      )}
                      listClassName="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 custom-scrollbar pb-24"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-6 glass rounded-[3rem] p-12 opacity-50">
                    <div className="w-20 h-20 rounded-full border border-white/5 flex items-center justify-center text-white/10">
                      <AlertCircle className="w-10 h-10" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-sm font-black uppercase tracking-widest text-white/20">Index Empty</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/10">Adjust filters or search parameters</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <BottomNav activeType={activeCategory === 'favorites' ? 'favorites' : xtreamType} onTypeChange={handleMobileNavChange} showFavorites={favorites.length > 0} />

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-12 right-12 z-[100]"
          >
            <div className="glass-dark border-red-500/20 px-8 py-5 rounded-[2rem] flex items-center gap-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500/50" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-red-500/60 tracking-[0.3em] mb-0.5">Terminal Warning</span>
                <span className="text-white/80 text-xs font-bold leading-relaxed">{error}</span>
              </div>
              <button onClick={() => setError(null)} className="ml-4 p-2 hover:bg-white/5 rounded-xl transition-all">
                <X className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
