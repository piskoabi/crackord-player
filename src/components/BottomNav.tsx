'use client';

import React from 'react';
import { Tv, Film, PlayCircle, Heart } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BottomNavProps {
  activeType: 'live' | 'vod' | 'series' | 'favorites';
  onTypeChange: (type: 'live' | 'vod' | 'series' | 'favorites') => void;
  showFavorites: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeType, onTypeChange }) => {
  const items = [
    { id: 'live', label: 'Live', icon: Tv },
    { id: 'vod', label: 'Movies', icon: Film },
    { id: 'series', label: 'Series', icon: PlayCircle },
    { id: 'favorites', label: 'Favs', icon: Heart },
  ] as const;

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100] animate-in slide-in-from-bottom-10 duration-700">
      <div className="glass-dark border border-white/10 rounded-[2rem] p-2 flex items-center justify-between shadow-2xl">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onTypeChange(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 flex-1 py-3 rounded-2xl transition-all duration-300",
              activeType === item.id 
                ? "bg-primary text-white shadow-lg glow-primary scale-105" 
                : "text-white/30 hover:text-white/50"
            )}
          >
            <item.icon className={cn("w-5 h-5", activeType === item.id ? "fill-current" : "")} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
