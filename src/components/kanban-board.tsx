"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';


type Task = {
  id: string;
  content: string;
  columnId: ColumnId;
};

type ColumnId = 'todo' | 'in-progress' | 'done';

type Column = {
  id: ColumnId;
  title: string;
};

const columnData: Column[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

const initialTasks: Record<ColumnId, Task[]> = {
  'todo': [],
  'in-progress': [],
  'done': [],
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Record<ColumnId, Task[]>>(initialTasks);
  const [draggedItem, setDraggedItem] = useState<{ taskId: string; sourceColumnId: ColumnId } | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskContent, setEditingTaskContent] = useState('');
  const [newTaskContent, setNewTaskContent] = useState<Record<ColumnId, string>>({ todo: '', 'in-progress': '', done: '' });

  useEffect(() => {
    const q = collection(db, 'tasks');
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newTasks: Record<ColumnId, Task[]> = { 'todo': [], 'in-progress': [], 'done': [] };
      querySnapshot.forEach((doc) => {
        const task = { id: doc.id, ...doc.data() } as Task;
        if (newTasks[task.columnId]) {
          newTasks[task.columnId].push(task);
        }
      });
      setTasks(newTasks);
    });

    return () => unsubscribe();
  }, []);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string, sourceColumnId: ColumnId) => {
    setDraggedItem({ taskId, sourceColumnId });
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragEnd = () => {
    setDraggedItem(null);
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetColumnId: ColumnId) => {
    if (!draggedItem) return;

    const { taskId, sourceColumnId } = draggedItem;
    if (sourceColumnId === targetColumnId) return;
    
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, { columnId: targetColumnId });

    setDraggedItem(null);
  };

  const handleAddTask = async (columnId: ColumnId) => {
    const content = newTaskContent[columnId].trim();
    if (!content) return;

    await addDoc(collection(db, 'tasks'), {
      content,
      columnId,
    });
    setNewTaskContent(prev => ({...prev, [columnId]: ''}));
  }
  
  const handleDeleteTask = async (taskId: string) => {
     await deleteDoc(doc(db, "tasks", taskId));
  }

  const handleStartEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskContent(task.content);
  }

  const handleConfirmEdit = async () => {
    if (!editingTaskId) return;

    const taskRef = doc(db, 'tasks', editingTaskId);
    await updateDoc(taskRef, { content: editingTaskContent });

    setEditingTaskId(null);
    setEditingTaskContent('');
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Task Board</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {columnData.map((column) => {
          return (
            <Card
              key={column.id}
              className="bg-card/50"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <CardHeader>
                <CardTitle>{column.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="min-h-[200px] flex flex-col gap-4">
                  {tasks[column.id].map((task) => (
                    <div
                      key={task.id}
                      draggable={!editingTaskId}
                      onDragStart={(e) => handleDragStart(e, task.id, column.id)}
                      onDragEnd={handleDragEnd}
                      className="group p-4 bg-background rounded-lg shadow-sm cursor-grab active:cursor-grabbing flex justify-between items-center"
                    >
                      {editingTaskId === task.id ? (
                        <Input 
                            value={editingTaskContent}
                            onChange={(e) => setEditingTaskContent(e.target.value)}
                            onBlur={handleConfirmEdit}
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmEdit()}
                            autoFocus
                            className="flex-grow"
                        />
                      ) : (
                        <>
                          <span>{task.content}</span>
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => handleStartEditing(task)}>
                                <Pencil className="h-4 w-4"/>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                 <div className="flex gap-2 mt-auto">
                    <Input 
                      placeholder="Add a new task..." 
                      value={newTaskContent[column.id]}
                      onChange={(e) => setNewTaskContent(prev => ({...prev, [column.id]: e.target.value}))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTask(column.id)}
                    />
                    <Button onClick={() => handleAddTask(column.id)} size="icon">
                        <Plus />
                    </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
