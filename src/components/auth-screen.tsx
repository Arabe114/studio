
"use client";

import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '@/hooks/use-language';
import AnimatedBackground from './animated-background';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

export default function AuthScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const CORRECT_PIN = '7984';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if(!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty('--mouse-x', `${x}px`);
    containerRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const handlePinChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
    
    const completePin = newPin.join('');
    if (completePin.length === 4) {
      handleSubmit(completePin);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d{4}$/.test(pastedData)) {
      const newPin = pastedData.split('');
      setPin(newPin);
       const completePin = newPin.join('');
       if (completePin.length === 4) {
         handleSubmit(completePin);
       }
    }
  };

  const handleSubmit = (finalPin: string) => {
    if (finalPin === CORRECT_PIN) {
      setError('');
      setIsSuccess(true);
      setTimeout(() => {
        onAuthenticated();
      }, 1000); 
    } else {
      setError('Invalid PIN. Please try again.');
      setPin(['', '', '', '']);
      inputsRef.current[0]?.focus();
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-transparent">
        <AnimatedBackground />
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className={cn(
                "group/auth relative z-10 w-full max-w-md rounded-xl bg-card/60 backdrop-blur-lg border border-primary/20 p-8 text-center space-y-6 transform transition-all duration-500",
                isSuccess && "animate-success-pop",
                "before:absolute before:inset-0 before:rounded-xl before:bg-glow before:opacity-0 before:transition-opacity hover:before:opacity-100"
            )}>
            <div className="mx-auto w-fit rounded-full bg-primary/10 p-4 border border-primary/20">
                <Lock className="h-8 w-8 text-primary" />
            </div>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Enter Access Code</h1>
                <p className="text-muted-foreground">Please enter your PIN to continue.</p>
            </div>
            
            <div 
                className={cn(
                  "relative flex justify-center gap-3 p-1 rounded-lg",
                  error && "animate-shake"
                )}
                onAnimationEnd={() => setError('')}
            >
                <div className="absolute inset-0 rounded-lg animate-neon-border-pulse -z-10"></div>
                {pin.map((digit, index) => (
                <Input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={cn(
                        "h-16 w-14 text-center text-4xl font-mono transition-shadow duration-300",
                        "focus-visible:shadow-neon-primary focus-visible:ring-primary",
                        error && "border-destructive focus-visible:ring-destructive focus-visible:shadow-none",
                        isSuccess && "border-green-500"
                    )}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                />
                ))}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    </div>
  );
}
