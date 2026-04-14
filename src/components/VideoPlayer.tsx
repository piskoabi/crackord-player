import React, { useEffect, useRef, useState } from 'react';
import { Tv, AlertCircle } from 'lucide-react';
import Hls from 'hls.js';

type EngineState = 'idle' | 'loading' | 'playing' | 'error';

export const VideoPlayer: React.FC<{ url: string; autoPlay?: boolean }> = ({ url, autoPlay = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<EngineState>('idle');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) { setStatus('idle'); return; }

    let hls: Hls | null = null;
    let mpegtsPlayer: any = null;
    let cancelled = false;

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const proxiedUrl = `${origin}/api/proxy?url=${encodeURIComponent(url)}`;

    // Stream type detection
    const isHLS  = url.includes('.m3u8');
    const isVOD  = url.includes('/movie/') || url.includes('/series/');
    const isLive = !isHLS && !isVOD;

    const destroy = () => {
      try { if (hls) { hls.destroy(); hls = null; } } catch (_) {}
      try {
        if (mpegtsPlayer) {
          mpegtsPlayer.pause();
          mpegtsPlayer.unload();
          mpegtsPlayer.detachMediaElement();
          mpegtsPlayer.destroy();
          mpegtsPlayer = null;
        }
      } catch (_) {}
    };

    setStatus('loading');

    // ── 1. HLS (.m3u8) ─────────────────────────────────────────────────────
    if (isHLS && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: false,
        lowLatencyMode: false, // Maximum stability
        backBufferLength: 30,
        maxBufferLength: 120, // 2 minutes buffer!
        maxMaxBufferLength: 180,
        maxBufferSize: 120 * 1000 * 1000,
        appendErrorMaxRetry: 50, // Extremely resilient
        manifestLoadingMaxRetry: 50,
        levelLoadingMaxRetry: 50,
        fragLoadingMaxRetry: 50,
        startLevel: -1,
        liveSyncDurationCount: 5,
        autoStartLoad: true
      });
      hls.loadSource(proxiedUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!cancelled) setStatus('playing');
        if (autoPlay) video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e: any, d: any) => {
        if (d.fatal && !cancelled) {
          if (d.type === Hls.ErrorTypes.NETWORK_ERROR) hls?.startLoad();
          else if (d.type === Hls.ErrorTypes.MEDIA_ERROR) hls?.recoverMediaError();
          else { setStatus('error'); destroy(); }
        }
      });
    }

    // ── 2. VOD: Movies & Series ─────────────────────────────────────────────
    else if (isVOD) {
      video.src = proxiedUrl;
      video.preload = 'auto'; // Load as much as possible
      video.addEventListener('canplay', () => {
        if (!cancelled) setStatus('playing');
        if (autoPlay) video.play().catch(() => {});
      }, { once: true });
      video.load();
    }

    // ── 3. Live MPEG-TS ──────────────────────────────────────────────────────
    else if (isLive) {
      const startLive = () => {
        if (cancelled) return;
        const mpegts = (window as any).mpegts;
        if (mpegts?.isSupported()) {
          mpegtsPlayer = mpegts.createPlayer(
            { type: 'mse', url: proxiedUrl, isLive: true, cors: true, withCredentials: false },
            { 
              enableWorker: false, 
              enableStashBuffer: true, 
              stashInitialSize: 2048, // Massive 2MB buffer for absolute safety
              liveBufferLatencyChasing: false, // Disable chasing to prevent audio 'spacking'
              liveBufferLatencyMaxLatency: 20, // Allow huge latency for maximum stability
              lazyLoad: false, // Keep loading to fill the buffer
              autoCleanupSourceBuffer: true,
              autoCleanupMaxBackwardDuration: 60,
              autoCleanupMinBackwardDuration: 30,
              fixAudioTimestampGap: true,
              accurateSeek: false,
            }
          );
          
          mpegtsPlayer.on((window as any).mpegts.Events.ERROR, (errType: any, errDetail: any) => {
            if (cancelled) return;
            const ErrorTypes = (window as any).mpegts.ErrorTypes;
            const ErrorDetails = (window as any).mpegts.ErrorDetails;
            if (errDetail === ErrorDetails?.MediaMSEError || String(errDetail).includes('MSE')) return;
            if (errType === ErrorTypes?.NETWORK_ERROR) {
              setStatus('loading');
              setTimeout(() => { if (!cancelled) { try { mpegtsPlayer?.destroy(); } catch(e){} startLive(); } }, 1000);
              return;
            }
            setStatus('error');
          });

          mpegtsPlayer.attachMediaElement(video);
          mpegtsPlayer.load();
          if (autoPlay) mpegtsPlayer.play().catch(() => {});
          if (!cancelled) setStatus('playing');
        } else {
          video.src = proxiedUrl;
          if (autoPlay) video.play().catch(() => {});
          if (!cancelled) setStatus('playing');
        }
      };

      if (!(window as any).mpegts) {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/mpegts.js@1.7.3/dist/mpegts.min.js';
        s.onload = () => { if (!cancelled) startLive(); };
        document.head.appendChild(s);
      } else {
        startLive();
      }
    }

    const stallInterval = setInterval(() => {
      if (video.paused || video.ended || cancelled || status !== 'playing') return;
      if (video.readyState < 3) return;
      const lastTime = (video as any)._lastCheckTime || 0;
      if (Math.abs(video.currentTime - lastTime) < 0.01) {
        if (mpegtsPlayer) video.currentTime = video.buffered.end(video.buffered.length - 1) - 0.5;
        else if (hls) hls.startLoad();
      }
      (video as any)._lastCheckTime = video.currentTime;
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(stallInterval);
      destroy();
      try { video.src = ''; video.load(); } catch (_) {}
    };
  }, [url, autoPlay]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/5 group/player">
      <video 
        ref={videoRef} 
        className="w-full h-full" 
        controls 
        playsInline 
        autoPlay={autoPlay}
        crossOrigin="anonymous"
      />

      {status === 'loading' && url && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 z-10 pointer-events-none backdrop-blur-sm">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-b-2 border-primary animate-spin" />
            <div className="absolute inset-2 rounded-full border-t-2 border-secondary animate-[spin_1.5s_linear_infinite]" />
            <Tv className="w-6 h-6 text-white/20" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60 animate-pulse">Initializing Stream</span>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 z-20 backdrop-blur-md">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2">
            <AlertCircle className="w-10 h-10 text-red-500/50" />
          </div>
          <p className="text-white font-black uppercase tracking-widest text-sm">Signal Lost</p>
          <p className="text-white/30 text-[9px] uppercase tracking-[0.3em] mt-1 max-w-[200px] text-center leading-relaxed">The stream requested is currently unavailable or the proxy is offline.</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 rounded-xl glass text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all">Reload System</button>
        </div>
      )}

      {!url && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 gap-6 z-10 bg-[#040408]">
          <div className="relative items-center justify-center flex">
            <div className="w-24 h-24 rounded-full border border-white/5 animate-[spin_20s_linear_infinite]" />
            <div className="absolute w-16 h-16 rounded-full border border-primary/10 animate-[spin_15s_linear_infinite_reverse]" />
            <Tv className="absolute w-8 h-8 text-white/5" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10">Standby Mode</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/5">Select a channel to begin broadcast</span>
          </div>
        </div>
      )}
    </div>
  );
};
