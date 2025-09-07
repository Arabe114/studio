
import { onSnapshot, updateDoc } from './storage';
import type { Timer } from '@/components/pomodoro-timer';

// This module manages all timers globally, independent of React components.
let timers: Timer[] = [];
let interval: NodeJS.Timeout | null = null;
let unsubscribe: (() => void) | undefined = undefined;

function tick() {
  timers.forEach(timer => {
    if (timer.isActive && timer.timeLeft > 0) {
      // Update locally first for immediate feedback if needed, but DB is source of truth
      timer.timeLeft -= 1;
      updateDoc('timers', timer.id, { timeLeft: timer.timeLeft });
    } else if (timer.isActive && timer.timeLeft <= 0) {
      // Timer finished, switch mode and stop it
      const newMode = timer.mode === 'work' ? 'break' : 'work';
      const newTimeLeft = newMode === 'work' ? timer.workDuration : timer.breakDuration;
      
      // Play a sound
      new Audio('https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3').play();
      
      updateDoc('timers', timer.id, {
        isActive: false, // Stop the timer after it finishes a cycle
        mode: newMode,
        timeLeft: newTimeLeft,
      });
    }
  });
}

function startManager() {
  if (interval) return; // Manager already running
  console.log("Starting global timer manager...");
  interval = setInterval(tick, 1000);
}

function stopManager() {
  if (interval) {
    console.log("Stopping global timer manager...");
    clearInterval(interval);
    interval = null;
  }
}

export function initializeTimerManager() {
  // If there's an existing listener, stop it before starting a new one
  if (unsubscribe) {
    unsubscribe();
  }

  // Listen for changes in the 'timers' collection
  unsubscribe = onSnapshot('timers', (snapshot) => {
    timers = snapshot.map(doc => ({ id: doc.id, ...doc.data() } as Timer));
    
    // Start or stop the interval based on whether there are active timers
    const hasActiveTimers = timers.some(t => t.isActive);
    if (hasActiveTimers) {
      startManager();
    } else {
      stopManager();
    }
  });

  // Return a cleanup function
  return () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = undefined;
    }
    stopManager();
  };
}
