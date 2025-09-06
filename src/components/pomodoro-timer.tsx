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
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';


type TimerMode = 'work' | 'break';

type Timer = {
  id: string;
  name: string;
  workDuration: number; // in seconds
  breakDuration: number; // in seconds
  timeLeft: number;
  isActive: boolean;
  mode: TimerMode;
};

export default function PomodoroTimer() {
    const [timers, setTimers] = useState<Timer[]>([]);
    const intervalRefs = useRef<Record<string, NodeJS.Timeout | null>>({});
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTimer, setEditingTimer] = useState<Omit<Timer, 'timeLeft' | 'isActive' | 'mode'> & { workDuration: number, breakDuration: number} | null>(null);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "timers"), (snapshot) => {
            const fetchedTimers = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Timer));
            setTimers(currentTimers => {
                // Preserve local state like timeLeft and isActive
                return fetchedTimers.map(ft => {
                    const existing = currentTimers.find(ct => ct.id === ft.id);
                    if (existing) {
                        return { ...ft, timeLeft: existing.timeLeft, isActive: existing.isActive };
                    }
                    return { ...ft, timeLeft: ft.workDuration, isActive: false };
                });
            });
        });
        return () => unsub();
    }, []);

    // Effect to handle countdown
    useEffect(() => {
        const activeTimer = timers.find(t => t.isActive);
        if (activeTimer) {
            if (!intervalRefs.current[activeTimer.id]) {
                 intervalRefs.current[activeTimer.id] = setInterval(() => {
                    setTimers(prev => prev.map(t => 
                        t.id === activeTimer.id ? { ...t, timeLeft: Math.max(0, t.timeLeft - 1) } : t
                    ));
                }, 1000);
            }
        }
        
        // Cleanup intervals
        return () => {
             Object.values(intervalRefs.current).forEach(interval => {
                if (interval) clearInterval(interval);
            });
            intervalRefs.current = {};
        };
    }, [timers]);

    // Effect to handle timer completion
    useEffect(() => {
        timers.forEach(timer => {
            if (timer.timeLeft === 0 && timer.isActive) {
                new Audio('https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3').play();
                const newMode = timer.mode === 'work' ? 'break' : 'work';
                const newTimeLeft = newMode === 'work' ? timer.workDuration : timer.breakDuration;
                
                const timerDocRef = doc(db, 'timers', timer.id);
                updateDoc(timerDocRef, { 
                    mode: newMode,
                    isActive: false, // Stop timer on completion
                });
                 setTimers(prev => prev.map(t => t.id === timer.id ? {
                    ...t,
                    isActive: false,
                    mode: newMode,
                    timeLeft: newTimeLeft,
                } : t));
            }
        });
    }, [timers]);

    const toggleTimer = async (id: string) => {
        const timer = timers.find(t => t.id === id);
        if (!timer) return;
        
        const timerDocRef = doc(db, 'timers', id);
        await updateDoc(timerDocRef, { isActive: !timer.isActive });
        setTimers(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
    };

    const resetTimer = async (id: string) => {
         const timer = timers.find(t => t.id === id);
        if (!timer) return;
        
        const timerDocRef = doc(db, 'timers', id);
        await updateDoc(timerDocRef, {
             isActive: false,
             mode: 'work',
        });
         setTimers(prev => prev.map(t => t.id === id ? {
            ...t,
            isActive: false,
            mode: 'work',
            timeLeft: t.workDuration
        } : t));
    };

    const addTimer = async () => {
        await addDoc(collection(db, 'timers'), {
            name: 'New Timer',
            workDuration: 25 * 60,
            breakDuration: 5 * 60,
            timeLeft: 25 * 60,
            isActive: false,
            mode: 'work',
        });
    };

    const deleteTimer = async (id: string) => {
        await deleteDoc(doc(db, 'timers', id));
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTimer) return;
        const timerDocRef = doc(db, 'timers', editingTimer.id);
        await updateDoc(timerDocRef, {
            name: editingTimer.name,
            workDuration: editingTimer.workDuration,
            breakDuration: editingTimer.breakDuration,
        });
        
        // also reset local state after edit
        setTimers(prev => prev.map(t => t.id === editingTimer.id ? {
            ...t,
            name: editingTimer.name,
            workDuration: editingTimer.workDuration,
            breakDuration: editingTimer.breakDuration,
            timeLeft: editingTimer.workDuration,
            mode: 'work',
            isActive: false,
        } : t));

        setIsEditDialogOpen(false);
        setEditingTimer(null);
    };

    const openEditDialog = (timer: Timer) => {
        setEditingTimer({ 
            id: timer.id,
            name: timer.name,
            workDuration: timer.workDuration,
            breakDuration: timer.breakDuration
        });
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
                            <Input id="work-duration" type="number" value={editingTimer.workDuration / 60} onChange={(e) => setEditingTimer({...editingTimer, workDuration: parseInt(e.target.value) * 60 })} />
                        </div>
                        <div>
                            <Label htmlFor="break-duration">Break Duration (minutes)</Label>
                            <Input id="break-duration" type="number" value={editingTimer.breakDuration / 60} onChange={(e) => setEditingTimer({...editingTimer, breakDuration: parseInt(e.target.value) * 60})} />
                        </div>
                        <Button type="submit"><Check className="mr-2"/>Save Changes</Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}
