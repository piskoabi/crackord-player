'use client';

import React, { useState, useEffect } from 'react';
import { Play, ChevronLeft, Calendar, Info, Clock, Star } from 'lucide-react';
import { type IPTVChannel } from '@/lib/m3u-parser';
import { type XtreamCredentials } from '@/lib/xtream';

interface SeriesDetailProps {
  series: IPTVChannel;
  credentials: XtreamCredentials;
  onPlay: (item: IPTVChannel) => void;
  onBack: () => void;
}

export const SeriesDetail: React.FC<SeriesDetailProps> = ({ series, credentials, onPlay, onBack }) => {
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<string>('');

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      try {
        const id = series.tvgId;
        const res = await fetch(`/api/xtream?action=series_info&series_id=${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        const data = await res.json();
        setInfo(data);
        if (data.episodes) {
          const seasons = Object.keys(data.episodes);
          if (seasons.length > 0) setSelectedSeason(seasons[0]);
        }
      } catch (err) {
        console.error("Error fetching series info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [series.tvgId, credentials]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white/20 animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-t-primary border-white/5 animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Loading Series Data...</span>
      </div>
    );
  }

  if (!info) return <div className="text-white">Error loading info.</div>;

  const currentEpisodes = info.episodes?.[selectedSeason] || [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <button 
          onClick={onBack}
          className="md:hidden flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Library
        </button>

        <div className="w-full md:w-64 aspect-[2/3] relative rounded-3xl overflow-hidden shadow-2xl group shrink-0 border border-white/20 glass-dark scale-95 group-hover:scale-100 transition-transform duration-700">
          <img 
            src={info.info?.cover || series.logo} 
            alt={series.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <button 
            onClick={onBack}
            className="hidden md:flex items-center gap-2 text-white/20 hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Library
          </button>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-br from-white to-white/40 drop-shadow-2xl">{series.name}</h1>
          
          <div className="flex flex-wrap items-center gap-6 mt-2">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Star className="w-4 h-4 fill-current" />
              <span>{info.info?.rating || 'N/A'}/10</span>
            </div>
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{info.info?.releaseDate || info.info?.last_modified || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Info className="w-4 h-4" />
              <span className="uppercase tracking-widest font-bold text-[10px]">{info.info?.genre || series.group}</span>
            </div>
          </div>

          <p className="text-white/60 text-lg leading-relaxed max-w-3xl mt-4">
            {info.info?.plot || "No description available for this series."}
          </p>
        </div>
      </div>

      {/* Seasons Selector */}
      <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-4 no-scrollbar">
        {Object.keys(info.episodes || {}).sort((a, b) => Number(a) - Number(b)).map(season => (
          <button
            key={season}
            onClick={() => setSelectedSeason(season)}
            className={`px-8 py-3 rounded-2xl text-sm font-black transition-all whitespace-nowrap border-b-2 ${selectedSeason === season ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-white border-primary shadow-lg glow-primary' : 'bg-white/5 text-white/40 border-transparent hover:bg-white/10'}`}
          >
            SEASON {season}
          </button>
        ))}
      </div>

      {/* Episodes List */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12 overflow-y-auto pr-4 custom-scrollbar">
        {currentEpisodes.map((episode: any) => (
          <button
            key={episode.id}
            onClick={() => {
              const normalizedHost = credentials.host.replace(/\/+$/, '');
              onPlay({
                ...series,
                id: `episode-${episode.id}`,
                name: `S${selectedSeason}E${episode.episode_num} - ${episode.title}`,
                url: `${normalizedHost}/series/${credentials.username}/${credentials.password}/${episode.id}.${episode.container_extension || 'mp4'}`,
              });
            }}
            className="flex flex-col gap-3 p-4 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/10 transition-all duration-500 text-left group hover:-translate-y-1 shadow-lg hover:shadow-primary/10"
          >
            <div className="w-full aspect-video rounded-2xl overflow-hidden relative bg-black/40 border border-white/5">
              <img 
                src={episode.info?.movie_image || info.info?.cover || series.logo} 
                alt={episode.title}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-all">
                  <Play className="w-6 h-6 text-white fill-current" />
                </div>
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-black text-white/60">
                EP {episode.episode_num}
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm truncate">{episode.title}</h4>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mt-1">
                {episode.info?.duration || info.info?.episode_run_time || '??'} MIN
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
