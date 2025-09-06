"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Plus, Trash2, Pencil, Check } from 'lucide-react';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from './ui/label';

type TimerMode = 'work' | 'break';

type Timer = {
  id: string;
  name: string;
  workDuration: number;
  breakDuration: number;
  timeLeft: number;
  isActive: boolean;
  mode: TimerMode;
};

const initialTimers: Timer[] = [
    {
        id: 'pomodoro-1',
        name: 'Focus Session',
        workDuration: 25 * 60,
        breakDuration: 5 * 60,
        timeLeft: 25 * 60,
        isActive: false,
        mode: 'work',
    },
];

export default function PomodoroTimer() {
    const [timers, setTimers] = useState<Timer[]>(initialTimers);
    const intervalRefs = useRef<Record<string, NodeJS.Timeout | null>>({});
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTimer, setEditingTimer] = useState<Timer | null>(null);

    // Effect to handle countdown
    useEffect(() => {
        timers.forEach(timer => {
            if (timer.isActive) {
                if (!intervalRefs.current[timer.id]) {
                    intervalRefs.current[timer.id] = setInterval(() => {
                        setTimers(prev => prev.map(t => 
                            t.id === timer.id ? { ...t, timeLeft: t.timeLeft - 1 } : t
                        ));
                    }, 1000);
                }
            } else {
                if (intervalRefs.current[timer.id]) {
                    clearInterval(intervalRefs.current[timer.id]!);
                    intervalRefs.current[timer.id] = null;
                }
            }
        });

        // Cleanup on component unmount
        return () => {
            Object.values(intervalRefs.current).forEach(interval => {
                if (interval) clearInterval(interval);
            });
        };
    }, [timers]);

    // Effect to handle timer completion
    useEffect(() => {
        timers.forEach(timer => {
            if (timer.timeLeft === 0) {
                new Audio('https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3').play();
                setTimers(prev => prev.map(t => {
                    if (t.id === timer.id) {
                        const newMode = t.mode === 'work' ? 'break' : 'work';
                        return {
                            ...t,
                            isActive: false,
                            mode: newMode,
                            timeLeft: newMode === 'work' ? t.workDuration : t.breakDuration,
                        };
                    }
                    return t;
                }));
            }
        });
    }, [timers]);

    const toggleTimer = (id: string) => {
        setTimers(prev => prev.map(t => 
            t.id === id ? { ...t, isActive: !t.isActive } : t
        ));
    };

    const resetTimer = (id: string) => {
        setTimers(prev => prev.map(t => {
            if (t.id === id) {
                if (intervalRefs.current[id]) {
                    clearInterval(intervalRefs.current[id]!);
                    intervalRefs.current[id] = null;
                }
                return {
                    ...t,
                    isActive: false,
                    timeLeft: t.mode === 'work' ? t.workDuration : t.breakDuration,
                };
            }
            return t;
        }));
    };

    const addTimer = () => {
        const newId = `pomodoro-${Date.now()}`;
        setTimers(prev => [...prev, {
            id: newId,
            name: 'New Timer',
            workDuration: 25 * 60,
            breakDuration: 5 * 60,
            timeLeft: 25 * 60,
            isActive: false,
            mode: 'work',
        }]);
    };

    const deleteTimer = (id: string) => {
        if (intervalRefs.current[id]) {
            clearInterval(intervalRefs.current[id]!);
            delete intervalRefs.current[id];
        }
        setTimers(prev => prev.filter(t => t.id !== id));
    };

    const handleEditSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTimer) return;
        setTimers(prev => prev.map(t => t.id === editingTimer.id ? editingTimer : t));
        setIsEditDialogOpen(false);
        setEditingTimer(null);
    };

    const openEditDialog = (timer: Timer) => {
        setEditingTimer({ ...timer, workDuration: timer.workDuration / 60, breakDuration: timer.breakDuration / 60 });
        setIsEditDialogOpen(true);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pomodoro Timers</h1>
        <Button onClick={addTimer}>
            <Plus className="mr-2" /> Add Timer
        </Button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {timers.map(timer => (
            <Card key={timer.id} className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>{timer.name}</span>
                    <span className="text-sm font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                        {timer.mode === 'work' ? 'Focus' : 'Break'}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center gap-6">
                <div className="text-7xl font-bold font-mono text-primary">
                    {formatTime(timer.timeLeft)}
                </div>
                <div className="flex gap-2">
                <Button onClick={() => toggleTimer(timer.id)} size="icon">
                    {timer.isActive ? <Pause /> : <Play />}
                </Button>
                <Button onClick={() => resetTimer(timer.id)} size="icon" variant="outline">
                    <RotateCcw />
                </Button>
                <Button onClick={() => openEditDialog(timer)} size="icon" variant="outline">
                    <Pencil />
                </Button>
                 <Button onClick={() => deleteTimer(timer.id)} size="icon" variant="destructive">
                    <Trash2 />
                </Button>
                </div>
            </CardContent>
            </Card>
        ))}
       </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Timer</DialogTitle>
                </DialogHeader>
                {editingTimer && (
                     <form onSubmit={handleEditSave} className="space-y-4">
                        <div>
                            <Label htmlFor="timer-name">Timer Name</Label>
                            <Input id="timer-name" value={editingTimer.name} onChange={(e) => setEditingTimer({...editingTimer, name: e.target.value})} />
                        </div>
                        <div>
                            <Label htmlFor="work-duration">Work Duration (minutes)</Label>
                            <Input id="work-duration" type="number" value={editingTimer.workDuration} onChange={(e) => setEditingTimer({...editingTimer, workDuration: parseInt(e.target.value) * 60, timeLeft: parseInt(e.target.value) * 60})} />
                        </div>
                        <div>
                            <Label htmlFor="break-duration">Break Duration (minutes)</Label>
                            <Input id="break-duration" type="number" value={editingTimer.breakDuration} onChange={(e) => setEditingTimer({...editingTimer, breakDuration: parseInt(e.target.value) * 60})} />
                        </div>
                        <Button type="submit"><Check className="mr-2"/>Save Changes</Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}
