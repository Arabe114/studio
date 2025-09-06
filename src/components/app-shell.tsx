"use client";

import { useState } from 'react';
import type { FC } from 'react';
import {
  LayoutDashboard,
  BrainCircuit,
  Kanban,
  FileText,
  Hexagon,
  Calendar,
  Timer,
  PiggyBank,
  Cpu,
  Newspaper,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Dashboard from '@/components/dashboard';
import KnowledgeGraph from '@/components/knowledge-graph';
import KanbanBoard from '@/components/kanban-board';
import NotesEditor from '@/components/notes-editor';
import CalendarScheduler from '@/components/calendar-scheduler';
import PomodoroTimer from '@/components/pomodoro-timer';
import BudgetTracker from '@/components/budget-tracker';
import AiTools from '@/components/ai-tools';
import TechNews from '@/components/tech-news';

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

interface NavItem {
  id: Module;
  icon: FC<React.ComponentProps<'svg'>>;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'knowledge-graph', icon: BrainCircuit, label: 'Knowledge Graph' },
  { id: 'kanban-board', icon: Kanban, label: 'Task Board' },
  { id: 'notes-editor', icon: FileText, label: 'Notes Editor' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'pomodoro', icon: Timer, label: 'Pomodoro Timer' },
  { id: 'budget', icon: PiggyBank, label: 'Budget Tracker' },
  { id: 'ai-tools', icon: Cpu, label: 'AI Tools' },
  { id: 'tech-news', icon: Newspaper, label: 'Tech News' },
];

export default function AppShell() {
  const [activeModule, setActiveModule] = useState<Module>('dashboard');

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'knowledge-graph':
        return <KnowledgeGraph />;
      case 'kanban-board':
        return <KanbanBoard />;
      case 'notes-editor':
        return <NotesEditor />;
      case 'calendar':
        return <CalendarScheduler />;
      case 'pomodoro':
        return <PomodoroTimer />;
      case 'budget':
        return <BudgetTracker />;
      case 'ai-tools':
        return <AiTools />;
      case 'tech-news':
        return <TechNews />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <nav className="flex flex-col items-center gap-4 border-r border-border bg-card p-4 overflow-y-auto">
        <div className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-neon-primary">
          <Hexagon className="h-6 w-6" />
        </div>
        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                activeModule === item.id ? 'bg-accent text-accent-foreground shadow-neon-accent' : 'text-muted-foreground'
              )}
              aria-label={item.label}
              title={item.label}
            >
              <item.icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </nav>
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="animate-in fade-in-50 duration-500">
           {renderModule()}
        </div>
      </main>
    </div>
  );
}
