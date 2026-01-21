// src/hooks/useCanvasInteractions.ts (Refactored for LIVE updates to fix drag feel)

'use client';

import { useState, useRef, useEffect } from 'react';
import { MindNode, CanvasState } from '@/types/types';

interface UseCanvasProps {
  nodes: MindNode[];
  setNodes: React.Dispatch<React.SetStateAction<MindNode[]>>;
  canvasState: CanvasState;
}

export default function useCanvasInteractions({ nodes, setNodes, canvasState: initialCanvas }: UseCanvasProps) {
  const [canvas, setCanvas] = useState<CanvasState>(initialCanvas);
  const [isPanning, setIsPanning] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Stores the world-space offset between the node's top-left and the initial click point
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.userSelect = isPanning || draggedNodeId ? 'none' : 'auto';
  }, [isPanning, draggedNodeId]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setCanvas((prev) => ({
        ...prev,
        offset: { x: prev.offset.x + e.movementX, y: prev.offset.y + e.movementY },
      }));
    } else if (draggedNodeId) {
      // Calculate new world coordinates for the node
      // (MousePos - CanvasOffset) / Zoom - OffsetWithinNode
      const x = (e.clientX - canvas.offset.x) / canvas.zoom - dragOffset.x;
      const y = (e.clientY - canvas.offset.y) / canvas.zoom - dragOffset.y;

      setNodes((prev) =>
        prev.map((n) => (n.id === draggedNodeId ? { ...n, x, y } : n))
      );
    }
  };

  const startNodeDrag = (e: React.MouseEvent, nodeId: string) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
    e.stopPropagation();

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setDraggedNodeId(nodeId);

    // Initial world-space mouse pos minus node's current world-space pos
    const worldMouseX = (e.clientX - canvas.offset.x) / canvas.zoom;
    const worldMouseY = (e.clientY - canvas.offset.y) / canvas.zoom;

    setDragOffset({
      x: worldMouseX - node.x,
      y: worldMouseY - node.y
    });
  };

  const endDrag = () => {
    setDraggedNodeId(null);
  };

  const resetView = () => setCanvas({ offset: { x: 0, y: 0 }, zoom: 1 });

  return {
    canvas,
    setCanvas,
    canvasRef,
    isPanning,
    setIsPanning,
    draggedNodeId,
    dragLiveDelta: null, // No longer needed as we update live
    handleMouseMove,
    startNodeDrag,
    endDrag,
    resetView,
  };
}