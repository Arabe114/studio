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
} from '@/components/ui/dialog';
import { Label } from './ui/label';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';

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
    const [editingTimer, setEditingTimer] = useState<Timer | null>(null);
    const { t } = useLanguage();

    useEffect(() => {
        const q = collection(db, 'timers');
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const timersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Timer));
            setTimers(timersData);
        });
        return () => {
             Object.values(intervalRefs.current).forEach(interval => {
                if (interval) clearInterval(interval);
            });
            unsubscribe();
        };
    }, []);

    // Effect to handle countdown
    useEffect(() => {
        timers.forEach(timer => {
            if (timer.isActive) {
                if (!intervalRefs.current[timer.id]) {
                    intervalRefs.current[timer.id] = setInterval(async () => {
                        // We need to fetch the latest timer data from state inside interval
                        setTimers(currentTimers => {
                            const currentTimer = currentTimers.find(t => t.id === timer.id);
                            if (currentTimer && currentTimer.timeLeft > 0) {
                                const newTimeLeft = currentTimer.timeLeft - 1;
                                const timerRef = doc(db, 'timers', timer.id);
                                updateDoc(timerRef, { timeLeft: newTimeLeft });
                            }
                            return currentTimers;
                        })
                    }, 1000);
                }
            } else {
                if (intervalRefs.current[timer.id]) {
                    clearInterval(intervalRefs.current[timer.id]!);
                    intervalRefs.current[timer.id] = null;
                }
            }
        });
        
        return () => {
             Object.values(intervalRefs.current).forEach(interval => {
                if (interval) clearInterval(interval);
            });
        };
    }, [timers.map(t => t.isActive).join(',')]); // Rerun when any timer is toggled

    // Effect to handle timer completion
    useEffect(() => {
        timers.forEach(async timer => {
            if (timer.timeLeft === 0 && timer.isActive) {
                new Audio('https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3').play();
                const newMode = timer.mode === 'work' ? 'break' : 'work';
                const newTimeLeft = newMode === 'work' ? timer.workDuration : timer.breakDuration;
                
                const timerRef = doc(db, 'timers', timer.id);
                await updateDoc(timerRef, {
                    isActive: false, // Stop the timer
                    mode: newMode,
                    timeLeft: newTimeLeft,
                });
            }
        });
    }, [timers.map(t => t.timeLeft).join(',')]); // Rerun when any timer's time changes


    const toggleTimer = async (id: string) => {
        const timer = timers.find(t => t.id === id);
        if (!timer) return;
        const timerRef = doc(db, 'timers', id);
        await updateDoc(timerRef, { isActive: !timer.isActive });
    };

    const resetTimer = async (id: string) => {
        const timer = timers.find(t => t.id === id);
        if (!timer) return;
        const timerRef = doc(db, 'timers', id);
        await updateDoc(timerRef, {
            isActive: false,
            mode: 'work',
            timeLeft: timer.workDuration
        });
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
        if (intervalRefs.current[id]) {
            clearInterval(intervalRefs.current[id]!);
            intervalRefs.current[id] = null;
        }
        await deleteDoc(doc(db, "timers", id));
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTimer) return;
        
        const timerRef = doc(db, 'timers', editingTimer.id);
        const workDuration = editingTimer.workDuration;

        await updateDoc(timerRef, {
            name: editingTimer.name,
            workDuration: workDuration,
            breakDuration: editingTimer.breakDuration,
            timeLeft: workDuration, // Reset time on edit
            isActive: false,
            mode: 'work',
        });

        setIsEditDialogOpen(false);
        setEditingTimer(null);
    };

    const openEditDialog = (timer: Timer) => {
        setEditingTimer(JSON.parse(JSON.stringify(timer))); // Deep copy
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
        <h1 className="text-3xl font-bold">{t('pomodoroTimers')}</h1>
        <Button onClick={addTimer}>
            <Plus className="mr-2" /> {t('addTimer')}
        </Button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {timers.map(timer => (
            <Card key={timer.id} className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>{timer.name}</span>
                    <span className="text-sm font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                        {timer.mode === 'work' ? t('focus') : t('break')}
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
                    <DialogTitle>{t('editTimer')}</DialogTitle>
                </DialogHeader>
                {editingTimer && (
                     <form onSubmit={handleEditSave} className="space-y-4">
                        <div>
                            <Label htmlFor="timer-name">{t('timerName')}</Label>
                            <Input id="timer-name" value={editingTimer.name} onChange={(e) => setEditingTimer({...editingTimer, name: e.target.value})} />
                        </div>
                        <div>
                            <Label htmlFor="work-duration">{t('workDuration')}</Label>
                            <Input id="work-duration" type="number" value={editingTimer.workDuration / 60} onChange={(e) => setEditingTimer({...editingTimer, workDuration: parseInt(e.target.value) * 60 })} />
                        </div>
                        <div>
                            <Label htmlFor="break-duration">{t('breakDuration')}</Label>
                            <Input id="break-duration" type="number" value={editingTimer.breakDuration / 60} onChange={(e) => setEditingTimer({...editingTimer, breakDuration: parseInt(e.target.value) * 60})} />
                        </div>
                        <Button type="submit"><Check className="mr-2"/>{t('saveChanges')}</Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}
