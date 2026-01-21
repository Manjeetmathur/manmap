// src/components/ContextMenu.tsx

'use client';

import React from 'react';
import { MindNode, DesignConfig } from '@/types/types';
import { Icons, PALETTE } from '@/constants/constants';

interface Props {
  position: { x: number; y: number };
  nodeId: string;
  nodes: MindNode[];
  setNodes: React.Dispatch<React.SetStateAction<MindNode[]>>;
  design: DesignConfig;
  onClose: () => void;
}

const ContextMenu: React.FC<Props> = ({ position, nodeId, nodes, setNodes, design, onClose }) => {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  const updateNode = (updates: Partial<MindNode>) => {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)));
    onClose();
  };

  const deleteNode = () => {
    // Recursively delete node and children
    const toDelete = new Set<string>();
    const stack = [nodeId];
    while (stack.length) {
      const curr = stack.pop()!;
      toDelete.add(curr);
      const n = nodes.find((i) => i.id === curr);
      n?.childrenIds.forEach((c) => stack.push(c));
    }
    setNodes((prev) =>
      prev
        .filter((i) => !toDelete.has(i.id))
        .map((i) => ({ ...i, childrenIds: i.childrenIds.filter((c) => !toDelete.has(c)) }))
    );
    onClose();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(node.text);
      onClose();
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div
      className="fixed z-[999] w-64 backdrop-blur-3xl border border-black/5 rounded-2xl shadow-2xl overflow-hidden"
      style={{
        left: Math.min(position.x, window.innerWidth - 280),
        top: Math.min(position.y, window.innerHeight - 400),
        backgroundColor: `${design.surfaceColor}f2`,
        color: design.textColor,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-5 py-4 border-b border-black/5 space-y-4">
        <div>
          <label className="text-[9px] uppercase font-black opacity-30 block mb-1">Name</label>
          <input
            type="text"
            value={node.text}
            onChange={(e) => updateNode({ text: e.target.value })}
            className="w-full bg-black/5 border border-black/5 rounded-lg px-3 py-2 text-xs focus:outline-none transition-all"
            style={{ color: design.textColor }}
            placeholder="Node name..."
          />
        </div>
        <div>
          <label className="text-[9px] uppercase font-black opacity-30 block mb-1">Category Label</label>
          <input
            type="text"
            value={node.subLabel || ''}
            onChange={(e) => updateNode({ subLabel: e.target.value })}
            className="w-full bg-black/5 border border-black/5 rounded-lg px-3 py-2 text-xs focus:outline-none transition-all"
            style={{ color: design.textColor }}
            placeholder="e.g. Marketing..."
          />
        </div>
      </div>

      <div className="p-5">
        <span className="text-[9px] uppercase font-black opacity-30 block mb-3">Color</span>
        <div className="grid grid-cols-5 gap-2">
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => updateNode({ color: c })}
              className={`w-6 h-6 rounded-full border transition-transform hover:scale-125 ${node.color === c ? 'scale-110 ring-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="px-5 py-4 border-t border-black/5 space-y-2">
        <button
          onClick={copyToClipboard}
          className="w-full flex items-center gap-3 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg text-xs font-bold transition-all"
        >
          <Icons.Plus />
          Copy Text
        </button>
        <button
          onClick={deleteNode}
          className="w-full flex items-center gap-3 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold transition-all"
        >
          <Icons.Trash />
          Delete Node
        </button>
      </div>
    </div>
  );
};

export default ContextMenu;