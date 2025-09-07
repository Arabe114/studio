
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
  const { t } = useLanguage();

  const CORRECT_PIN = '7984';

  const handlePinChange = (index: number, value: string) => {
    // Only allow single numeric digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Move to next input if a digit is entered
    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
    
    // Check if pin is complete
    const completePin = newPin.join('');
    if (completePin.length === 4) {
      handleSubmit(completePin);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
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
      }, 1000); // Wait for success animation
    } else {
      setError('Invalid PIN. Please try again.');
      setPin(['', '', '', '']);
      inputsRef.current[0]?.focus();
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-transparent">
        <AnimatedBackground />
        <div className={cn(
            "z-10 w-full max-w-md rounded-xl bg-card/60 backdrop-blur-lg border border-primary/20 p-8 text-center space-y-6 transform transition-all duration-500 animate-neon-pulse",
            isSuccess && "animate-success-pop"
        )}>
            <div className="mx-auto w-fit rounded-full bg-primary/10 p-4 border border-primary/20">
                <Lock className="h-8 w-8 text-primary" />
            </div>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Enter Access Code</h1>
                <p className="text-muted-foreground">Please enter your PIN to continue.</p>
            </div>
            
            <div 
                className={cn("flex justify-center gap-3", error && "animate-shake")}
                onAnimationEnd={() => setError('')}
            >
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
                        "h-16 w-14 text-center text-4xl font-mono",
                        error && "border-destructive focus-visible:ring-destructive",
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
