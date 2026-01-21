// src/components/Connections.tsx

'use client';

import React from 'react';
import { MindNode, DesignConfig, LayoutOrientation } from '@/types/types';

interface Props {
  nodes: MindNode[];
  visibleNodes: MindNode[];
  orientation: LayoutOrientation;
  design: DesignConfig;
  draggedNodeId: string | null;
}

const Connections: React.FC<Props> = ({ nodes, visibleNodes, orientation, design, draggedNodeId }) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
      {visibleNodes.map((node) => {
        if (!node.parentId) return null;
        const parent = nodes.find((n) => n.id === node.parentId);
        if (!parent || !visibleNodes.find(n => n.id === parent.id)) return null;

        const nodeHeight = node.height || 100;
        const parentHeight = parent.height || 100;

        let sx, sy, ex, ey;

        if (orientation === 'vertical') {
          sx = node.x + 130;
          sy = node.y;
          ex = parent.x + 130;
          ey = parent.y + parentHeight;
        } else {
          sx = node.x + 260;
          sy = node.y + nodeHeight / 2;
          ex = parent.x;
          ey = parent.y + parentHeight / 2;
        }

        const curve = orientation === 'vertical'
          ? `M ${sx} ${sy} C ${sx} ${sy - 60}, ${ex} ${ey + 60}, ${ex} ${ey}`
          : `M ${sx} ${sy} C ${sx - 60} ${sy}, ${ex + 60} ${ey}, ${ex} ${ey}`;

        return (
          <path
            key={`line-${node.id}`}
            d={curve}
            fill="none"
            stroke={design.lineColor}
            strokeWidth="2.5"
            strokeDasharray={design.lineStyle === 'dashed' ? '6 4' : '0'}
            className="opacity-100 transition-all duration-300 "
            style={{
              transition: (draggedNodeId === node.id || draggedNodeId === parent.id) ? 'none' : 'all 0.3s ease',
              willChange: (draggedNodeId === node.id || draggedNodeId === parent.id) ? 'd' : 'auto'
            }}
          />
        );
      })}
    </svg>
  );
};


export default Connections;
