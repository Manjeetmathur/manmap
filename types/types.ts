// src/types/types.ts

export type NodeType = 'concept' | 'action' | 'problem' | 'solution';

export interface MindNode {
  id: string;
  text: string;
  subLabel?: string;
  type: NodeType;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parentId?: string;
  childrenIds: string[];
  isCollapsed: boolean;
  loading?: boolean;
}

export interface CanvasState {
  offset: { x: number; y: number };
  zoom: number;
}

export interface DesignConfig {
  name: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  accentColor: string;
  lineColor: string;
  gridColor: string;
  nodeOpacity: number;
  lineStyle: 'solid' | 'dashed';
}

export type LayoutOrientation = 'vertical' | 'horizontal';

export interface MindMapProject {
  id: string;
  name: string;
  nodes: MindNode[];
  orientation: LayoutOrientation;
  updatedAt: number;
}

export interface AiTreeResponse {
  text: string;
  type: NodeType;
  children?: AiTreeResponse[];
}
