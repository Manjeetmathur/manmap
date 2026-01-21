// src/constants/constants.ts

import React from 'react';
import {
  Brain,
  Trash2,
  Plus,
  Menu,
  X,
  Palette,
  Folder,
  Sparkles,
  ChevronDown,
  ChevronRight,
  PlusSquare,
  Save,
  Loader,
} from 'lucide-react';
import { DesignConfig } from '@/types/types';

export const NODE_TYPE_COLORS = {
  concept: '#38bdf8',
  action: '#4ade80',
  problem: '#f87171',
  solution: '#fbbf24',
} as const;

export const PALETTE = [
  '#38bdf8', '#4ade80', '#f87171', '#fbbf24', '#a78bfa',
  '#f472b6', '#2dd4bf', '#a3e635', '#fcd34d', '#ffffff',
  '#94a3b8', '#0f172a', '#1e293b', '#334155', '#475569',
];

export const THEME_PRESETS: DesignConfig[] = [
  {
    name: 'Snowfall',
    backgroundColor: '#f8fafc',
    surfaceColor: '#ffffff',
    textColor: '#0f172a',
    accentColor: '#38bdf8',
    lineColor: 'rgba(0, 0, 0, 0.08)',
    gridColor: 'rgba(0, 0, 0, 0.04)',
    nodeOpacity: 1,
    lineStyle: 'solid',
  },
  {
    name: 'Midnight',
    backgroundColor: '#020617',
    surfaceColor: '#0f172a',
    textColor: '#f8fafc',
    accentColor: '#38bdf8',
    lineColor: 'rgba(255, 255, 255, 0.12)',
    gridColor: 'rgba(255, 255, 255, 0.03)',
    nodeOpacity: 0.9,
    lineStyle: 'dashed',
  },
];

export const Icons = {
  Brain: () => <Brain size={20} strokeWidth={2} />,
  Trash: () => <Trash2 size={16} strokeWidth={2} />,
  Plus: () => <Plus size={16} strokeWidth={2} />,
  Menu: () => <Menu size={20} strokeWidth={2} />,
  X: () => <X size={20} strokeWidth={2} />,
  Palette: () => <Palette size={18} strokeWidth={2} />,
  Folder: () => <Folder size={18} strokeWidth={2} />,
  Sparkles: () => <Sparkles size={14} strokeWidth={2} />,
  ChevronDown: () => <ChevronDown size={14} strokeWidth={2} />,
  ChevronRight: () => <ChevronRight size={14} strokeWidth={2} />,
  PlusSquare: () => <PlusSquare size={18} strokeWidth={2} />,
  Save: () => <Save size={18} strokeWidth={2} />,
  Loader: () => <Loader size={16} strokeWidth={2} className="animate-spin" />,
};