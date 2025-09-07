"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from "@/hooks/use-language";
import { useStorage } from '@/hooks/use-storage';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BrainCircuit, CheckCircle, Circle, FileText, ListTodo, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { onSnapshot, query, where } from '@/lib/storage';

type TaskStatus = 'todo' | 'in-progress' | 'done';
type Task = { id: string; status: TaskStatus; };
type Event = { id: string; title: string; date: string; };
type Transaction = { id: string; type: 'income' | 'expense'; amount: number; };
type Module =
  | 'dashboard'
  | 'knowledge-graph'
  | 'kanban-board'
  | 'notes-editor'
  | 'calendar'
  | 'pomodoro'
  | 'budget'
  | 'ai-tools'
  | 'tech-news';

interface DashboardProps {
    setActiveModule: (module: Module) => void;
}

export default function Dashboard({ setActiveModule }: DashboardProps) {
  const { t, language } = useLanguage();
  const { storageMode } = useStorage();
  const [taskCounts, setTaskCounts] = useState({ todo: 0, 'in-progress': 0, done: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // Fetch tasks
    const tasksUnsub = onSnapshot('tasks', (snapshot) => {
      const counts: { [key in TaskStatus]: number } = { todo: 0, 'in-progress': 0, done: 0 };
      snapshot.forEach(doc => {
        const task = doc.data() as Task;
        if (task.status in counts) {
          counts[task.status]++;
        }
      });
      setTaskCounts(counts);
    });

    // Fetch upcoming events
    const today = new Date();
    const q = query('events', where('date', '>=', today.toISOString()));
    const eventsUnsub = onSnapshot(q, (snapshot) => {
      const events = snapshot.map(doc => ({ id: doc.id, ...doc.data() } as Event))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3); // Get top 3 upcoming
      setUpcomingEvents(events);
    });

    // Fetch transactions
    const transUnsub = onSnapshot('transactions', (snapshot) => {
        let income = 0;
        let expenses = 0;
        snapshot.forEach(doc => {
            const t = doc.data() as Transaction;
            if (t.type === 'income') {
                income += t.amount;
            } else {
                expenses += t.amount;
            }
        });
        setBalance(income - expenses);
    });

    return () => {
      if (tasksUnsub) tasksUnsub();
      if (eventsUnsub) eventsUnsub();
      if (transUnsub) transUnsub();
    };
  }, [storageMode]);
  
  const locale = language === 'pt' ? ptBR : undefined;

  return (
    <div className="space-y-6">
       <div className="text-left">
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          {t('dashboard')}
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          {t('welcomeMessage')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Task Overview */}
        <Card className="hover:bg-accent/20 cursor-pointer" onClick={() => setActiveModule('kanban-board')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
                <ListTodo /> {t('taskBoard')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Circle className="h-4 w-4" /> {t('toDo')}</span>
                <span className="font-bold">{taskCounts.todo}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><RefreshCw className="h-4 w-4 text-blue-500" /> {t('inProgress')}</span>
                <span className="font-bold">{taskCounts['in-progress']}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-4 w-4 text-green-500" /> {t('done')}</span>
                <span className="font-bold">{taskCounts.done}</span>
             </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="hover:bg-accent/20 cursor-pointer" onClick={() => setActiveModule('calendar')}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    Upcoming Events
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {upcomingEvents.length > 0 ? (
                    upcomingEvents.map(event => (
                        <div key={event.id} className="text-sm">
                            <p className="font-semibold">{event.title}</p>
                            <p className="text-muted-foreground">{format(new Date(event.date), 'PPP', { locale })}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">{t('noUpcomingEvents')}</p>
                )}
            </CardContent>
        </Card>

        {/* Budget Summary */}
        <Card className="hover:bg-accent/20 cursor-pointer" onClick={() => setActiveModule('budget')}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    {t('budgetTracker')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{t('currentBalance')}</p>
                <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
            </CardContent>
        </Card>

        {/* Quick Access */}
         <Card className="lg:col-span-1 hover:bg-accent/20 cursor-pointer" onClick={() => setActiveModule('knowledge-graph')}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <BrainCircuit /> {t('knowledgeGraph')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{t('accessKnowledgeGraph')}</p>
            </CardContent>
        </Card>
         <Card className="lg:col-span-2 hover:bg-accent/20 cursor-pointer" onClick={() => setActiveModule('notes-editor')}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText /> {t('notesEditor')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{t('accessNotesEditor')}</p>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
