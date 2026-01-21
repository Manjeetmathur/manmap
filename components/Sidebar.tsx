// src/components/Sidebar.tsx

'use client';

import React from 'react';
import { MindMapProject } from '@/types/types';
import { Icons } from '@/constants/constants';
import { DesignConfig } from '@/types/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects: MindMapProject[];
  currentProjectId: string | null;
  onNewProject: () => void;
  onLoadProject: (project: MindMapProject) => void;
  onDeleteProject: (id: string) => void;
  onProjectRename: (id: string) => void;
  onSaveAs: () => void;
  onFullAIGeneration: () => void;
  isGenerating: boolean;
  isSyncing: boolean;
  design?: DesignConfig; // optional, will use default if not passed
  setProjectContextMenu: (menu: { x: number; y: number; projectId: string } | null) => void;
}

const Sidebar: React.FC<Props> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onNewProject,
  onLoadProject,
  onDeleteProject,
  onProjectRename,
  onSaveAs,
  onFullAIGeneration,
  isGenerating,
  isSyncing,
  design = { surfaceColor: '#ffffff', textColor: '#000000' } as DesignConfig,
  setProjectContextMenu,
}) => {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]" onClick={onClose} />}

      <div
        className={`fixed top-0 left-0 h-full w-80 z-[200] border-r border-black/5 shadow-2xl transition-transform duration-500 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: design.surfaceColor, color: design.textColor }}
      >
        <div className="p-6 flex items-center justify-between border-b border-black/5">
          <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Icons.Brain /> ManMap
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full">
            <Icons.X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Projects</p>
            <button
              onClick={onNewProject}
              className="w-full flex items-center gap-3 px-4 py-3 bg-black/5 hover:bg-black/10 rounded-xl text-xs font-bold transition-all"
            >
              <Icons.PlusSquare /> New Project
            </button>
            <button
              onClick={onSaveAs}
              className="w-full flex items-center gap-3 px-4 py-3 bg-black/5 hover:bg-black/10 rounded-xl text-xs font-bold transition-all"
            >
              <Icons.Save /> Save As
            </button>
            <button
              onClick={onFullAIGeneration}
              disabled={isGenerating}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:shadow-lg rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              <Icons.Sparkles /> {isGenerating ? 'Generating...' : 'AI Full Map'}
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Cloud Projects</p>
            {projects.length === 0 ? (
              <p className="text-[11px] opacity-40 italic text-center py-4">No projects yet</p>
            ) : (
               <div className="space-y-2">
                 {projects.map((p) => (
                   <div
                     key={p.id}
                     onClick={() => onLoadProject(p)}
                     onContextMenu={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       setProjectContextMenu({ x: e.clientX, y: e.clientY, projectId: p.id });
                     }}
                     className={`w-full text-left px-4 py-3 rounded-xl border transition-all group flex items-center gap-3 cursor-pointer ${
                       currentProjectId === p.id ? 'border-blue-500 bg-blue-50/50' : 'border-black/5 hover:bg-black/5'
                     }`}
                     role="button"
                     tabIndex={0}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' || e.key === ' ') {
                         e.preventDefault();
                         onLoadProject(p);
                       }
                     }}
                   >
                     <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                       <Icons.Folder />
                     </div>
                     <div className="flex-1 overflow-hidden">
                       <p className="text-xs font-bold truncate">{p.name}</p>
                       <p className="text-[10px] opacity-30">
                         {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '—'}
                       </p>
                     </div>
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         onDeleteProject(p.id);
                       }}
                       className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                     >
                       <Icons.Trash />
                     </button>
                   </div>
                 ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-black/5 flex items-center justify-between text-[10px] font-bold opacity-30 uppercase tracking-widest px-6">
          <span>{isSyncing ? 'Syncing...' : 'Synced'}</span>
          <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
        </div>
      </div>
    </>
  );
};

export default Sidebar;