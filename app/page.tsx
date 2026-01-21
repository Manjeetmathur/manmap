// 1. src/app/page.tsx (Main entry point - slimmed down, just layout)

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import Toolbar from '@/components/Toolbar';
import ContextMenu from '@/components/ContextMenu';
import ProjectContextMenu from '@/components/ProjectContextMenu';
import Chatbot from '@/components/Chatbot';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useMindMap from '@/hooks/useMindMap';
import MindMapCanvas from '@/components/MindMapCanvas';

export default function MindMapPage() {
  const {
    nodes,
    setNodes,
    visibleNodes,
    canvas,
    design,
    setDesign,
    orientation,
    setOrientation,
    projects,
    currentProjectId,
    projectName,
    isSidebarOpen,
    setIsSidebarOpen,
    isGenerating,
    isSyncing,
    contextMenu,
    setContextMenu,
    projectContextMenu,
    setProjectContextMenu,
    rootNode,
    // Handlers
    handleNewProject,
    handleLoadProject,
    handleDeleteProject,
    handleProjectRename,
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
    createNewProject,
    renameProject,
    deleteProjectConfirm,
    saveAsProject,
    generateAiMap,
    expandNodeAi,
    handleFullAIGeneration,
    handleBrainstorm,
    // Canvas props
    canvasProps,
    draggedNodeId,
  } = useMindMap();


  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col"
      style={{ background: design.backgroundColor, color: design.textColor }}
    >
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        projects={projects}
        currentProjectId={currentProjectId}
        onNewProject={handleNewProject}
        onLoadProject={handleLoadProject}
        onDeleteProject={handleDeleteProject}
        onProjectRename={handleProjectRename}
        onSaveAs={handleSaveAs}
        onFullAIGeneration={handleFullAIGeneration}
        isGenerating={isGenerating}
        isSyncing={isSyncing}
        design={design}
        setProjectContextMenu={setProjectContextMenu}
      />


      <Toolbar
        onMenuClick={() => setIsSidebarOpen(true)}
        projectName={projectName}
        design={design}
        setDesign={setDesign}
        orientation={orientation}
        setOrientation={setOrientation}
        onResetView={() => canvasProps.resetView()}
        isSyncing={isSyncing}
      />
      <MindMapCanvas
        nodes={nodes}
        setNodes={setNodes}
        visibleNodes={visibleNodes}
        canvas={canvas}
        design={design}
        orientation={orientation}
        draggedNodeId={draggedNodeId}
        setContextMenu={setContextMenu}
        canvasProps={canvasProps}
        onAiExpand={handleBrainstorm}
      />


      {contextMenu && (
        <ContextMenu
          setNodes={setNodes}

          position={{ x: contextMenu.x, y: contextMenu.y }}
          nodeId={contextMenu.nodeId}
          nodes={nodes}
          design={design}
          onClose={() => setContextMenu(null)}
        />
      )}

      {projectContextMenu && (
        <ProjectContextMenu
          position={{ x: projectContextMenu.x, y: projectContextMenu.y }}
          projectId={projectContextMenu.projectId}
          projects={projects}
          onRename={handleProjectRename}
          onDelete={handleDeleteProject}
          onClose={() => setProjectContextMenu(null)}
        />
      )}

      <Dialog open={newProjectDialog} onOpenChange={setNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <Input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewProjectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createNewProject}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={renameProjectDialog.open} onOpenChange={(open) => setRenameProjectDialog({ ...renameProjectDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
          </DialogHeader>
          <Input
            value={renameProjectDialog.currentName}
            onChange={(e) => setRenameProjectDialog({ ...renameProjectDialog, currentName: e.target.value })}
            placeholder="New name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameProjectDialog({ open: false, projectId: '', currentName: '' })}>
              Cancel
            </Button>
            <Button onClick={renameProject}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteProjectDialog.open} onOpenChange={(open) => setDeleteProjectDialog({ ...deleteProjectDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this project? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProjectDialog({ open: false, projectId: '' })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteProjectConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={saveAsDialog} onOpenChange={setSaveAsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save As New Project</DialogTitle>
          </DialogHeader>
          <Input
            value={saveAsName}
            onChange={(e) => setSaveAsName(e.target.value)}
            placeholder="Project name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveAsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveAsProject}>Save As</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiGenerationDialog} onOpenChange={setAiGenerationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Mind Map Generation</DialogTitle>
          </DialogHeader>
          <Input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Enter a complex topic for AI to map out"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiGenerationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={generateAiMap}>Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiNodeDialog.open} onOpenChange={(open) => setAiNodeDialog({ ...aiNodeDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Node Expansion</DialogTitle>
          </DialogHeader>
          <Input
            value={aiNodeDialog.prompt}
            onChange={(e) => setAiNodeDialog({ ...aiNodeDialog, prompt: e.target.value })}
            placeholder="Enter prompt for AI expansion"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiNodeDialog({ open: false, nodeId: '', prompt: '' })}>
              Cancel
            </Button>
            <Button onClick={expandNodeAi}>Expand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Chatbot nodes={nodes} />
    </div>
  );
}