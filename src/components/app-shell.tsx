

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
  ChevronsLeft,
  ChevronsRight,
  Settings,
  Sun,
  Moon,
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
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import AnimatedBackground from './animated-background';
import { useLanguage } from '@/hooks/use-language';

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
  labelKey: "dashboard" | "knowledgeGraph" | "taskBoard" | "notesEditor" | "calendar" | "pomodoroTimer" | "budgetTracker" | "aiTools" | "techNews";
}

const navItems: NavItem[] = [
  { id: 'dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { id: 'knowledge-graph', icon: BrainCircuit, labelKey: 'knowledgeGraph' },
  { id: 'kanban-board', icon: Kanban, labelKey: 'taskBoard' },
  { id: 'notes-editor', icon: FileText, labelKey: 'notesEditor' },
  { id: 'calendar', icon: Calendar, labelKey: 'calendar' },
  { id: 'pomodoro', icon: Timer, labelKey: 'pomodoroTimer' },
  { id: 'budget', icon: PiggyBank, labelKey: 'budgetTracker' },
  { id: 'ai-tools', icon: Cpu, labelKey: 'aiTools' },
  { id: 'tech-news', icon: Newspaper, labelKey: 'techNews' },
];

export default function AppShell() {
  const [activeModule, setActiveModule] = useState<Module>('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const { setTheme } = useTheme();
  const { t, setLanguage } = useLanguage();

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard setActiveModule={setActiveModule} />;
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
        return <Dashboard setActiveModule={setActiveModule}/>;
    }
  };

  return (
    <div className="flex h-screen w-full bg-transparent">
      <AnimatedBackground />
      <nav
        className={cn(
          'flex flex-col border-r border-border bg-card/60 backdrop-blur-sm p-4 transition-[width] duration-300 ease-in-out z-10',
          isSidebarExpanded ? 'w-60' : 'w-20 items-center'
        )}
      >
        <div
          className={cn(
            'mb-4 flex h-10 shrink-0 items-center',
             isSidebarExpanded ? 'justify-start' : 'w-full justify-center'
          )}
        >
             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-neon-primary hover:shadow-lg hover:scale-105 transition-all duration-200">
                AIO
             </div>
             <span className={cn(
                 "text-lg font-semibold text-primary [text-shadow:0_0_8px_hsl(var(--primary)/_0.8)] transition-opacity ease-out ml-3",
                 isSidebarExpanded ? "opacity-100 duration-300 animate-in fade-in slide-in-from-left-4" : "opacity-0"
             )}>{t('eln')}</span>
        </div>

        <div className="flex flex-grow flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={cn(
                'group flex h-10 items-center gap-3 rounded-lg px-3 transition-colors',
                'hover:bg-accent hover:text-accent-foreground hover:shadow-neon-accent',
                activeModule === item.id
                  ? 'bg-accent text-accent-foreground shadow-neon-accent'
                  : 'text-muted-foreground',
                isSidebarExpanded ? 'w-full justify-start' : 'w-10 justify-center'
              )}
              title={t(item.labelKey)}
            >
              <item.icon className="h-5 w-5 shrink-0 group-hover:animate-shake" />
              {isSidebarExpanded && <span className="truncate">{t(item.labelKey)}</span>}
            </button>
          ))}
        </div>
        
        <div className="mt-auto flex flex-col gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn(
                'flex h-10 items-center gap-3 rounded-lg px-3 text-muted-foreground transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                 isSidebarExpanded ? 'w-full justify-start' : 'w-10 justify-center'
              )}>
                <Settings className="h-5 w-5 shrink-0" />
                {isSidebarExpanded && <span className="truncate">{t('settings')}</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                <span>{t('english')}</span>
              </DropdownMenuItem>
               <DropdownMenuItem onClick={() => setLanguage('pt')}>
                <span>{t('portuguese')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>{t('lightTheme')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                <span>{t('darkTheme')}</span>
              </DropdownMenuItem>
               <DropdownMenuItem onClick={() => setTheme("system")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('systemTheme')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

           <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className={cn(
                'flex h-10 items-center gap-3 rounded-lg px-3 text-muted-foreground transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isSidebarExpanded ? 'w-full justify-start' : 'w-10 justify-center'
              )}
              title={isSidebarExpanded ? t('collapseSidebar') : t('expandSidebar')}
            >
              {isSidebarExpanded ? <ChevronsLeft className="h-5 w-5 shrink-0" /> : <ChevronsRight className="h-5 w-5 shrink-0" /> }
              {isSidebarExpanded && <span className="truncate">{t('collapseSidebar')}</span>}
            </button>
        </div>
      </nav>
      <main className="flex-1 overflow-auto p-4 sm:p-6 bg-background/60 backdrop-blur-sm z-0">
        <div className="animate-in fade-in-50 duration-500">
           {renderModule()}
        </div>
      </main>
    </div>
  );
}
