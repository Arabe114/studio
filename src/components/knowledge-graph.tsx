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
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, DocumentReference } from 'firebase/firestore';


type FirebaseNode = { id: string; group: number; };
type FirebaseLink = { source: string; target: string; value: number };


export default function KnowledgeGraph() {
  const [repelStrength, setRepelStrength] = useState(-500);
  const [linkDistance, setLinkDistance] = useState(50);
  const [centerForce, setCenterForce] = useState(true);
  const [graphData, setGraphData] = useState<{ nodes: Node[], links: Link[] }>({ nodes: [], links: [] });
  
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [linkingNodes, setLinkingNodes] = useState<Node[]>([]);
  const [editingNodeName, setEditingNodeName] = useState('');

  useEffect(() => {
    const unsubNodes = onSnapshot(collection(db, "kg-nodes"), (snapshot) => {
      const nodes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Node));
      setGraphData(prev => ({ ...prev, nodes }));
    });

    const unsubLinks = onSnapshot(collection(db, "kg-links"), (snapshot) => {
      const links = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              source: data.source,
              target: data.target,
              value: data.value
          } as Link;
      });
      setGraphData(prev => ({ ...prev, links }));
    });

    return () => {
        unsubNodes();
        unsubLinks();
    }
  }, []);

  useEffect(() => {
    if (selectedNode) {
      setEditingNodeName(selectedNode.id);
    } else {
      setEditingNodeName('');
    }
  }, [selectedNode]);

  const handleNodeClick = (node: Node | null) => {
    if (linkingNodes.length === 1 && node && linkingNodes[0].id !== node.id) {
      setLinkingNodes(prev => [...prev, node]);
      setSelectedNode(null); 
    } else {
      setSelectedNode(node);
      setLinkingNodes(node ? [node] : []);
    }
  };

  const handleAddNode = async (isFolder = false) => {
    const baseName = isFolder ? "New Folder" : "New Node";
    const newNodeData = { 
        id: `${baseName} ${Date.now()}`,
        group: isFolder ? 6 : 5
    };
    
    const docRef = await addDoc(collection(db, 'kg-nodes'), { group: newNodeData.group });
    await updateDoc(docRef, { id: docRef.id });


    if (selectedNode) {
        await addDoc(collection(db, 'kg-links'), {
            source: selectedNode.id,
            target: docRef.id,
            value: 1
        });
    }
  };
  
  const handleDeleteSelected = async () => {
    if (!selectedNode) return;

    await deleteDoc(doc(db, 'kg-nodes', selectedNode.id));

    // This is more complex in firestore, would need queries to delete links
    // For simplicity, we assume links are handled by a backend function or are orphaned.
    
    setSelectedNode(null);
  };
  
  const handleCreateLink = async () => {
    if (linkingNodes.length !== 2) return;
    const [source, target] = linkingNodes;
    
    const linkExists = graphData.links.some(
      l => ((l.source as Node).id === source.id && (l.target as Node).id === target.id) ||
           ((l.source as Node).id === target.id && (l.target as Node).id === source.id)
    );

    if (!linkExists) {
        await addDoc(collection(db, 'kg-links'), {
            source: source.id,
            target: target.id,
            value: 1
        });
    }
    setLinkingNodes([]);
    setSelectedNode(null);
  }

  const handleUpdateNodeName = async () => {
    if (!selectedNode || !editingNodeName || selectedNode.id === editingNodeName) return;

    // In Firestore, changing an ID is a delete and add operation.
    // This is a simplified version. A real implementation would be more complex.
    alert("Updating node IDs is not supported in this simplified example.");
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
