// src/components/Toolbar.tsx

'use client';

import React from 'react';
import { DesignConfig, LayoutOrientation } from '@/types/types';
import { Icons, THEME_PRESETS } from '@/constants/constants';

interface Props {
  onMenuClick: () => void;
  projectName: string;
  design: DesignConfig;
  setDesign: React.Dispatch<React.SetStateAction<DesignConfig>>;
  orientation: LayoutOrientation;
  setOrientation: (o: LayoutOrientation) => void;
  onResetView: () => void;
  isSyncing: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Toolbar: React.FC<Props> = ({
  onMenuClick,
  projectName,
  design,
  setDesign,
  orientation,
  setOrientation,
  onResetView,
  isSyncing,
  searchTerm,
  setSearchTerm,
}) => {
  const toggleTheme = () => {
    const currentIdx = THEME_PRESETS.findIndex((t) => t.name === design.name);
    setDesign(THEME_PRESETS[(currentIdx + 1) % THEME_PRESETS.length]);
  };

  return (
    <div className="absolute top-6 left-6 right-6 z-[100] pointer-events-none flex items-center justify-between">
      <div className="flex items-center gap-4 pointer-events-auto">
        <button
          onClick={onMenuClick}
          className="p-4 rounded-2xl border border-black/5 shadow-xl backdrop-blur-3xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
          style={{ backgroundColor: design.surfaceColor }}
        >
          <Icons.Menu />
        </button>
        <div
          className="px-6 py-4 rounded-2xl border border-black/5 shadow-xl backdrop-blur-3xl hidden md:block"
          style={{ backgroundColor: design.surfaceColor }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Active Project</p>
          <h1 className="text-sm font-black truncate max-w-[200px]">{projectName}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 pointer-events-auto p-3 rounded-2xl border border-black/5 shadow-xl backdrop-blur-3xl" style={{ backgroundColor: design.surfaceColor }}>
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 text-xs bg-transparent border border-black/5 rounded-lg focus:outline-none focus:border-blue-500"
          style={{ color: design.textColor }}
        />
        <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-black/5 transition-all" title="Switch Theme">
          <Icons.Palette />
        </button>
        <div className="w-px h-6 bg-black/5 mx-1" />
        <button
          onClick={() => setOrientation(orientation === 'vertical' ? 'horizontal' : 'vertical')}
          className="px-3 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black/5 rounded-xl transition-colors border border-black/5"
        >
          {orientation}
        </button>
        <button
          onClick={onResetView}
          className="px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black/5 rounded-xl transition-colors border border-black/5"
        >
          Reset
        </button>
        <span className={`text-[10px] font-bold opacity-50 ml-2 ${isSyncing ? 'animate-pulse' : ''}`}>
          {isSyncing ? 'Syncing...' : 'Synced'}
        </span>
      </div>
    </div>
  );
};

export default Toolbar;