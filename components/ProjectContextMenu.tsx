// src/components/ProjectContextMenu.tsx

'use client';

import React from 'react';
import { MindMapProject } from '@/types/types';
import { Icons } from '@/constants/constants';

interface Props {
  position: { x: number; y: number };
  projectId: string;
  projects: MindMapProject[];
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const ProjectContextMenu: React.FC<Props> = ({ position, projectId, projects, onRename, onDelete, onClose }) => {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;

  return (
    <div
      className="fixed z-[999] w-48 backdrop-blur-3xl border border-black/5 rounded-2xl shadow-2xl overflow-hidden"
      style={{
        left: Math.min(position.x, window.innerWidth - 200),
        top: Math.min(position.y, window.innerHeight - 150),
        backgroundColor: '#ffffff',
        color: '#000000',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-4 py-3 border-b border-black/5">
        <p className="text-xs font-bold truncate">{project.name}</p>
      </div>

      <div className="p-2 space-y-1">
        <button
          onClick={() => {
            onRename(projectId);
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-black/5 rounded-lg text-xs font-bold transition-all"
        >
          <Icons.Plus />
          Rename
        </button>
        <button
          onClick={() => {
            onDelete(projectId);
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-500/10 text-red-500 rounded-lg text-xs font-bold transition-all"
        >
          <Icons.Trash />
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProjectContextMenu;