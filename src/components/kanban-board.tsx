"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';

type Task = {
  id: string;
  content: string;
  columnId: ColumnId;
};

type ColumnId = 'todo' | 'in-progress' | 'done';

type Column = {
  id: ColumnId;
  title: string;
  tasks: Task[];
};

const initialColumns: Record<ColumnId, Column> = {
  'todo': { id: 'todo', title: 'To Do', tasks: [] },
  'in-progress': { id: 'in-progress', title: 'In Progress', tasks: [] },
  'done': { id: 'done', title: 'Done', tasks: [] },
};

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Record<ColumnId, Column>>(initialColumns);
  const [draggedItem, setDraggedItem] = useState<{ taskId: string; sourceColumnId: ColumnId } | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskContent, setEditingTaskContent] = useState('');
  const [newTaskContent, setNewTaskContent] = useState<Record<ColumnId, string>>({ todo: '', 'in-progress': '', done: '' });

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
    
    setColumns(prev => {
        const newColumns = {...prev};
        const taskToMove = newColumns[sourceColumnId].tasks.find(t => t.id === taskId);
        if (taskToMove) {
            newColumns[sourceColumnId].tasks = newColumns[sourceColumnId].tasks.filter(t => t.id !== taskId);
            newColumns[targetColumnId].tasks.push({...taskToMove, columnId: targetColumnId});
        }
        return newColumns;
    });


    setDraggedItem(null);
  };

  const handleAddTask = async (columnId: ColumnId) => {
    const content = newTaskContent[columnId].trim();
    if (!content) return;

    const newTask: Task = {
        id: `task-${Date.now()}`,
        content,
        columnId,
    };

    setColumns(prev => {
        const newColumns = {...prev};
        newColumns[columnId].tasks.push(newTask);
        return newColumns;
    });
    setNewTaskContent(prev => ({...prev, [columnId]: ''}));
  }
  
  const handleDeleteTask = async (taskId: string, columnId: ColumnId) => {
     setColumns(prev => {
        const newColumns = {...prev};
        newColumns[columnId].tasks = newColumns[columnId].tasks.filter(t => t.id !== taskId);
        return newColumns;
    });
  }

  const handleStartEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskContent(task.content);
  }

  const handleConfirmEdit = async (taskId: string, columnId: ColumnId) => {
    if (!editingTaskId) return;

     setColumns(prev => {
        const newColumns = {...prev};
        const taskToEdit = newColumns[columnId].tasks.find(t => t.id === taskId);
        if(taskToEdit) {
            taskToEdit.content = editingTaskContent;
        }
        return newColumns;
    });

    setEditingTaskId(null);
    setEditingTaskContent('');
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Task Board</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {(Object.keys(columns) as ColumnId[]).map((columnId) => {
          const column = columns[columnId];
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
                  {column.tasks.map((task) => (
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
                            onBlur={() => handleConfirmEdit(task.id, column.id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmEdit(task.id, column.id)}
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
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id, column.id)}>
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
                      value={newTaskContent[columnId]}
                      onChange={(e) => setNewTaskContent(prev => ({...prev, [columnId]: e.target.value}))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTask(columnId)}
                    />
                    <Button onClick={() => handleAddTask(columnId)} size="icon">
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
