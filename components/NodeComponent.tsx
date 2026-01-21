// 2. src/components/NodeComponent.tsx (Updated to use CSS transform for instant dragging)

'use client';

import React, { useCallback } from 'react';
import { MindNode, DesignConfig, LayoutOrientation } from '@/types/types';
import { Icons, NODE_TYPE_COLORS } from '@/constants/constants';
import AutoExpandingTextarea from './AutoExpandingTextarea';

const NODE_WIDTH = 260;
const INITIAL_NODE_HEIGHT = 100;

interface Props {
  node: MindNode;
  nodes: MindNode[];
  setNodes: React.Dispatch<React.SetStateAction<MindNode[]>>;
  design: DesignConfig;
  orientation: LayoutOrientation;
  canvasZoom: number;
  isDragged: boolean;
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onContextMenu: (pos: { x: number; y: number; nodeId: string } | null) => void;
  onAiExpand: (nodeId: string) => void;
  searchTerm: string;
}

const NodeComponent: React.FC<Props> = ({
  node,
  nodes,
  setNodes,
  design,
  orientation,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canvasZoom: _canvasZoom,
  isDragged,
  onMouseDown,
  onContextMenu,
  onAiExpand,
  searchTerm,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isLoading, _setIsLoading] = React.useState(false);
  const hasChildren = node.childrenIds.length > 0;

  const updateNode = useCallback((id: string, updates: Partial<MindNode>) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  }, [setNodes]);

  const updateTextAndHeight = useCallback((id: string, text: string, height: number) => {
    updateNode(id, { text, height: Math.max(INITIAL_NODE_HEIGHT, height) });
  }, [updateNode]);

  const isOverlapping = useCallback((x: number, y: number, excludeId?: string) => {
    const width = NODE_WIDTH;
    const height = INITIAL_NODE_HEIGHT;
    for (const n of nodes) {
      if (excludeId && n.id === excludeId) continue;
      if (
        x < n.x + n.width &&
        x + width > n.x &&
        y < n.y + (n.height || INITIAL_NODE_HEIGHT) &&
        y + height > n.y
      ) {
        return true;
      }
    }
    return false;
  }, [nodes]);

  const addChild = useCallback(() => {
    if (node.childrenIds.length >= 2) return;

    const newId = crypto.randomUUID();
    const siblingCount = node.childrenIds.length;
    let childX = node.x;
    let childY = node.y + (node.height || INITIAL_NODE_HEIGHT) + 120;

    if (orientation === 'vertical') {
      childX += siblingCount % 2 === 0 ? 200 : -200;
    } else {
      childX += NODE_WIDTH + 360;
      childY += siblingCount % 2 === 0 ? 200 : -200;
    }

    // Find a position that doesn't overlap
    let offset = 0;
    while (isOverlapping(childX, childY + offset, newId)) {
      offset += 120;
    }
    childY += offset;

    const newNode: MindNode = {
      id: newId,
      text: 'New Idea',
      type: 'concept',
      color: NODE_TYPE_COLORS.concept,
      x: childX,
      y: childY,
      width: NODE_WIDTH,
      height: INITIAL_NODE_HEIGHT,
      parentId: node.id,
      childrenIds: [],
      isCollapsed: false,
    };

    setNodes((prev) => [
      ...prev.map((n) => (n.id === node.id ? { ...n, childrenIds: [...n.childrenIds, newId], isCollapsed: false } : n)),
      newNode,
    ]);
  }, [node, orientation, setNodes, isOverlapping]);

  const deleteNodeAndChildren = useCallback(() => {
    const toDelete = new Set<string>();
    const stack = [node.id];
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
  }, [node.id, nodes, setNodes]);

  // Style updates
  const baseStyle = {
    left: node.x,
    top: node.y,
    width: NODE_WIDTH,
    height: node.height || INITIAL_NODE_HEIGHT,
    borderColor: `${node.color}cc`,
    backgroundColor: design.surfaceColor,
    color: design.textColor,
    boxShadow: isDragged ? `0 30px 60px rgba(0,0,0,0.4)` : `0 8px 30px rgba(0,0,0,0.05)`,
    zIndex: isDragged ? 1000 : 10,
    willChange: isDragged ? 'left, top' : 'auto',
  };

  return (
    <div
      onMouseDown={(e) => onMouseDown(e, node.id)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
      }}
      style={baseStyle}
      className={`node absolute pointer-events-auto border-2 rounded-[2rem] p-6 flex flex-col group select-none ${isDragged ? 'scale-110 shadow-2xl' : 'hover:scale-102 transition-all duration-300'} ${searchTerm && node.text.toLowerCase().includes(searchTerm.toLowerCase()) ? 'ring-2 ring-yellow-400' : ''}`}
    >

      {node.subLabel && (
        <div className="absolute -top-7 left-0 w-full text-[9px] font-black uppercase tracking-widest text-center opacity-40 truncate">
          {node.subLabel}
        </div>
      )}

      {node.id !== 'root' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteNodeAndChildren();
          }}
          className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg border-2 border-white z-50"
        >
          <Icons.Trash />
        </button>
      )}

      <div className="flex-1 flex items-center justify-center">
        <AutoExpandingTextarea node={node} design={design} onUpdate={updateTextAndHeight} isDragging={isDragged} />
      </div>

      {hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateNode(node.id, { isCollapsed: !node.isCollapsed });
          }}
          className="absolute w-8 h-8 rounded-full border flex items-center justify-center shadow-md hover:scale-110 z-20"
          style={{
            backgroundColor: design.surfaceColor,
            borderColor: 'rgba(0,0,0,0.05)',
            color: design.textColor,
            bottom: orientation === 'vertical' ? '-16px' : '50%',
            right: orientation === 'horizontal' ? '-16px' : '50%',
            left: orientation === 'horizontal' ? 'auto' : '50%',
            top: orientation === 'horizontal' ? '50%' : 'auto',
            transform: orientation === 'horizontal' ? 'translateY(-50%)' : 'translateX(-50%)',
          }}
        >
          {node.isCollapsed ? (orientation === 'vertical' ? <Icons.ChevronDown /> : <Icons.ChevronRight />) : (orientation === 'vertical' ? <Icons.ChevronRight /> : <Icons.ChevronDown />)}
        </button>
      )}

      {!node.isCollapsed && node.childrenIds.length < 2 && (
        <div
          className={`absolute opacity-0 group-hover:opacity-100 transition-all flex ${orientation === 'vertical' ? '-bottom-12 left-0 w-full justify-center gap-6' : 'top-0 -right-12 h-full flex-col justify-center gap-6'
            }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              addChild();
            }}
            className="w-10 h-10 rounded-full bg-blue-500 text-white shadow-lg hover:scale-110 flex items-center justify-center"
            title="Add Child"
          >
            <Icons.Plus />
          </button>
           <button
             onClick={(e) => {
               e.stopPropagation();
               if (!node.loading) onAiExpand(node.id);
             }}
             disabled={node.loading}
             className="w-10 h-10 rounded-full bg-violet-500 text-white shadow-lg hover:scale-110 flex items-center justify-center disabled:opacity-50"
             title={node.loading ? "Expanding..." : "AI Expand"}
           >
             {node.loading ? <Icons.Loader /> : <Icons.Sparkles />}
           </button>
        </div>
      )}
    </div>
  );
};

export default NodeComponent;