
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ForceGraph from './force-graph';
import type { Node as GraphNode, Link as GraphLink } from './force-graph';
import { Plus, Link as LinkIcon, Trash2, LocateFixed, LayoutGrid, Workflow } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useStorage } from '@/hooks/use-storage';
import { onSnapshot, addDoc, deleteDoc, updateDoc, writeBatch } from '@/lib/storage';

type TaskStatus = 'todo' | 'in-progress' | 'done';
type ViewMode = 'flow' | 'board';

type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dependencies: string[];
  x?: number;
  y?: number;
};

// Map status to a group number for color coding in the graph
const statusToGroup: Record<TaskStatus, number> = {
  'todo': 1,
  'in-progress': 2,
  'done': 3,
};
const statusToIcon: Record<TaskStatus, string> = {
    'todo': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><circle cx="12" cy="12" r="10"></circle></svg>`,
    'in-progress': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>`,
    'done': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
};
const statusToColor: Record<TaskStatus, string> = {
    'todo': 'hsl(var(--border))',
    'in-progress': 'hsl(var(--primary))',
    'done': 'hsl(var(--ring))',
}

const statusToIconComponent: Record<TaskStatus, React.ReactNode> = {
    'todo': <Circle className="h-4 w-4 text-muted-foreground" />,
    'in-progress': <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />,
    'done': <CheckCircle className="h-4 w-4 text-green-500" />,
};


export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLinkingMode, setIsLinkingMode] = useState(false);
  const [firstLinkNode, setFirstLinkNode] = useState<GraphNode | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetTask, setSheetTask] = useState<Partial<Task> | null>(null);
  const [nodeToCenterId, setNodeToCenterId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('flow');
  const { t } = useLanguage();
  const { storageMode } = useStorage();

  const statusToTitle: Record<TaskStatus, string> = {
    'todo': t('toDo'),
    'in-progress': t('inProgress'),
    'done': t('done'),
  }

  useEffect(() => {
    const unsubscribe = onSnapshot('tasks', (snapshot) => {
      const fetchedTasks = snapshot.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(fetchedTasks);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [storageMode]);

  useEffect(() => {
    const nodes = tasks.map(task => ({
      id: task.id,
      group: statusToGroup[task.status],
      fx: task.x,
      fy: task.y,
      html: `
        <div class="p-3 rounded-lg border-2" style="border-color: ${statusToColor[task.status]}; background-color: hsl(var(--card)); color: hsl(var(--card-foreground)); width: 180px; height: 80px; display: flex; flex-direction: column; justify-content: center;">
          <div style="font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; display: flex; align-items: center; gap: 8px;">${statusToIcon[task.status]} ${task.title}</div>
          <div style="font-size: 12px; color: hsl(var(--muted-foreground)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 4px;">${task.description}</div>
        </div>
      `
    }));
    const links = tasks.flatMap(task =>
      task.dependencies.map(depId => ({
        source: depId,
        target: task.id,
        value: 1
      }))
    );
    setGraphData({ nodes, links });
  }, [tasks]);

  const handleNodeClick = useCallback((node: GraphNode | null) => {
    if (!node) {
      setSelectedTask(null);
      if (isLinkingMode) {
        setIsLinkingMode(false);
        setFirstLinkNode(null);
      }
      return;
    }

    const task = tasks.find(t => t.id === node.id);
    if (!task) return;

    if (isLinkingMode && firstLinkNode && firstLinkNode.id !== node.id) {
      const secondLinkNode = node;
      const firstTask = tasks.find(t => t.id === firstLinkNode.id);
      
      if (firstTask && !firstTask.dependencies.includes(secondLinkNode.id)) {
        updateDoc('tasks', firstTask.id, {
          dependencies: [...firstTask.dependencies, secondLinkNode.id]
        });
      }
      // Also link target to source
      const secondTask = tasks.find(t => t.id === secondLinkNode.id);
      if (secondTask && !secondTask.dependencies.includes(firstLinkNode.id)) {
        updateDoc('tasks', secondTask.id, {
            dependencies: [...secondTask.dependencies, firstLinkNode.id]
        });
      }


      setFirstLinkNode(null);
      setIsLinkingMode(false);
    } else if (isLinkingMode) {
      setFirstLinkNode(node);
    } else {
      setSelectedTask(task);
      setSheetTask(task);
      setIsSheetOpen(true);
    }
  }, [isLinkingMode, firstLinkNode, tasks]);
  
  const handleCardClick = (task: Task) => {
      setSelectedTask(task);
      setSheetTask(task);
      setIsSheetOpen(true);
  }

  const handleNodeDrag = async (nodeId: string, newPosition: { x: number, y: number }) => {
      await updateDoc('tasks', nodeId, { x: newPosition.x, y: newPosition.y });
  };
  
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetTask || !sheetTask.title) return;

    const taskData: Omit<Task, 'id' | 'x' | 'y'> = {
        title: sheetTask.title,
        description: sheetTask.description || '',
        status: sheetTask.status || 'todo',
        dependencies: sheetTask.dependencies || []
    };

    if (sheetTask.id) { // Editing existing task
        await updateDoc('tasks', sheetTask.id, taskData);
    } else { // Creating new task
        const docRef = await addDoc('tasks', taskData);
        setNodeToCenterId(docRef.id);
    }
    
    setIsSheetOpen(false);
    setSheetTask(null);
  };
  
  const handleCreateNewTask = () => {
    setSheetTask({ title: '', description: '', status: 'todo', dependencies: [] });
    setIsSheetOpen(true);
    setSelectedTask(null);
  }

  const handleDeleteTask = async () => {
    if (!sheetTask || !sheetTask.id) return;
    
    const taskIdToDelete = sheetTask.id;

    // Delete the task itself
    await deleteDoc('tasks', taskIdToDelete);
    
    // Remove this task from other tasks' dependency lists
    const batch = writeBatch();
    tasks.forEach(task => {
        if (task.dependencies.includes(taskIdToDelete)) {
            const newDeps = task.dependencies.filter(dep => dep !== taskIdToDelete);
            const taskRef = { collection: 'tasks', id: task.id }; // Simplified ref for batch
            (batch as any).update(taskRef, { dependencies: newDeps }); // This is pseudo-code for a generic batch
        }
    });
    
    // For local storage, this requires manual implementation. For firebase, it works.
    // The provided writeBatch is a mock for local.
    const commitBatch = (batch as any).commit ? (batch as any).commit() : Promise.all((batch as any));
    await commitBatch;

    // Fallback for local storage batching mock
    if (storageMode === 'local') {
      const updatePromises: Promise<any>[] = [];
      tasks.forEach(task => {
          if (task.dependencies.includes(taskIdToDelete)) {
              const newDeps = task.dependencies.filter(dep => dep !== taskIdToDelete);
              updatePromises.push(updateDoc('tasks', task.id, { dependencies: newDeps }));
          }
      });
      await Promise.all(updatePromises);
    }

    
    setIsSheetOpen(false);
    setSelectedTask(null);
    setSheetTask(null);
  }
  
  const renderFlowView = () => (
      <Card className="flex-grow relative">
        <ForceGraph 
            data={graphData}
            onNodeClick={handleNodeClick}
            onNodeDrag={handleNodeDrag}
            selectedNodeId={isLinkingMode ? firstLinkNode?.id : selectedTask?.id}
            linkingNodeIds={isLinkingMode && firstLinkNode ? [firstLinkNode.id] : []}
            repelStrength={-1500}
            linkDistance={250}
            nodeToCenterId={nodeToCenterId}
            onCenterViewComplete={() => setNodeToCenterId(null)}
            centerForce={false}
        />
      </Card>
  );

  const renderBoardView = () => {
      const columns: TaskStatus[] = ['todo', 'in-progress', 'done'];
      return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
              {columns.map(status => (
                  <div key={status} className="bg-card/50 rounded-lg p-4 flex flex-col">
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        {statusToIconComponent[status]}
                        {statusToTitle[status]}
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                            ({tasks.filter(t => t.status === status).length})
                        </span>
                      </h2>
                      <div className="space-y-4 overflow-y-auto">
                          {tasks.filter(t => t.status === status).map(task => (
                              <Card key={task.id} className="p-4 cursor-pointer" onClick={() => handleCardClick(task)}>
                                  <CardTitle className="text-base">{task.title}</CardTitle>
                                  <p className="text-sm text-muted-foreground mt-1 truncate">{task.description}</p>
                              </Card>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      );
  };

  return (
    <div className="h-full min-h-[85vh] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{viewMode === 'flow' ? t('taskFlow') : t('taskBoardView')}</h1>
        <div className="flex gap-2">
            <Button onClick={handleCreateNewTask}><Plus /> {t('addTask')}</Button>
            {viewMode === 'flow' && (
                <>
                    <Button 
                        variant={isLinkingMode ? "secondary" : "outline"} 
                        onClick={() => {
                            setIsLinkingMode(!isLinkingMode);
                            setFirstLinkNode(null);
                            setSelectedTask(null);
                        }}
                    >
                        <LinkIcon /> {isLinkingMode ? (firstLinkNode ? t('selectTarget') : t('selectSource')) : t('linkTasks')}
                    </Button>
                    <Button variant="outline" onClick={() => setNodeToCenterId('__center_all__')}><LocateFixed /> {t('centerView')}</Button>
                </>
            )}
            <Button variant="outline" onClick={() => setViewMode(viewMode === 'flow' ? 'board' : 'flow')}>
                {viewMode === 'flow' ? <><LayoutGrid/> {t('boardView')}</> : <><Workflow/> {t('flowView')}</>}
            </Button>
        </div>
      </div>
      
      {viewMode === 'flow' ? renderFlowView() : renderBoardView()}
      
      <Sheet open={isSheetOpen} onOpenChange={(isOpen) => {
        setIsSheetOpen(isOpen);
        if (!isOpen) {
          setSheetTask(null);
          setSelectedTask(null);
        }
      }}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>{sheetTask?.id ? t('editTask') : t('createNewTask')}</SheetTitle>
            </SheetHeader>
            {sheetTask && (
                <form onSubmit={handleSaveTask} className="space-y-4 py-4">
                     <div>
                        <Label htmlFor="title">{t('title')}</Label>
                        <Input id="title" value={sheetTask.title || ''} onChange={e => setSheetTask({...sheetTask, title: e.target.value})} required />
                    </div>
                     <div>
                        <Label htmlFor="description">{t('description')}</Label>
                        <Textarea id="description" value={sheetTask.description || ''} onChange={e => setSheetTask({...sheetTask, description: e.target.value})} />
                    </div>
                     <div>
                        <Label htmlFor="status">{t('status')}</Label>
                         <Select value={sheetTask.status || 'todo'} onValueChange={(value: TaskStatus) => setSheetTask({...sheetTask, status: value})}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('selectStatus')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todo">{t('toDo')}</SelectItem>
                                <SelectItem value="in-progress">{t('inProgress')}</SelectItem>
                                <SelectItem value="done">{t('done')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-between">
                      <Button type="submit">
                        {sheetTask.id ? t('saveChanges') : t('createNewTask')}
                      </Button>
                      {sheetTask.id && (
                        <Button type="button" variant="destructive" onClick={handleDeleteTask}>
                           <Trash2 /> {t('deleteTask')}
                        </Button>
                      )}
                    </div>
                </form>
            )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
