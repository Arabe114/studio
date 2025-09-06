"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Task = {
  id: string;
  content: string;
};

type ColumnId = 'todo' | 'in-progress' | 'done';

type Column = {
  id: ColumnId;
  title: string;
  tasks: Task[];
};

const initialTasks: Task[] = [
  { id: 'task-1', content: 'Design the main UI layout' },
  { id: 'task-2', content: 'Implement D3.js graph' },
  { id: 'task-3', content: 'Set up navigation logic' },
  { id: 'task-4', content: 'Develop Kanban board' },
  { id: 'task-5', content: 'Test drag and drop functionality' },
  { id: 'task-6', content: 'Review project requirements' },
];

const initialColumns: Record<ColumnId, Column> = {
  'todo': {
    id: 'todo',
    title: 'To Do',
    tasks: [initialTasks[0], initialTasks[1], initialTasks[2]],
  },
  'in-progress': {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [initialTasks[3]],
  },
  'done': {
    id: 'done',
    title: 'Done',
    tasks: [initialTasks[4], initialTasks[5]],
  },
};

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Record<ColumnId, Column>>(initialColumns);
  const [draggedItem, setDraggedItem] = useState<{ taskId: string; sourceColumnId: ColumnId } | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string, sourceColumnId: ColumnId) => {
    setDraggedItem({ taskId, sourceColumnId });
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50');
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, targetColumnId: ColumnId) => {
    if (draggedItem?.sourceColumnId !== targetColumnId) {
      e.currentTarget.classList.add('bg-accent/20');
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-accent/20');
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: ColumnId) => {
    e.currentTarget.classList.remove('bg-accent/20');
    if (!draggedItem) return;

    const { taskId, sourceColumnId } = draggedItem;

    if (sourceColumnId === targetColumnId) {
      setDraggedItem(null);
      return;
    }

    setColumns(prev => {
      const newColumns = { ...prev };
      const sourceColumn = { ...newColumns[sourceColumnId] };
      const targetColumn = { ...newColumns[targetColumnId] };

      const taskToMove = sourceColumn.tasks.find(task => task.id === taskId);
      if (!taskToMove) return prev;

      sourceColumn.tasks = sourceColumn.tasks.filter(task => task.id !== taskId);
      targetColumn.tasks = [...targetColumn.tasks, taskToMove];
      
      newColumns[sourceColumnId] = sourceColumn;
      newColumns[targetColumnId] = targetColumn;
      
      return newColumns;
    });

    setDraggedItem(null);
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Task Board</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {(Object.keys(columns) as ColumnId[]).map((columnId) => {
          const column = columns[columnId];
          return (
            <Card
              key={column.id}
              className="bg-card/50 transition-colors"
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, column.id)}
              onDragLeave={handleDragLeave}
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
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id, column.id)}
                      onDragEnd={handleDragEnd}
                      className="p-4 bg-background rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-opacity"
                    >
                      {task.content}
                    </div>
                  ))}
                </div>
                <Input placeholder="Add a new task..." className="mt-auto" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
