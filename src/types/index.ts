
import type { FC } from 'react';

export type Module =
  | 'dashboard'
  | 'knowledge-graph'
  | 'kanban-board'
  | 'notes-editor'
  | 'calendar'
  | 'pomodoro'
  | 'budget'
  | 'ai-tools'
  | 'tech-news'
  | 'integrations'
  | 'draw-board'
  | 'quick-generators'
  | 'data-lookup'
  | 'english-learning';

export interface NavItem {
  id: Module;
  icon: FC<React.ComponentProps<'svg'>>;
  labelKey: "dashboard" | "knowledgeGraph" | "taskBoard" | "notesEditor" | "calendar" | "pomodoroTimer" | "budgetTracker" | "aiTools" | "techNews" | "integrationsHub" | "drawBoard" | "quickGenerators" | "dataLookupTools" | "englishLearning";
}
