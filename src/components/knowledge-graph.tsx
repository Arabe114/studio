"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ChevronRight, Folder, Star, Paperclip, FilePlus, FolderPlus, Trash2, Upload, FileCode, Link as LinkIcon, Edit } from 'lucide-react';
import ForceGraph from './force-graph';
import type { Node, Link } from './force-graph';
import { Button } from './ui/button';

const initialData = {
  nodes: [
    { id: 'Project A', group: 1 },
    { id: 'Team Lead', group: 1 },
    { id: 'Task 1.1', group: 1 },
    { id: 'Task 1.2', group: 1 },
    { id: 'Project B', group: 2 },
    { id: 'Developer X', group: 2 },
    { id: 'Task 2.1', group: 2 },
    { id: 'Bug Report', group: 3 },
    { id: 'QA Tester', group: 3 },
    { id: 'Documentation', group: 4 },
  ],
  links: [
    { source: 'Project A', target: 'Team Lead', value: 1 },
    { source: 'Team Lead', target: 'Task 1.1', value: 8 },
    { source: 'Team Lead', target: 'Task 1.2', value: 3 },
    { source: 'Project B', target: 'Developer X', value: 1 },
    { source: 'Developer X', target: 'Task 2.1', value: 5 },
    { source: 'Developer X', target: 'Bug Report', value: 1 },
    { source: 'Bug Report', target: 'QA Tester', value: 1 },
    { source: 'Project A', target: 'Documentation', value: 2 },
    { source: 'Project B', target: 'Documentation', value: 2 },
    { source: 'Task 1.1', target: 'Task 2.1', value: 1 },
  ],
};

export default function KnowledgeGraph() {
  const [repelStrength, setRepelStrength] = useState(-500);
  const [linkDistance, setLinkDistance] = useState(50);
  const [centerForce, setCenterForce] = useState(true);
  const [graphData, setGraphData] = useState<{ nodes: Node[], links: Link[] }>(initialData);
  
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [linkingNodes, setLinkingNodes] = useState<Node[]>([]);
  const [editingNodeName, setEditingNodeName] = useState('');

  useEffect(() => {
    if (selectedNode) {
      setEditingNodeName(selectedNode.id);
    } else {
      setEditingNodeName('');
    }
  }, [selectedNode]);

  const handleNodeClick = (node: Node | null) => {
    if (linkingNodes.length === 1 && node && linkingNodes[0].id !== node.id) {
      // If we are in linking mode and click a different node, add it for linking
      setLinkingNodes(prev => [...prev, node]);
      setSelectedNode(null); // Deselect any primary node
    } else {
      // Otherwise, handle normal selection
      setSelectedNode(node);
      setLinkingNodes(node ? [node] : []);
    }
  };

  const handleAddNode = () => {
    const newNodeId = `New Node ${graphData.nodes.length + 1}`;
    const newNode: Node = { id: newNodeId, group: 5 };
    const newLink: Link | null = selectedNode ? { source: selectedNode.id, target: newNodeId, value: 1 } : null;

    setGraphData(prev => ({
      nodes: [...prev.nodes, newNode],
      links: newLink ? [...prev.links, newLink] : prev.links
    }));
  };

  const handleAddFolder = () => {
    const newFolderId = `New Folder ${graphData.nodes.length + 1}`;
    const newNode: Node = { id: newFolderId, group: 6 }; // Different group for folders
     const newLink: Link | null = selectedNode ? { source: selectedNode.id, target: newFolderId, value: 1 } : null;

    setGraphData(prev => ({
      nodes: [...prev.nodes, newNode],
      links: newLink ? [...prev.links, newLink] : prev.links
    }));
  };
  
  const handleDeleteSelected = () => {
    if (!selectedNode) return;

    setGraphData(prev => {
      const newNodes = prev.nodes.filter(node => node.id !== selectedNode.id);
      const newLinks = prev.links.filter(link => 
        (link.source as Node).id !== selectedNode.id && (link.target as Node).id !== selectedNode.id &&
        link.source !== selectedNode.id && link.target !== selectedNode.id
      );
      return { nodes: newNodes, links: newLinks };
    });
    setSelectedNode(null);
  };
  
  const handleCreateLink = () => {
    if (linkingNodes.length !== 2) return;
    const [source, target] = linkingNodes;
    
    // Avoid creating duplicate links
    const linkExists = graphData.links.some(
      l => ((l.source as Node).id === source.id && (l.target as Node).id === target.id) ||
           ((l.source as Node).id === target.id && (l.target as Node).id === source.id)
    );

    if (!linkExists) {
      const newLink = { source: source.id, target: target.id, value: 1 };
      setGraphData(prev => ({ ...prev, links: [...prev.links, newLink]}));
    }
    setLinkingNodes([]);
    setSelectedNode(null);
  }

  const handleUpdateNodeName = () => {
    if (!selectedNode || !editingNodeName || selectedNode.id === editingNodeName) return;

    setGraphData(prev => {
      const isIdTaken = prev.nodes.some(n => n.id === editingNodeName);
      if (isIdTaken) {
        alert("A node with this name already exists.");
        return prev;
      }

      const newNodes = prev.nodes.map(node => 
        node.id === selectedNode.id ? { ...node, id: editingNodeName } : node
      );

      const newLinks = prev.links.map(link => {
        let newSource = link.source;
        let newTarget = link.target;
        if ((link.source as Node).id === selectedNode.id) {
          newSource = editingNodeName;
        } else if (link.source === selectedNode.id) {
          newSource = editingNodeName;
        }
        if ((link.target as Node).id === selectedNode.id) {
          newTarget = editingNodeName;
        } else if (link.target === selectedNode.id) {
          newTarget = editingNodeName;
        }
        return { ...link, source: newSource, target: newTarget };
      });
      
      const newSelectedNode = { ...selectedNode, id: editingNodeName };
      setSelectedNode(newSelectedNode);
      setLinkingNodes([newSelectedNode]);
      
      return { nodes: newNodes, links: newLinks };
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full min-h-[85vh]">
      <Card className="lg:col-span-1 bg-card/50 hidden lg:block">
        <CardHeader>
          <h2 className="text-lg font-semibold">File Explorer</h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>
              <details open className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
                  <Star className="h-4 w-4 shrink-0 text-yellow-500" />
                  <span className="truncate">Favorites</span>
                </summary>
                <ul className="pl-6 pt-1 space-y-1">
                  <li className="text-muted-foreground hover:text-foreground cursor-pointer truncate">Project Plan</li>
                  <li className="text-muted-foreground hover:text-foreground cursor-pointer truncate">Meeting Notes</li>
                </ul>
              </details>
            </li>
            <li>
              <details open className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
                  <Folder className="h-4 w-4 shrink-0 text-blue-500" />
                  <span className="truncate">ELN</span>
                </summary>
                <ul className="pl-6 pt-1 space-y-1">
                  <li className="text-muted-foreground hover:text-foreground cursor-pointer truncate">Experiment 1</li>
                  <li className="text-muted-foreground hover:text-foreground cursor-pointer truncate">Experiment 2</li>
                </ul>
              </details>
            </li>
            <li>
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
                  <Paperclip className="h-4 w-4 shrink-0 text-gray-500" />
                  <span className="truncate">Attachments</span>
                </summary>
                 <ul className="pl-6 pt-1 space-y-1">
                  <li className="text-muted-foreground hover:text-foreground cursor-pointer truncate">image.png</li>
                </ul>
              </details>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 h-[50vh] lg:h-full rounded-lg border bg-background relative">
        <ForceGraph 
          data={graphData}
          onNodeClick={handleNodeClick}
          selectedNodeId={selectedNode?.id || null}
          linkingNodeIds={linkingNodes.map(n => n.id)}
          repelStrength={repelStrength}
          linkDistance={linkDistance}
          centerForce={centerForce}
        />
        {linkingNodes.length > 0 && (
          <div className="absolute top-2 left-2 bg-card/80 p-2 rounded-lg text-sm shadow-lg animate-in fade-in-50">
            <p className="font-semibold">Linking Nodes:</p>
            <ul className="list-disc list-inside">
                {linkingNodes.map(node => <li key={node.id}>{node.id}</li>)}
            </ul>
            {linkingNodes.length === 1 && <p className="text-muted-foreground text-xs mt-1">Select another node to create a link.</p>}
            {linkingNodes.length === 2 && <Button size="sm" className="mt-2 w-full" onClick={handleCreateLink}>Create Link</Button>}
          </div>
        )}
      </div>

      <Card className="lg:col-span-1 bg-card/50">
        <CardHeader>
          <h2 className="text-lg font-semibold">Controls</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input placeholder="Search nodes..." />

          {selectedNode && (
            <div className="space-y-2 animate-in fade-in-50">
              <h3 className="font-medium">Edit Node: <span className="font-normal text-muted-foreground">{selectedNode.id}</span></h3>
              <div className="flex gap-2">
                <Input
                  value={editingNodeName}
                  onChange={(e) => setEditingNodeName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateNodeName()}
                  placeholder="New node name..."
                />
                <Button variant="outline" size="icon" onClick={handleUpdateNodeName} title="Rename Node"><Edit /></Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-medium">Actions</h3>
            <div className="grid grid-cols-2 gap-2">
               <Button variant="outline" size="sm" onClick={handleAddNode}><FilePlus /> New Node</Button>
               <Button variant="outline" size="sm" onClick={handleAddFolder}><FolderPlus /> New Folder</Button>
               <Button variant="outline" size="sm" onClick={handleCreateLink} disabled={linkingNodes.length !== 2}><LinkIcon /> Link Nodes</Button>
               <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={!selectedNode}><Trash2 /> Delete</Button>
            </div>
             <div className="grid grid-cols-1 gap-2 pt-2">
              <Button variant="outline" size="sm" className="w-full"><Upload /> Import Folder</Button>
              <Button variant="outline" size="sm" className="w-full"><FileCode /> Add Project Files</Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Forces</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="center-force">Center</Label>
              <Switch id="center-force" checked={centerForce} onCheckedChange={setCenterForce} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repel-force">Repel ({repelStrength})</Label>
              <Slider 
                id="repel-force" 
                min={-1000} 
                max={0} 
                step={50} 
                value={[repelStrength]} 
                onValueChange={(value) => setRepelStrength(value[0])}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-force">Link Distance ({linkDistance})</Label>
              <Slider 
                id="link-force" 
                min={10} 
                max={200} 
                step={10} 
                value={[linkDistance]} 
                onValueChange={(value) => setLinkDistance(value[0])}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
