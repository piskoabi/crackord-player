'use client';

import React from 'react';
import { Play, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { IPTVChannel } from '@/lib/m3u-parser';

interface ChannelCardProps {
  channel: IPTVChannel;
  isActive: boolean;
  onSelect: (channel: IPTVChannel) => void;
  onToggleFavorite: (channel: IPTVChannel) => void;
  isFavorite: boolean;
}

export const ChannelCard: React.FC<ChannelCardProps> = React.memo(({ 
  channel, 
  isActive, 
  onSelect, 
  onToggleFavorite, 
  isFavorite 
}) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative flex flex-col gap-3 p-3 rounded-[2rem] glass transition-all duration-500 text-left cursor-pointer overflow-hidden ${
        isActive 
          ? 'border-primary/40 bg-primary/5 active-glow ring-1 ring-primary/20' 
          : 'hover:bg-white/5 hover:border-white/20'
      }`}
      onClick={() => onSelect(channel)}
    >
      <div className="w-full aspect-video rounded-2xl overflow-hidden relative bg-black/60 border border-white/5 group-hover:border-primary/20 transition-all duration-700">
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {channel.logo ? (
            <img 
              src={channel.logo} 
              alt={channel.name} 
              className="max-h-full max-w-full object-contain brightness-95 group-hover:brightness-110 group-hover:scale-110 transition-all duration-700"
            />
          ) : (
            <div className="w-12 h-12 rounded-full glass-dark flex items-center justify-center text-primary/40 text-xl font-black uppercase select-none group-hover:text-primary transition-colors">
              {channel.name.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100 pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(0,242,254,0.6)]">
            <Play className="text-white w-5 h-5 fill-current" />
          </div>
        </div>

        <button 
          className={`absolute top-2 right-2 p-2 rounded-xl glass-dark transition-all duration-500 z-10 hover:scale-110 ${
            isFavorite ? 'text-primary opacity-100' : 'text-white/20 hover:text-white/80 opacity-0 group-hover:opacity-100'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(channel);
          }}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col gap-0.5 px-1 pb-1">
        <h3 className="text-[11px] font-black text-white/80 truncate w-full group-hover:text-primary transition-colors uppercase tracking-wider">
          {channel.name}
        </h3>
        <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] truncate">
          {channel.group || 'OTHER'}
        </p>
      </div>

      {isActive && (
        <motion.div 
          layoutId="active-marker"
          className="absolute inset-0 border-2 border-primary/20 rounded-[2rem] pointer-events-none" 
        />
      )}
    </motion.div>
  );
});

ChannelCard.displayName = 'ChannelCard';
