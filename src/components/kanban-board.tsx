
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import ForceGraph from './force-graph';
import type { Node as GraphNode, Link as GraphLink } from './force-graph';
import { Plus, Link as LinkIcon, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
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

type TaskStatus = 'todo' | 'in-progress' | 'done';

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

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLinkingMode, setIsLinkingMode] = useState(false);
  const [firstLinkNode, setFirstLinkNode] = useState<GraphNode | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetTask, setSheetTask] = useState<Partial<Task> | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(fetchedTasks);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const nodes = tasks.map(task => ({
      id: task.id,
      group: statusToGroup[task.status],
      fx: task.x,
      fy: task.y
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
        const taskRef = doc(db, 'tasks', firstTask.id);
        updateDoc(taskRef, {
          dependencies: [...firstTask.dependencies, secondLinkNode.id]
        });
      }
      // Also link target to source
      const secondTask = tasks.find(t => t.id === secondLinkNode.id);
      if (secondTask && !secondTask.dependencies.includes(firstLinkNode.id)) {
        const taskRef = doc(db, 'tasks', secondTask.id);
        updateDoc(taskRef, {
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

  const handleNodeDrag = async (nodeId: string, newPosition: { x: number, y: number }) => {
      const taskRef = doc(db, 'tasks', nodeId);
      await updateDoc(taskRef, { x: newPosition.x, y: newPosition.y });
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
        const taskRef = doc(db, 'tasks', sheetTask.id);
        await updateDoc(taskRef, taskData);
    } else { // Creating new task
        await addDoc(collection(db, 'tasks'), taskData);
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
    
    const batch = writeBatch(db);
    const taskIdToDelete = sheetTask.id;

    // Delete the task itself
    const taskRef = doc(db, 'tasks', taskIdToDelete);
    batch.delete(taskRef);

    // Remove this task from other tasks' dependency lists
    tasks.forEach(task => {
        if (task.dependencies.includes(taskIdToDelete)) {
            const otherTaskRef = doc(db, 'tasks', task.id);
            const newDeps = task.dependencies.filter(dep => dep !== taskIdToDelete);
            batch.update(otherTaskRef, { dependencies: newDeps });
        }
    });
    
    await batch.commit();
    setIsSheetOpen(false);
    setSelectedTask(null);
    setSheetTask(null);
  }

  return (
    <div className="h-full min-h-[85vh] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Task Flow</h1>
        <div className="flex gap-2">
            <Button onClick={handleCreateNewTask}><Plus /> Add Task</Button>
            <Button 
                variant={isLinkingMode ? "secondary" : "outline"} 
                onClick={() => {
                    setIsLinkingMode(!isLinkingMode);
                    setFirstLinkNode(null);
                    setSelectedTask(null);
                }}
            >
                <LinkIcon /> {isLinkingMode ? (firstLinkNode ? 'Select Target Task' : 'Select Source Task') : 'Link Tasks'}
            </Button>
        </div>
      </div>
      <Card className="flex-grow relative">
        <ForceGraph 
            data={graphData}
            onNodeClick={handleNodeClick}
            onNodeDrag={handleNodeDrag}
            selectedNodeId={isLinkingMode ? firstLinkNode?.id : selectedTask?.id}
            linkingNodeIds={isLinkingMode && firstLinkNode ? [firstLinkNode.id] : []}
            repelStrength={-1000}
            linkDistance={150}
            centerForce={false}
        />
      </Card>
      
      <Sheet open={isSheetOpen} onOpenChange={(isOpen) => {
        setIsSheetOpen(isOpen);
        if (!isOpen) {
          setSheetTask(null);
          setSelectedTask(null);
        }
      }}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>{sheetTask?.id ? 'Edit Task' : 'Create New Task'}</SheetTitle>
            </SheetHeader>
            {sheetTask && (
                <form onSubmit={handleSaveTask} className="space-y-4 py-4">
                     <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={sheetTask.title || ''} onChange={e => setSheetTask({...sheetTask, title: e.target.value})} required />
                    </div>
                     <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={sheetTask.description || ''} onChange={e => setSheetTask({...sheetTask, description: e.target.value})} />
                    </div>
                     <div>
                        <Label htmlFor="status">Status</Label>
                         <Select value={sheetTask.status || 'todo'} onValueChange={(value: TaskStatus) => setSheetTask({...sheetTask, status: value})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todo">To Do</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-between">
                      <Button type="submit">
                        {sheetTask.id ? 'Save Changes' : 'Create Task'}
                      </Button>
                      {sheetTask.id && (
                        <Button type="button" variant="destructive" onClick={handleDeleteTask}>
                           <Trash2 /> Delete Task
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
