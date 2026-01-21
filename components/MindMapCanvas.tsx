// src/components/MindMapCanvas.tsx (Fixed: Removed invalid setDraggedNodeId calls + smooth dragging fully integrated)

'use client';

import React from 'react';
import Connections from './Connections';
import NodeComponent from './NodeComponent';
import { MindNode, DesignConfig, LayoutOrientation, NodeType } from '@/types/types';
import { NODE_TYPE_COLORS } from '@/constants/constants';

const NODE_WIDTH = 260;
const INITIAL_NODE_HEIGHT = 100;
const V_SPACING = 220;
const H_SPACING = 360;

interface AiSuggestion {
  text: string;
  type: NodeType;
}

interface Props {
  nodes: MindNode[];
  setNodes: React.Dispatch<React.SetStateAction<MindNode[]>>;
  visibleNodes: MindNode[];
  canvas: { offset: { x: number; y: number }; zoom: number };
  design: DesignConfig;
  orientation: LayoutOrientation;
  draggedNodeId: string | null;
  setContextMenu: (menu: { x: number; y: number; nodeId: string } | null) => void;
  canvasProps: ReturnType<typeof import('@/hooks/useCanvasInteractions').default>;
   onAiExpand: (nodeId: string) => void;
}

const MindMapCanvas: React.FC<Props> = ({
  nodes,
  setNodes,
  visibleNodes,
  canvas,
  design,
  orientation,
  draggedNodeId,
  setContextMenu,
  canvasProps,
  onAiExpand,
}) => {
  const {
    canvasRef,
    handleMouseMove,
    isPanning,
    setIsPanning,
    endDrag, // ← Use this to clean up drag state
  } = canvasProps;

  return (
    <div
      ref={canvasRef}
      className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={(e) => {
        if (!(e.target as Element).closest('.node')) {
          setIsPanning(true);
          setContextMenu(null);
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={() => {
        setIsPanning(false);
        endDrag(); // ← Only call endDrag() – it resets draggedNodeId + delta internally
      }}
      onMouseLeave={() => {
        setIsPanning(false);
        endDrag(); // ← Only call endDrag()
      }}
      onWheel={(e) => {
        canvasProps.setCanvas((prev) => ({
          ...prev,
          zoom: Math.max(0.15, Math.min(3, prev.zoom - e.deltaY * 0.001)),
        }));
      }}
      style={{
        backgroundImage: `linear-gradient(to right, ${design.gridColor} 1px, transparent 1px),
                         linear-gradient(to bottom, ${design.gridColor} 1px, transparent 1px)`,
        backgroundSize: `${50 * canvas.zoom}px ${50 * canvas.zoom}px`,
        backgroundPosition: `${canvas.offset.x % 50}px ${canvas.offset.y % 50}px`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${canvas.offset.x}px, ${canvas.offset.y}px) scale(${canvas.zoom})`,
          transformOrigin: '0 0',
          transition: isPanning || draggedNodeId ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        <Connections
          nodes={nodes}
          visibleNodes={visibleNodes}
          orientation={orientation}
          design={design}
          draggedNodeId={draggedNodeId}
        />

        {visibleNodes.map((node) => (
          <NodeComponent
            key={node.id}
            node={node}
            nodes={nodes}
            setNodes={setNodes}
            design={design}
            orientation={orientation}
            canvasZoom={canvas.zoom}
            isDragged={draggedNodeId === node.id}
            onMouseDown={canvasProps.startNodeDrag}
            onContextMenu={setContextMenu}
            onAiExpand={onAiExpand}
          />
        ))}


      </div>
    </div>
  );
};

export default MindMapCanvas;