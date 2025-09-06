"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Edit, FilePlus, FolderPlus, Link as LinkIcon, Trash2, ChevronRight, Folder, File, Check } from 'lucide-react';
import ForceGraph from './force-graph';
import type { Node as GraphNode, Link, GraphData } from './force-graph';
import { Button } from './ui/button';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, deleteDoc, setDoc, writeBatch, query, where, getDocs } from 'firebase/firestore';
import { cn } from '@/lib/utils';


type Node = GraphNode & {
    type: 'file' | 'folder';
    parentId: string | null;
};

const initialGraphData: GraphData = {
    nodes: [],
    links: []
};

function FileExplorer({ nodes, selectedFolderId, onSelectFolder, onRename, onDelete }) {
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editingFolderName, setEditingFolderName] = useState('');

    const handleRenameStart = (e, node: Node) => {
        e.stopPropagation();
        setEditingFolderId(node.id);
        setEditingFolderName(node.id);
    };

    const handleRenameConfirm = (e) => {
        e.stopPropagation();
        if (editingFolderId && editingFolderName) {
            onRename(editingFolderId, editingFolderName);
        }
        setEditingFolderId(null);
        setEditingFolderName('');
    };
    
    const handleDelete = (e, nodeId) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete this folder and all its contents?`)) {
            onDelete(nodeId);
        }
    }

    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev => ({...prev, [folderId]: !prev[folderId]}));
    };
    
    const rootNodes = useMemo(() => nodes.filter(n => n.parentId === null), [nodes]);

    const renderTree = (nodesToRender: Node[], level = 0) => {
        return nodesToRender.map(node => {
            const isFolder = node.type === 'folder';
            const children = isFolder ? nodes.filter(n => n.parentId === node.id) : [];
            const isExpanded = expandedFolders[node.id] ?? true;

            return (
                <div key={node.id} style={{ marginLeft: `${level * 1.5}rem`}}>
                   <div 
                     className={cn(
                        "group flex items-center gap-2 p-1 rounded-md cursor-pointer hover:bg-accent",
                        selectedFolderId === node.id && "bg-accent"
                     )}
                     onClick={() => onSelectFolder(node.id)}
                    >
                       {isFolder && <ChevronRight className={cn("h-4 w-4 transform transition-transform", isExpanded && "rotate-90")} onClick={(e) => { e.stopPropagation(); toggleFolder(node.id); }} />}
                       {!isFolder && <div className="w-4"></div>}
                       {isFolder ? <Folder className="h-4 w-4 text-primary"/> : <File className="h-4 w-4 text-muted-foreground"/>}
                       
                       {editingFolderId === node.id ? (
                           <Input 
                                value={editingFolderName}
                                onChange={(e) => setEditingFolderName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRenameConfirm(e)}
                                onBlur={handleRenameConfirm}
                                onClick={(e) => e.stopPropagation()}
                                className="h-7"
                                autoFocus
                           />
                       ) : (
                           <span className="truncate flex-grow">{node.id}</span>
                       )}

                       {isFolder && editingFolderId !== node.id && (
                           <div className="flex items-center ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => handleRenameStart(e, node)} title="Rename Folder">
                                   <Edit className="h-3 w-3" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => handleDelete(e, node.id)} title="Delete Folder">
                                   <Trash2 className="h-3 w-3" />
                               </Button>
                           </div>
                       )}
                   </div>
                    {isFolder && isExpanded && (
                        <div>{renderTree(children, level + 1)}</div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="space-y-2">
            <div 
                className={cn("flex items-center gap-2 p-1 rounded-md cursor-pointer hover:bg-accent", selectedFolderId === null && "bg-accent")}
                onClick={() => onSelectFolder(null)}
            >
                <Folder className="h-4 w-4 text-primary" />
                <span>All Files</span>
            </div>
            {renderTree(rootNodes)}
        </div>
    );
}


export default function KnowledgeGraph() {
  const [repelStrength, setRepelStrength] = useState(-500);
  const [linkDistance, setLinkDistance] = useState(50);
  const [centerForce, setCenterForce] = useState(true);
  
  const [allNodes, setAllNodes] = useState<Node[]>([]);
  const [allLinks, setAllLinks] = useState<Link[]>([]);
  const [filteredGraphData, setFilteredGraphData] = useState<GraphData>(initialGraphData);
  
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [linkingNodes, setLinkingNodes] = useState<Node[]>([]);
  const [editingNodeName, setEditingNodeName] = useState('');

  useEffect(() => {
    const unsubNodes = onSnapshot(collection(db, 'kg-nodes'), (snapshot) => {
      const nodes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Node));
      nodes.sort((a,b) => a.id.localeCompare(b.id));
      setAllNodes(nodes);
    });

    const unsubLinks = onSnapshot(collection(db, 'kg-links'), (snapshot) => {
      const links = snapshot.docs.map(doc => doc.data() as Link);
      setAllLinks(links);
    });

    return () => {
      unsubNodes();
      unsubLinks();
    };
  }, []);
  
  useEffect(() => {
      let visibleNodes: Node[];
      if(selectedFolderId === null) {
          visibleNodes = allNodes;
      } else {
          const getChildrenRecursive = (folderId: string): Node[] => {
              const directChildren = allNodes.filter(n => n.parentId === folderId);
              return [
                  ...directChildren,
                  ...directChildren.filter(n => n.type === 'folder').flatMap(f => getChildrenRecursive(f.id))
              ];
          };
          const parentFolder = allNodes.find(n => n.id === selectedFolderId);
          visibleNodes = parentFolder ? [parentFolder, ...getChildrenRecursive(selectedFolderId)] : [];
      }

      const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
      const visibleLinks = allLinks.filter(l => {
          const sourceId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
          const targetId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
          return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
      });

      setFilteredGraphData({ nodes: visibleNodes, links: visibleLinks });

  }, [selectedFolderId, allNodes, allLinks]);


  useEffect(() => {
    if (selectedNode) {
      setEditingNodeName(selectedNode.id);
    } else {
      setEditingNodeName('');
    }
  }, [selectedNode]);

  const handleNodeClick = (node: GraphNode | null) => {
    const fullNode = node ? allNodes.find(n => n.id === node.id) : null;
    if (linkingNodes.length >= 1 && fullNode && !linkingNodes.some(n => n.id === fullNode.id)) {
      setLinkingNodes(prev => [...prev, fullNode]);
      setSelectedNode(null); 
    } else {
      setSelectedNode(fullNode);
      setLinkingNodes(fullNode ? [fullNode] : []);
    }
  };

  const handleAddNode = useCallback(async (isFolder = false) => {
    const type = isFolder ? "folder" : "file";
    const baseName = isFolder ? "New Folder" : "New Node";
    let newNodeId = `${baseName}`;
    let counter = 1;
    while(allNodes.some(n => n.id === newNodeId)) {
        newNodeId = `${baseName} (${counter++})`;
    }

    const newNodeData: Omit<Node, 'id'> = { 
        group: isFolder ? 6 : 5,
        type: type,
        parentId: selectedFolderId
    };
    
    await setDoc(doc(db, "kg-nodes", newNodeId), newNodeData);

    if (selectedNode && selectedNode.id !== newNodeId && selectedFolderId === null) {
        const newLink = { source: selectedNode.id, target: newNodeId, value: 1 };
        const linkId = `${selectedNode.id}-${newNodeId}`;
        await setDoc(doc(db, "kg-links", linkId), newLink);
    }
  }, [selectedNode, allNodes, selectedFolderId]);
  
    const deleteNodeAndChildren = useCallback(async (nodeId: string, batch: any) => {
        const nodeToDelete = allNodes.find(n => n.id === nodeId);
        if (!nodeToDelete) return;

        // Delete the node itself
        const nodeRef = doc(db, "kg-nodes", nodeId);
        batch.delete(nodeRef);

        // Delete associated links
        const linksQuerySnapshot = await getDocs(
            query(collection(db, 'kg-links'), where('source', '==', nodeId))
        );
        linksQuerySnapshot.forEach(linkDoc => batch.delete(linkDoc.ref));

        const linksQuerySnapshot2 = await getDocs(
            query(collection(db, 'kg-links'), where('target', '==', nodeId))
        );
        linksQuerySnapshot2.forEach(linkDoc => batch.delete(linkDoc.ref));

        // If it's a folder, recursively delete children
        if (nodeToDelete.type === 'folder') {
            const children = allNodes.filter(n => n.parentId === nodeId);
            for (const child of children) {
                await deleteNodeAndChildren(child.id, batch);
            }
        }
    }, [allNodes]);


  const handleDeleteSelected = async () => {
    if (!selectedNode) return;
    const batch = writeBatch(db);
    await deleteNodeAndChildren(selectedNode.id, batch);
    await batch.commit();

    setSelectedNode(null);
    setLinkingNodes([]);
  };

    const handleDeleteFolder = useCallback(async (folderId: string) => {
        const batch = writeBatch(db);
        await deleteNodeAndChildren(folderId, batch);
        await batch.commit();

        if (selectedFolderId === folderId) {
            setSelectedFolderId(null);
        }
        if(selectedNode?.id === folderId) {
            setSelectedNode(null);
            setLinkingNodes([]);
        }
    }, [deleteNodeAndChildren, selectedFolderId, selectedNode]);
  
  const handleCreateLink = async () => {
    if (linkingNodes.length !== 2) return;
    const [source, target] = linkingNodes;
    
    const linkExists = allLinks.some(
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
            const linkExists = allLinks.some(
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

    const handleUpdateNodeName = async (oldNodeId: string, newNodeName: string) => {
        if (!newNodeName || oldNodeId === newNodeName) return;

        const nodeExists = allNodes.some(n => n.id === newNodeName);
        if (nodeExists) {
            alert("A node or folder with this name already exists.");
            return;
        }
        
        const batch = writeBatch(db);
        const oldNodeData = allNodes.find(n => n.id === oldNodeId);
        if (!oldNodeData) return;

        // Create new node with new ID and same data
        const newNodeRef = doc(db, 'kg-nodes', newNodeName);
        batch.set(newNodeRef, { 
            group: oldNodeData.group,
            type: oldNodeData.type,
            parentId: oldNodeData.parentId
        });

        // Re-create links with new node name
        const relatedLinks = allLinks.filter(l => {
            const sourceId = (l.source as any).id || l.source;
            const targetId = (l.target as any).id || l.target;
            return sourceId === oldNodeId || targetId === oldNodeId;
        });

        relatedLinks.forEach(l => {
            const sourceId = (l.source as any).id || l.source;
            const targetId = (l.target as any).id || l.target;
            
            const oldLinkRef = doc(db, 'kg-links', `${sourceId}-${targetId}`);
            batch.delete(oldLinkRef);
            const oldReverseLinkRef = doc(db, 'kg-links', `${targetId}-${sourceId}`);
            batch.delete(oldReverseLinkRef);

            const newSource = sourceId === oldNodeId ? newNodeName : sourceId;
            const newTarget = targetId === oldNodeId ? newNodeName : targetId;
            const newLinkId = `${newSource}-${newTarget}`;
            const newLinkRef = doc(db, 'kg-links', newLinkId);
            batch.set(newLinkRef, { source: newSource, target: newTarget, value: l.value });
        });
        
        // Update parentId for all children if it was a folder
        if (oldNodeData.type === 'folder') {
            const children = allNodes.filter(n => n.parentId === oldNodeId);
            children.forEach(child => {
                const childRef = doc(db, 'kg-nodes', child.id);
                batch.update(childRef, { parentId: newNodeName });
            });
        }
        
        // Delete the old node
        const oldNodeRef = doc(db, 'kg-nodes', oldNodeId);
        batch.delete(oldNodeRef);

        await batch.commit();

        if (selectedNode?.id === oldNodeId) {
             setSelectedNode(prev => prev ? { ...prev, id: newNodeName } : null);
        }
        if (selectedFolderId === oldNodeId) {
            setSelectedFolderId(newNodeName);
        }
    }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full min-h-[85vh]">
      <Card className="lg:col-span-1 bg-card/50">
        <CardHeader>
          <h2 className="text-lg font-semibold">File Explorer</h2>
        </CardHeader>
        <CardContent>
           <FileExplorer 
                nodes={allNodes}
                selectedFolderId={selectedFolderId}
                onSelectFolder={setSelectedFolderId}
                onRename={handleUpdateNodeName}
                onDelete={handleDeleteFolder}
            />
        </CardContent>
      </Card>

      <div className="lg:col-span-2 h-[50vh] lg:h-full rounded-lg border bg-background relative">
        <ForceGraph 
          data={filteredGraphData}
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

          {selectedNode && selectedNode.type === 'file' && (
            <div className="space-y-2 animate-in fade-in-50">
              <h3 className="font-medium">Edit Selected: <span className="font-normal text-muted-foreground">{selectedNode.id}</span></h3>
              <div className="flex gap-2">
                <Input
                  value={editingNodeName}
                  onChange={(e) => setEditingNodeName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateNodeName(selectedNode.id, editingNodeName)}
                  placeholder="New name..."
                />
                <Button variant="outline" size="icon" onClick={() => handleUpdateNodeName(selectedNode.id, editingNodeName)} title="Rename Node"><Check /></Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-medium">Actions</h3>
            <div className="grid grid-cols-2 gap-2">
               <Button variant="outline" size="sm" onClick={() => handleAddNode(false)}><FilePlus /> New File</Button>
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

    