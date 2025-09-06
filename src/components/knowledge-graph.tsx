"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Edit, FilePlus, FolderPlus, Link as LinkIcon, Trash2, Upload } from 'lucide-react';
import ForceGraph from './force-graph';
import type { Node, Link, GraphData } from './force-graph';
import { Button } from './ui/button';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, deleteDoc, setDoc, writeBatch } from 'firebase/firestore';


const initialGraphData: GraphData = {
    nodes: [],
    links: []
};

export default function KnowledgeGraph() {
  const [repelStrength, setRepelStrength] = useState(-500);
  const [linkDistance, setLinkDistance] = useState(50);
  const [centerForce, setCenterForce] = useState(true);
  const [graphData, setGraphData] = useState<GraphData>(initialGraphData);
  
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [linkingNodes, setLinkingNodes] = useState<Node[]>([]);
  const [editingNodeName, setEditingNodeName] = useState('');

  useEffect(() => {
    const unsubNodes = onSnapshot(collection(db, 'kg-nodes'), (snapshot) => {
      const nodes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Node));
      setGraphData(prev => ({ ...prev, nodes }));
    });

    const unsubLinks = onSnapshot(collection(db, 'kg-links'), (snapshot) => {
      const links = snapshot.docs.map(doc => doc.data() as Link);
      setGraphData(prev => ({ ...prev, links }));
    });

    return () => {
      unsubNodes();
      unsubLinks();
    };
  }, []);


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

  const handleAddNode = useCallback(async (isFolder = false) => {
    const baseName = isFolder ? "New Folder" : "New Node";
    const newNodeData = { 
        group: isFolder ? 6 : 5
    };
    let newNodeId = `${baseName} ${Date.now()}`;
    let counter = 1;
    while(graphData.nodes.some(n => n.id === newNodeId)) {
        newNodeId = `${baseName} ${Date.now()} (${counter++})`;
    }
    
    await setDoc(doc(db, "kg-nodes", newNodeId), newNodeData);

    if (selectedNode) {
        const newLink = { source: selectedNode.id, target: newNodeId, value: 1 };
        const linkId = `${selectedNode.id}-${newNodeId}`;
        await setDoc(doc(db, "kg-links", linkId), newLink);
    }
  }, [selectedNode, graphData.nodes]);
  
  const handleDeleteSelected = async () => {
    if (!selectedNode) return;

    const batch = writeBatch(db);
    
    const nodeRef = doc(db, "kg-nodes", selectedNode.id);
    batch.delete(nodeRef);
    
    const linksToDelete = graphData.links.filter(link => {
        const sourceId = (link.source as any).id || link.source;
        const targetId = (link.target as any).id || link.target;
        return sourceId === selectedNode.id || targetId === selectedNode.id;
    });

    for (const link of linksToDelete) {
        const sourceId = (link.source as any).id || link.source;
        const targetId = (link.target as any).id || link.target;
        const linkRef = doc(db, "kg-links", `${sourceId}-${targetId}`);
        batch.delete(linkRef);
        const reverseLinkRef = doc(db, "kg-links", `${targetId}-${sourceId}`);
        batch.delete(reverseLinkRef);
    }

    await batch.commit();

    setSelectedNode(null);
    setLinkingNodes([]);
  };
  
  const handleCreateLink = async () => {
    if (linkingNodes.length !== 2) return;
    const [source, target] = linkingNodes;
    
    const linkExists = graphData.links.some(
        l => (((l.source as any).id || l.source) === source.id && ((l.target as any).id || l.target) === target.id) ||
             (((l.source as any).id || l.source) === target.id && ((l.target as any).id || l.target) === source.id)
    );

    if (linkExists) {
        setLinkingNodes([]);
        setSelectedNode(null);
        return;
    };
    
    const newLink = { source: source.id, target: target.id, value: 1 };
    const linkId = `${source.id}-${target.id}`;
    await setDoc(doc(db, "kg-links", linkId), newLink);

    setLinkingNodes([]);
    setSelectedNode(null);
  }

   const handleLinkAll = async () => {
    if (linkingNodes.length < 2) return;
    const batch = writeBatch(db);

    for (let i = 0; i < linkingNodes.length; i++) {
        for (let j = i + 1; j < linkingNodes.length; j++) {
            const source = linkingNodes[i];
            const target = linkingNodes[j];
            const linkExists = graphData.links.some(
                l => (((l.source as any).id || l.source) === source.id && ((l.target as any).id || l.target) === target.id) ||
                     (((l.source as any).id || l.source) === target.id && ((l.target as any).id || l.target) === source.id)
            );
            if (!linkExists) {
                const newLink = { source: source.id, target: target.id, value: 1 };
                const linkId = `${source.id}-${target.id}`;
                const linkRef = doc(db, "kg-links", linkId);
                batch.set(linkRef, newLink);
            }
        }
    }
    
    await batch.commit();
    setLinkingNodes([]);
    setSelectedNode(null);
  };

  const handleUpdateNodeName = async () => {
    if (!selectedNode || !editingNodeName || selectedNode.id === editingNodeName) return;

    const nodeExists = graphData.nodes.some(n => n.id === editingNodeName);
    if (nodeExists) {
        alert("A node with this name already exists.");
        setEditingNodeName(selectedNode.id);
        return;
    }
    const batch = writeBatch(db);

    // Create new node with new name
    const newNodeRef = doc(db, 'kg-nodes', editingNodeName);
    batch.set(newNodeRef, { group: selectedNode.group });

    // Re-create links with new node name
    const relatedLinks = graphData.links.filter(l => {
        const sourceId = (l.source as any).id || l.source;
        const targetId = (l.target as any).id || l.target;
        return sourceId === selectedNode.id || targetId === selectedNode.id;
    });

    relatedLinks.forEach(l => {
        const sourceId = (l.source as any).id || l.source;
        const targetId = (l.target as any).id || l.target;
        
        const oldLinkRef1 = doc(db, 'kg-links', `${sourceId}-${targetId}`);
        batch.delete(oldLinkRef1);
        const oldLinkRef2 = doc(db, 'kg-links', `${targetId}-${sourceId}`);
        batch.delete(oldLinkRef2);

        const newSource = sourceId === selectedNode.id ? editingNodeName : sourceId;
        const newTarget = targetId === selectedNode.id ? editingNodeName : targetId;
        const newLinkId = `${newSource}-${newTarget}`;
        const newLinkRef = doc(db, 'kg-links', newLinkId);
        batch.set(newLinkRef, { source: newSource, target: newTarget, value: l.value });
    });
    
    const oldNodeRef = doc(db, 'kg-nodes', selectedNode.id);
    batch.delete(oldNodeRef);

    await batch.commit();

    setSelectedNode(prev => prev ? { ...prev, id: editingNodeName } : null);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full min-h-[85vh]">
      <Card className="lg:col-span-1 bg-card/50 hidden lg:block">
        <CardHeader>
          <h2 className="text-lg font-semibold">File Explorer</h2>
        </CardHeader>
        <CardContent>
          {}
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
