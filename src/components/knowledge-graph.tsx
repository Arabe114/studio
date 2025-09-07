"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Edit, FilePlus, FolderPlus, Link as LinkIcon, Link2Off, Trash2, ChevronRight, Folder, File, Check, Image as ImageIcon } from 'lucide-react';
import ForceGraph from './force-graph';
import type { Node as GraphNode, Link, GraphData } from './force-graph';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useLanguage } from '@/hooks/use-language';
import { useStorage } from '@/hooks/use-storage';
import { onSnapshot, doc, deleteDoc, setDoc, writeBatch, query, getDocs, updateDoc } from '@/lib/storage';


type Node = GraphNode & {
    type: 'file' | 'folder';
    parentId: string | null;
    imageUrl?: string;
};

const initialGraphData: GraphData = {
    nodes: [],
    links: []
};

function FileExplorer({ nodes, selectedNodeId, onSelectNode, onRename, onDelete, onSelectFolder, selectedFolderId, t }) {
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [editingNodeName, setEditingNodeName] = useState('');
    const [nodeToDelete, setNodeToDelete] = useState<Node | null>(null);

    const handleRenameStart = (e, node: Node) => {
        e.stopPropagation();
        setEditingNodeId(node.id);
        setEditingNodeName(node.id);
    };

    const handleRenameConfirm = (e) => {
        e.stopPropagation();
        if (editingNodeId && editingNodeName) {
            onRename(editingNodeId, editingNodeName);
        }
        setEditingNodeId(null);
        setEditingNodeName('');
    };
    
    const handleDeleteClick = (e, node: Node) => {
        e.stopPropagation();
        setNodeToDelete(node);
    }

    const confirmDelete = async () => {
        if(nodeToDelete) {
            await onDelete(nodeToDelete.id);
            setNodeToDelete(null);
        }
    }

    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev => ({...prev, [folderId]: !prev[folderId]}));
    };
    
    const rootNodes = useMemo(() => nodes.filter(n => n.parentId === null), [nodes]);

    const handleNodeClick = (e, node: Node) => {
        e.stopPropagation();
        if (node.type === 'folder') {
            onSelectFolder(node.id);
        } else {
            onSelectNode(node);
        }
    }

    const renderTree = (nodesToRender: Node[], level = 0) => {
        // Sort to show folders first, then files alphabetically
        nodesToRender.sort((a, b) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            return a.id.localeCompare(b.id);
        });

        return nodesToRender.map(node => {
            const isFolder = node.type === 'folder';
            const children = nodes.filter(n => n.parentId === node.id);
            const isExpanded = expandedFolders[node.id] ?? true;
            const isSelected = selectedNodeId === node.id || (isFolder && selectedFolderId === node.id);

            return (
                <div key={node.id} style={{ marginLeft: `${level * 1.5}rem`}}>
                   <div 
                     className={cn(
                        "group flex items-center gap-2 p-1 rounded-md cursor-pointer hover:bg-accent",
                        (isSelected || editingNodeId === node.id) && "bg-accent"
                     )}
                     onClick={(e) => handleNodeClick(e, node)}
                    >
                       {isFolder ? (
                           <ChevronRight className={cn("h-4 w-4 transform transition-transform", isExpanded && "rotate-90")} onClick={(e) => { e.stopPropagation(); toggleFolder(node.id); }} />
                       ): (
                           <div className="w-4 h-4" /> // Placeholder for alignment
                       )}
                       
                       {isFolder ? (
                           <Folder className={cn("h-4 w-4 text-primary transition-colors group-hover:text-accent-foreground", (isSelected || editingNodeId === node.id) && "text-accent-foreground")} />
                        ) : (
                            node.imageUrl ? (
                                <ImageIcon className={cn("h-4 w-4 text-primary transition-colors group-hover:text-accent-foreground", isSelected && "text-accent-foreground")} />
                            ) : (
                                <File className={cn("h-4 w-4 text-primary transition-colors group-hover:text-accent-foreground", isSelected && "text-accent-foreground")} />
                            )
                        )
                       }
                       
                       {editingNodeId === node.id ? (
                           <Input 
                                value={editingNodeName}
                                onChange={(e) => setEditingNodeName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRenameConfirm(e)}
                                onBlur={handleRenameConfirm}
                                onClick={(e) => e.stopPropagation()}
                                className="h-7"
                                autoFocus
                           />
                       ) : (
                           <span className="truncate flex-grow">{node.id}</span>
                       )}

                       {editingNodeId !== node.id && (
                           <div className="flex items-center ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => handleRenameStart(e, node)} title={t('rename') + ' ' + node.type}>
                                   <Edit className="h-3 w-3" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => handleDeleteClick(e, node)} title={t('delete') + ' ' + node.type}>
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
        <>
            <div className="space-y-2">
                <div 
                    className={cn("group flex items-center gap-2 p-1 rounded-md cursor-pointer hover:bg-accent", selectedFolderId === null && "bg-accent")}
                    onClick={() => onSelectFolder(null)}
                >
                    <Folder className={cn("h-4 w-4 text-primary transition-colors group-hover:text-accent-foreground", selectedFolderId === null && "text-accent-foreground")} />
                    <span>{t('allFiles')}</span>
                </div>
                {renderTree(rootNodes)}
            </div>
            <AlertDialog open={!!nodeToDelete} onOpenChange={(open) => !open && setNodeToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('deleteWarning', {
                            type: nodeToDelete?.type,
                            name: nodeToDelete?.id,
                            maybeContents: nodeToDelete?.type === 'folder' ? t('andAllContents') : ''
                        })}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setNodeToDelete(null)}>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">{t('delete')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
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
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const { storageMode } = useStorage();

  useEffect(() => {
    const unsubNodes = onSnapshot('kg-nodes', (snapshot) => {
      const nodes = snapshot.map(doc => ({ id: doc.id, ...doc.data() } as Node));
      nodes.sort((a,b) => a.id.localeCompare(b.id));
      setAllNodes(nodes);
    });

    const unsubLinks = onSnapshot('kg-links', (snapshot) => {
      const links = snapshot.map(doc => doc.data() as Link);
      setAllLinks(links);
    });

    return () => {
      if (unsubNodes) unsubNodes();
      if (unsubLinks) unsubLinks();
    };
  }, [storageMode]);
  
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
    const baseName = isFolder ? t('newFolder') : t('newFile');
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
    
    await setDoc("kg-nodes", newNodeId, newNodeData);
    
    const createLink = async (sourceId: string, targetId: string) => {
        const linkId = `${sourceId}-${targetId}`;
        const reverseLinkId = `${targetId}-${sourceId}`;
        const linkExists = allLinks.some(l => {
            const s = (l.source as any).id || l.source;
            const t = (l.target as any).id || l.target;
            return (s === sourceId && t === targetId) || (s === targetId && t === sourceId);
        });

        if (!linkExists) {
            const newLink = { source: sourceId, target: targetId, value: 1 };
            await setDoc("kg-links", linkId, newLink);
        }
    };
    
    if (selectedNode && selectedNode.id !== newNodeId && selectedNode.type === 'file') {
        await createLink(selectedNode.id, newNodeId);
    }
    
    if (selectedFolderId) {
       await createLink(selectedFolderId, newNodeId);
    }
  }, [selectedNode, allNodes, allLinks, selectedFolderId, t]);
  
  const handleAddImageNode = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
        alert("Please select an image file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        let newNodeId = file.name;
        let counter = 1;
        while(allNodes.some(n => n.id === newNodeId)) {
            const nameParts = file.name.split('.');
            const ext = nameParts.pop();
            newNodeId = `${nameParts.join('.')}(${counter++}).${ext}`;
        }
        
        const newNodeData: Omit<Node, 'id'> = { 
            group: 7, // A new group for images
            type: 'file',
            parentId: selectedFolderId,
            imageUrl: imageUrl
        };
        
        await setDoc("kg-nodes", newNodeId, newNodeData);
        // Reset file input
        if(imageInputRef.current) imageInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  }, [allNodes, selectedFolderId]);

    const deleteNodeAndChildren = useCallback(async (nodeId: string) => {
        const nodesToDelete = new Set<string>();

        const findChildrenRecursive = (id: string) => {
            nodesToDelete.add(id);
            const children = allNodes.filter(n => n.parentId === id);
            children.forEach(child => findChildrenRecursive(child.id));
        };

        const node = allNodes.find(n => n.id === nodeId);
        if (node?.type === 'folder') {
            findChildrenRecursive(nodeId);
        } else {
            nodesToDelete.add(nodeId);
        }
        
        const deletePromises: Promise<any>[] = [];

        nodesToDelete.forEach(id => {
            deletePromises.push(deleteDoc('kg-nodes', id));
        });

        allLinks.forEach((link) => {
            const sourceId = (link.source as any).id || link.source;
            const targetId = (link.target as any).id || link.target;
            if (nodesToDelete.has(sourceId) || nodesToDelete.has(targetId)) {
                const linkId = `${sourceId}-${targetId}`;
                const reverseLinkId = `${targetId}-${sourceId}`;
                deletePromises.push(deleteDoc('kg-links', linkId).catch(() => deleteDoc('kg-links', reverseLinkId)));
            }
        });
        
        await Promise.all(deletePromises);

        if (selectedNode && nodesToDelete.has(selectedNode.id)) {
            setSelectedNode(null);
            setLinkingNodes([]);
        }
        if(selectedFolderId && nodesToDelete.has(selectedFolderId)) {
            setSelectedFolderId(null);
        }
    }, [allNodes, allLinks, selectedNode, selectedFolderId]);


  const handleDeleteSelected = async () => {
    if (!selectedNode) return;
    await deleteNodeAndChildren(selectedNode.id);
    setSelectedNode(null);
    setLinkingNodes([]);
  };

  const handleUnlinkSelected = async () => {
    if (!selectedNode) return;

    const deletePromises: Promise<any>[] = [];
    allLinks.forEach((link) => {
        const sourceId = (link.source as any).id || link.source;
        const targetId = (link.target as any).id || link.target;
        if (sourceId === selectedNode.id || targetId === selectedNode.id) {
             const linkId = `${sourceId}-${targetId}`;
             const reverseLinkId = `${targetId}-${sourceId}`;
             deletePromises.push(deleteDoc('kg-links', linkId).catch(() => deleteDoc('kg-links', reverseLinkId)));
        }
    });
    
    await Promise.all(deletePromises);
    setSelectedNode(null);
    setLinkingNodes([]);
  }
  
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
    await setDoc("kg-links", linkId, newLink);

    setLinkingNodes([]);
    setSelectedNode(null);
  }

   const handleLinkAll = async () => {
    if (linkingNodes.length < 2) return;
    const linkPromises: Promise<any>[] = [];

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
                linkPromises.push(setDoc("kg-links", linkId, newLink));
            }
        }
    }
    
    await Promise.all(linkPromises);
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
        
        const oldNodeData = allNodes.find(n => n.id === oldNodeId);
        if (!oldNodeData) return;

        // Create new node with new ID and same data
        const { id, ...restOfOldData } = oldNodeData;
        await setDoc('kg-nodes', newNodeName, { ...restOfOldData });

        // Re-create links with new node name
        const updatePromises: Promise<any>[] = [];

        allLinks.forEach((link) => {
            const sourceId = (link.source as any).id || link.source;
            const targetId = (link.target as any).id || link.target;
            
            if (sourceId === oldNodeId || targetId === oldNodeId) {
                const linkId = `${sourceId}-${targetId}`;
                const reverseLinkId = `${targetId}-${sourceId}`;
                updatePromises.push(deleteDoc('kg-links', linkId).catch(() => deleteDoc('kg-links', reverseLinkId)));

                const newSource = sourceId === oldNodeId ? newNodeName : sourceId;
                const newTarget = targetId === oldNodeId ? newNodeName : targetId;
                const newLinkId = `${newSource}-${newTarget}`;
                updatePromises.push(setDoc('kg-links', newLinkId, { source: newSource, target: newTarget, value: link.value }));
            }
        });
        
        // Update parentId for all children if it was a folder
        if (oldNodeData.type === 'folder') {
            const children = allNodes.filter(n => n.parentId === oldNodeId);
            children.forEach(child => {
                updatePromises.push(updateDoc('kg-nodes', child.id, { parentId: newNodeName }));
            });
        }
        
        await Promise.all(updatePromises);
        
        // Delete the old node
        await deleteDoc('kg-nodes', oldNodeId);

        if (selectedNode?.id === oldNodeId) {
             const updatedNode = allNodes.find(n => n.id === newNodeName) || null;
             setSelectedNode(updatedNode as Node);
        }
        if (selectedFolderId === oldNodeId) {
            setSelectedFolderId(newNodeName);
        }
    }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full min-h-[85vh]">
      <Card className="lg:col-span-1 bg-card/50">
        <CardHeader>
          <h2 className="text-lg font-semibold">{t('fileExplorer')}</h2>
        </CardHeader>
        <CardContent>
           <FileExplorer 
                nodes={allNodes}
                selectedNodeId={selectedNode?.id || null}
                onSelectNode={handleNodeClick}
                onSelectFolder={setSelectedFolderId}
                selectedFolderId={selectedFolderId}
                onRename={handleUpdateNodeName}
                onDelete={deleteNodeAndChildren}
                t={t}
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
            <p className="font-semibold">{t('linkingNodes', { count: linkingNodes.length })}</p>
            <ul className="list-disc list-inside max-h-32 overflow-y-auto">
                {linkingNodes.map(node => <li key={node.id} className="truncate">{node.id}</li>)}
            </ul>
            {linkingNodes.length === 1 && <p className="text-muted-foreground text-xs mt-1">{t('selectAnotherNode')}</p>}
            {linkingNodes.length === 2 && <Button size="sm" className="mt-2 w-full" onClick={handleCreateLink}>{t('createLink')}</Button>}
            {linkingNodes.length > 2 && <Button size="sm" className="mt-2 w-full" onClick={handleLinkAll}>{t('linkAllSelected')}</Button>}
          </div>
        )}
      </div>

      <Card className="lg:col-span-1 bg-card/50">
        <CardHeader>
          <h2 className="text-lg font-semibold">{t('controls')}</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input placeholder={t('searchNodes') + "..."} />

          {selectedNode && (
            <div className="space-y-2 animate-in fade-in-50">
              <h3 className="font-medium">{t('editSelected')} <span className="font-normal text-muted-foreground">{selectedNode.id}</span></h3>
              <div className="flex gap-2">
                <Input
                  value={editingNodeName}
                  onChange={(e) => setEditingNodeName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateNodeName(selectedNode.id, editingNodeName)}
                  placeholder={t('newName')}
                />
                <Button variant="outline" size="icon" onClick={() => handleUpdateNodeName(selectedNode.id, editingNodeName)} title={t('rename')}><Check /></Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-medium">{t('actions')}</h3>
            <div className="grid grid-cols-2 gap-2">
               <Button variant="outline" size="sm" onClick={() => handleAddNode(false)}><FilePlus /> {t('newFile')}</Button>
               <Button variant="outline" size="sm" onClick={() => handleAddNode(true)}><FolderPlus /> {t('newFolder')}</Button>
               <Button variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}><ImageIcon /> {t('addImage')}</Button>
               <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleAddImageNode}
                    accept="image/*"
                    className="hidden"
                />
               <Button variant="outline" size="sm" onClick={handleCreateLink} disabled={linkingNodes.length !== 2}><LinkIcon /> {t('linkTasks')}</Button>
               <Button variant="outline" size="sm" onClick={handleUnlinkSelected} disabled={!selectedNode || selectedNode.type === 'folder'}><Link2Off /> {t('unlinkNode')}</Button>
               <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={!selectedNode}><Trash2 /> {t('delete')}</Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">{t('forces')}</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="center-force">{t('center')}</Label>
              <Switch id="center-force" checked={centerForce} onCheckedChange={setCenterForce} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repel-force">{t('repelStrength', { value: repelStrength })}</Label>
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
              <Label htmlFor="link-force">{t('linkDistance', { value: linkDistance })}</Label>              <Slider 
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
