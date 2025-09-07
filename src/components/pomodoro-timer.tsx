
"use client";

import { useState, useEffect } from 'react';
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
import { useLanguage } from '@/hooks/use-language';
import { useStorage } from '@/hooks/use-storage';
import { onSnapshot, addDoc, deleteDoc, updateDoc } from '@/lib/storage';

export type TimerMode = 'work' | 'break';

export type Timer = {
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
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTimer, setEditingTimer] = useState<Timer | null>(null);
    const { t } = useLanguage();
    const { storageMode } = useStorage();

    // Listener for DB changes
    useEffect(() => {
        const unsubscribe = onSnapshot('timers', (snapshot) => {
            const timersData = snapshot.map(doc => ({ id: doc.id, ...doc.data() } as Timer));
            setTimers(timersData);
        });
        return () => {
            if(unsubscribe) unsubscribe();
        };
    }, [storageMode]);


    const toggleTimer = async (id: string) => {
        const timer = timers.find(t => t.id === id);
        if (!timer) return;
        await updateDoc('timers', id, { isActive: !timer.isActive });
    };

    const resetTimer = async (id: string) => {
        const timer = timers.find(t => t.id === id);
        if (!timer) return;
        await updateDoc('timers', id, {
            isActive: false,
            mode: 'work',
            timeLeft: timer.workDuration
        });
    };

    const addTimer = async () => {
        await addDoc('timers', {
            name: 'New Timer',
            workDuration: 25 * 60,
            breakDuration: 5 * 60,
            timeLeft: 25 * 60,
            isActive: false,
            mode: 'work',
        });
    };

    const deleteTimer = async (id: string) => {
        await deleteDoc("timers", id);
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTimer) return;
        
        const workDurationInSeconds = Number(editingTimer.workDuration);
        const breakDurationInSeconds = Number(editingTimer.breakDuration);

        await updateDoc('timers', editingTimer.id, {
            name: editingTimer.name,
            workDuration: workDurationInSeconds,
            breakDuration: breakDurationInSeconds,
            timeLeft: workDurationInSeconds, // Reset time on edit
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

    const handleDurationChange = (field: 'workDuration' | 'breakDuration', value: string) => {
        if (!editingTimer) return;
        const minutes = parseInt(value, 10);
        const seconds = isNaN(minutes) ? 0 : minutes * 60;
        setEditingTimer({...editingTimer, [field]: seconds });
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
                            <Input id="work-duration" type="number" value={editingTimer.workDuration > 0 ? editingTimer.workDuration / 60 : ''} onChange={(e) => handleDurationChange('workDuration', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="break-duration">{t('breakDuration')}</Label>
                            <Input id="break-duration" type="number" value={editingTimer.breakDuration > 0 ? editingTimer.breakDuration / 60 : ''} onChange={(e) => handleDurationChange('breakDuration', e.target.value)} />
                        </div>
                        <Button type="submit"><Check className="mr-2"/>{t('saveChanges')}</Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}
