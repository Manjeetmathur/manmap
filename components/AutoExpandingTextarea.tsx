// src/components/AutoExpandingTextarea.tsx

'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { MindNode, DesignConfig } from '@/types/types';

const INITIAL_HEIGHT = 100;
const PADDING = 64;

interface Props {
  node: MindNode;
  design: DesignConfig;
  onUpdate: (id: string, text: string, height: number) => void;
  isDragging: boolean;
}

const AutoExpandingTextarea: React.FC<Props> = ({ node, design, onUpdate, isDragging }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    const newScrollHeight = textareaRef.current.scrollHeight;
    const newHeight = Math.max(INITIAL_HEIGHT, newScrollHeight + PADDING);
    if (Math.abs(newHeight - (node.height || INITIAL_HEIGHT)) > 5) {
      onUpdate(node.id, node.text, newHeight);
    }
  }, [node.id, node.text, node.height, onUpdate]);

  useEffect(() => {
    adjustHeight();
  }, [node.text, adjustHeight]);

  return (
    <textarea
      ref={textareaRef}
      value={node.text}
      onChange={(e) => onUpdate(node.id, e.target.value, node.height || INITIAL_HEIGHT)}
      onMouseDown={(e) => {
        if (document.activeElement === textareaRef.current) e.stopPropagation();
      }}
      className={`bg-transparent text-sm font-semibold focus:outline-none resize-none w-full leading-snug overflow-hidden block text-center ${isDragging ? 'pointer-events-none' : 'cursor-text'}`}
      style={{ color: design.textColor }}
      placeholder="Type something..."
      rows={1}
    />
  );
};

export default AutoExpandingTextarea;