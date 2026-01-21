// src/hooks/useMindMap.ts (Fixed: Expose setNodes in return object to resolve type error)

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { MindNode, DesignConfig, LayoutOrientation, MindMapProject, NodeType, AiTreeResponse } from '@/types/types';
import { NODE_TYPE_COLORS, THEME_PRESETS } from '@/constants/constants';
import { subscribeToProjects, saveProject, deleteProject } from '@/lib/firebase';
import { getAiExpansion, generateFullTree } from '@/services/geminiService';
import useCanvasInteractions from './useCanvasInteractions';

const NODE_WIDTH = 260;
const INITIAL_NODE_HEIGHT = 100;
const V_SPACING = 220;
const H_SPACING = 360;

const getDefaultRootNode = (windowWidth: number = 800): MindNode => ({
  id: 'root',
  text: 'Start Your Journey',
  subLabel: 'Root Concept',
  type: 'concept',
  color: NODE_TYPE_COLORS.concept,
  x: windowWidth / 2 - NODE_WIDTH / 2,
  y: 120,
  width: NODE_WIDTH,
  height: INITIAL_NODE_HEIGHT,
  childrenIds: [],
  isCollapsed: false,
});

export default function useMindMap(initialProjectId?: string) {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('Untitled');
  const [nodes, setNodes] = useState<MindNode[]>([]);
  const [design, setDesign] = useState<DesignConfig>(THEME_PRESETS[0]);
  const [orientation, setOrientation] = useState<LayoutOrientation>('vertical');
  const [projects, setProjects] = useState<MindMapProject[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [projectContextMenu, setProjectContextMenu] = useState<{ x: number; y: number; projectId: string } | null>(null);
  const [newProjectDialog, setNewProjectDialog] = useState(false);
  const [renameProjectDialog, setRenameProjectDialog] = useState({ open: false, projectId: '', currentName: '' });
  const [deleteProjectDialog, setDeleteProjectDialog] = useState({ open: false, projectId: '' });
  const [saveAsDialog, setSaveAsDialog] = useState(false);
  const [aiGenerationDialog, setAiGenerationDialog] = useState(false);
  const [aiNodeDialog, setAiNodeDialog] = useState({ open: false, nodeId: '', prompt: '' });
  const [newProjectName, setNewProjectName] = useState('');
  const [saveAsName, setSaveAsName] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize nodes only once on client side
  useEffect(() => {
    setNodes([getDefaultRootNode(window.innerWidth)]);
    setProjectName('Untitled');
  }, []);

  // Canvas interactions hook (pan, zoom, drag)
  const canvasProps = useCanvasInteractions({ nodes, setNodes, canvasState: { offset: { x: 0, y: 0 }, zoom: 1 } });

  // Firebase subscription
  useEffect(() => {
    const unsubscribe = subscribeToProjects((allProjects) => {
      setProjects(allProjects);
      if (initialProjectId) {
        const project = allProjects.find(p => p.id === initialProjectId);
        if (project) {
          setNodes(project.nodes);
          setProjectName(project.name);
          setOrientation(project.orientation);
          setCurrentProjectId(project.id);
        }
      }
    });
    return () => unsubscribe();
  }, [initialProjectId]);

  // Auto-save
  useEffect(() => {
    if (!currentProjectId || nodes.length === 0) return;
    setIsSyncing(true);
    const timer = setTimeout(() => {
      saveProject(currentProjectId, projectName, nodes, orientation)
        .then(() => setIsSyncing(false))
        .catch(() => setIsSyncing(false));
    }, 1500);
    return () => clearTimeout(timer);
  }, [nodes, orientation, currentProjectId, projectName]);

  const rootNode = useMemo(() => nodes.find((n) => n.id === 'root' || !n.parentId), [nodes]);

  const isNodeVisible = useCallback(
    (nodeId: string): boolean => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return false;
      if (node.id === 'root' || !node.parentId) return true;

      const parent = nodes.find((n) => n.id === node.parentId);
      if (!parent || parent.isCollapsed) return false;

      return isNodeVisible(parent.id);
    },
    [nodes]
  );

  const visibleNodes = useMemo(() => nodes.filter((n) => isNodeVisible(n.id)), [nodes, isNodeVisible]);

  const handleNewProject = () => {
    setNewProjectDialog(true);
  };

  const createNewProject = async () => {
    if (!newProjectName.trim()) return;

    const newId = crypto.randomUUID();
    const newRoot = getDefaultRootNode(window.innerWidth);
    newRoot.subLabel = 'Root';

    setNodes([newRoot]);
    setProjectName(newProjectName);
    setCurrentProjectId(newId);
    setNewProjectDialog(false);
    setNewProjectName('');

    try {
      await saveProject(newId, newProjectName, [newRoot], orientation);
      window.history.pushState(null, '', `/${newId}`);
    } catch (err) {
      console.error('Failed to save new project:', err);
    }

    canvasProps.resetView();
    setIsSidebarOpen(false);
  };

  const handleLoadProject = (project: MindMapProject) => {
    // Use window.history.pushState to change URL without reload
    window.history.pushState(null, '', `/${project.id}`);
    setNodes(project.nodes);
    setProjectName(project.name);
    setOrientation(project.orientation);
    setCurrentProjectId(project.id);
    canvasProps.resetView();
    setIsSidebarOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    setDeleteProjectDialog({ open: true, projectId: id });
  };

  const deleteProjectConfirm = async () => {
    const { projectId } = deleteProjectDialog;
    if (!projectId) return;
    await deleteProject(projectId);
    if (currentProjectId === projectId) {
      setCurrentProjectId(null);
      setProjectName('Untitled');
      setNodes([getDefaultRootNode(window.innerWidth)]);
    }
    setDeleteProjectDialog({ open: false, projectId: '' });
  };

  const handleExportJSON = () => {
    const data = { projectName, nodes, orientation };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName || 'mindmap'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };



  const handleProjectRename = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    setRenameProjectDialog({ open: true, projectId: id, currentName: project.name });
  };

  const renameProject = async () => {
    const { projectId, currentName } = renameProjectDialog;
    if (!projectId || !currentName.trim()) return;
    const project = projects.find(p => p.id === projectId);
    if (!project || currentName === project.name) return;
    try {
      await saveProject(projectId, currentName, project.nodes, project.orientation);
      setRenameProjectDialog({ open: false, projectId: '', currentName: '' });
    } catch (err) {
      console.error('Failed to rename project:', err);
    }
  };

  const handleSaveAs = () => {
    setSaveAsName(projectName);
    setSaveAsDialog(true);
  };

  const saveAsProject = async () => {
    if (!saveAsName.trim()) return;

    const newId = crypto.randomUUID();

    setProjectName(saveAsName);
    setCurrentProjectId(newId);
    setSaveAsDialog(false);
    setSaveAsName('');

    try {
      await saveProject(newId, saveAsName, nodes, orientation);
      window.history.pushState(null, '', `/${newId}`);
    } catch (err) {
      console.error('Failed to save as new project:', err);
    }

    canvasProps.resetView();
    setIsSidebarOpen(false);
  };

  const handleFullAIGeneration = () => {
    setAiGenerationDialog(true);
  };

  const generateAiMap = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setAiGenerationDialog(false);
    setIsSidebarOpen(false);

    try {
      const fullTree = await generateFullTree(aiPrompt);
      const newNodes: MindNode[] = [];

      const processNode = (n: AiTreeResponse, parentX: number, parentY: number, level: number, parentId?: string): string => {
        const id = crypto.randomUUID();
        const childCount = n.children?.length || 0;
        const spread = orientation === 'vertical' ? H_SPACING * 1.5 : V_SPACING * 1.5;

        const node: MindNode = {
          id,
          text: n.text,
          type: n.type,
          color: NODE_TYPE_COLORS[n.type as keyof typeof NODE_TYPE_COLORS],
          x: parentX,
          y: parentY,
          width: NODE_WIDTH,
          height: INITIAL_NODE_HEIGHT,
          parentId,
          childrenIds: [],
          isCollapsed: false
        };
        newNodes.push(node);

        if (n.children) {
          n.children.forEach((child: AiTreeResponse, idx: number) => {
            const offset = (idx - (childCount - 1) / 2) * (spread / (level + 1));
            const childX = orientation === 'vertical' ? parentX + offset : parentX + H_SPACING;
            const childY = orientation === 'vertical' ? parentY + V_SPACING : parentY + offset;
            node.childrenIds.push(processNode(child, childX, childY, level + 1, id));
          });
        }
        return id;
      };

      processNode(fullTree, window.innerWidth / 2 - NODE_WIDTH / 2, 120, 0);
      setNodes(newNodes);
      setProjectName(aiPrompt);
      setAiPrompt('');
      if (!currentProjectId) setCurrentProjectId(crypto.randomUUID());
    } catch (e) {
      console.error("AI Generation failed:", e);
      alert("AI Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBrainstorm = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, loading: true } : n));
    setAiNodeDialog({ open: true, nodeId, prompt: node?.text || '' });
  };

  const expandNodeAi = async () => {
    const { nodeId, prompt } = aiNodeDialog;
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !prompt.trim()) return;

    setAiNodeDialog({ open: false, nodeId: '', prompt: '' });

    try {
      const currentChildren = nodes.find(n => n.id === aiNodeDialog.nodeId)?.childrenIds.length || 0;
      const expansions = (await getAiExpansion(prompt)).slice(0, Math.max(0, 2 - currentChildren));
      expansions.forEach((exp, idx) => {
        setTimeout(() => {
          setNodes(prev => {
            const parent = prev.find(p => p.id === nodeId);
            if (!parent) return prev;

            const newId = crypto.randomUUID();
            const siblingCount = parent.childrenIds.length;
            let childX, childY;

            if (orientation === 'vertical') {
              childX = parent.x + (siblingCount % 2 === 0 ? (siblingCount + 1) * 200 : -(siblingCount + 1) * 200);
              childY = parent.y + (parent.height || INITIAL_NODE_HEIGHT) + 120;
            } else {
              childX = parent.x + NODE_WIDTH + 140;
              childY = parent.y + (siblingCount % 2 === 0 ? (siblingCount + 1) * 200 : -(siblingCount + 1) * 200);
            }

            const newNode: MindNode = {
              id: newId, text: exp.text, type: exp.type, color: NODE_TYPE_COLORS[exp.type],
              x: childX, y: childY, width: NODE_WIDTH, height: INITIAL_NODE_HEIGHT,
              parentId: nodeId, childrenIds: [], isCollapsed: false
            };

            return prev.map(n => n.id === nodeId ? { ...n, childrenIds: [...n.childrenIds, newId], isCollapsed: false } : n).concat(newNode);
          });
        }, idx * 250);
      });
    } catch (e) { console.error(e); } finally {
      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, loading: false } : n));
    }
  };

  return {
    nodes,
    setNodes,
    visibleNodes,
    canvas: canvasProps.canvas,
    design,
    setDesign,
    orientation,
    setOrientation,
    projects,
    currentProjectId,
    projectName,
    setProjectName,
    isSidebarOpen,
    setIsSidebarOpen,
    isGenerating,
    isSyncing,
    contextMenu,
    setContextMenu,
    projectContextMenu,
    setProjectContextMenu,
    rootNode,
    handleNewProject,
    handleLoadProject,
    handleDeleteProject,
    handleProjectRename,
    handleExportJSON,
    handleSaveAs,
    newProjectDialog,
    setNewProjectDialog,
    renameProjectDialog,
    setRenameProjectDialog,
    deleteProjectDialog,
    setDeleteProjectDialog,
    saveAsDialog,
    setSaveAsDialog,
    aiGenerationDialog,
    setAiGenerationDialog,
    newProjectName,
    setNewProjectName,
    saveAsName,
    setSaveAsName,
    aiPrompt,
    setAiPrompt,
    aiNodeDialog,
    setAiNodeDialog,
    searchTerm,
    setSearchTerm,
    createNewProject,
    renameProject,
    deleteProjectConfirm,
    saveAsProject,
    generateAiMap,
    expandNodeAi,
    handleFullAIGeneration,
    handleBrainstorm,
    canvasProps,
    draggedNodeId: canvasProps.draggedNodeId,
  };
}