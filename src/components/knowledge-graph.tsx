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

const initialGraphData = {
    nodes: [],
    links: []
};

export default function KnowledgeGraph() {
  const [repelStrength, setRepelStrength] = useState(-500);
  const [linkDistance, setLinkDistance] = useState(50);
  const [centerForce, setCenterForce] = useState(true);
  const [graphData, setGraphData] = useState<{ nodes: Node[], links: Link[] }>(initialGraphData);
  
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
    if (linkingNodes.length >= 1 && node && !linkingNodes.some(n => n.id === node.id)) {
      setLinkingNodes(prev => [...prev, node]);
      setSelectedNode(null); 
    } else {
      setSelectedNode(node);
      setLinkingNodes(node ? [node] : []);
    }
  };

  const handleAddNode = (isFolder = false) => {
    const baseName = isFolder ? "New Folder" : "New Node";
    const newNode = { 
        id: `${baseName} ${Date.now()}`,
        group: isFolder ? 6 : 5
    };
    
    setGraphData(prev => {
        const newNodes = [...prev.nodes, newNode];
        let newLinks = [...prev.links];
        if (selectedNode) {
            newLinks.push({ source: selectedNode.id, target: newNode.id, value: 1 });
        }
        return { nodes: newNodes, links: newLinks };
    });
  };
  
  const handleDeleteSelected = () => {
    if (!selectedNode) return;
    setGraphData(prev => ({
        nodes: prev.nodes.filter(n => n.id !== selectedNode.id),
        links: prev.links.filter(l => (l.source as Node).id !== selectedNode.id && (l.target as Node).id !== selectedNode.id)
    }));
    setSelectedNode(null);
  };
  
  const handleCreateLink = () => {
    if (linkingNodes.length !== 2) return;
    const [source, target] = linkingNodes;
    
    setGraphData(prev => {
        const linkExists = prev.links.some(
            l => ((l.source as Node).id === source.id && (l.target as Node).id === target.id) ||
                 ((l.source as Node).id === target.id && (l.target as Node).id === source.id)
        );
        if (linkExists) return prev;
        
        return {
            ...prev,
            links: [...prev.links, { source: source.id, target: target.id, value: 1 }]
        };
    });
    setLinkingNodes([]);
    setSelectedNode(null);
  }

   const handleLinkAll = () => {
    if (linkingNodes.length < 2) return;
    setGraphData(prev => {
      const newLinks = [...prev.links];
      for (let i = 0; i < linkingNodes.length; i++) {
        for (let j = i + 1; j < linkingNodes.length; j++) {
          const source = linkingNodes[i];
          const target = linkingNodes[j];
           const linkExists = newLinks.some(
                l => ((l.source as Node).id === source.id && (l.target as Node).id === target.id) ||
                     ((l.source as Node).id === target.id && (l.target as Node).id === source.id)
            );
          if (!linkExists) {
            newLinks.push({ source: source.id, target: target.id, value: 1 });
          }
        }
      }
      return { ...prev, links: newLinks };
    });
    setLinkingNodes([]);
    setSelectedNode(null);
  };

  const handleUpdateNodeName = () => {
    if (!selectedNode || !editingNodeName || selectedNode.id === editingNodeName) return;

    setGraphData(prev => {
        const nodeExists = prev.nodes.some(n => n.id === editingNodeName);
        if (nodeExists) {
            alert("A node with this name already exists.");
            return prev;
        }

        return {
            nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, id: editingNodeName } : n),
            links: prev.links.map(l => {
                if ((l.source as Node).id === selectedNode.id) return { ...l, source: editingNodeName };
                if ((l.target as Node).id === selectedNode.id) return { ...l, target: editingNodeName };
                return l;
            })
        }
    });

    setSelectedNode(prev => prev ? { ...prev, id: editingNodeName } : null);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full min-h-[85vh]">
      <Card className="lg:col-span-1 bg-card/50 hidden lg:block">
        <CardHeader>
          <h2 className="text-lg font-semibold">File Explorer</h2>
        </CardHeader>
        <CardContent>
          {/* Mock data removed */}
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
            <p className="font-semibold">Linking Nodes ({linkingNodes.length}):</p>
            <ul className="list-disc list-inside max-h-32 overflow-y-auto">
                {linkingNodes.map(node => <li key={node.id} className="truncate">{node.id}</li>)}
            </ul>
            {linkingNodes.length === 1 && <p className="text-muted-foreground text-xs mt-1">Select another node to create a link.</p>}
            {linkingNodes.length === 2 && <Button size="sm" className="mt-2 w-full" onClick={handleCreateLink}>Create Link</Button>}
            {linkingNodes.length > 2 && <Button size="sm" className="mt-2 w-full" onClick={handleLinkAll}>Link All Selected</Button>}
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
               <Button variant="outline" size="sm" onClick={() => handleAddNode(false)}><FilePlus /> New Node</Button>
               <Button variant="outline" size="sm" onClick={() => handleAddNode(true)}><FolderPlus /> New Folder</Button>
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
              <Label htmlFor="link-force">Link Distance ({linkDistance})</Label>              <Slider 
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
