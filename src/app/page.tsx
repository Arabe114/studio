
"use client";

import { useState, useEffect } from 'react';
import AppShell from '@/components/app-shell';
import AuthScreen from '@/components/auth-screen';
import { cn } from '@/lib/utils';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Handle the fade-in of the AppShell after authentication
    if (isAuthenticating) {
      const timer = setTimeout(() => {
        setIsAuthenticated(true);
        setIsAuthenticating(false);
      }, 500); // Should match animation duration
      return () => clearTimeout(timer);
    }
  }, [isAuthenticating]);

  useEffect(() => {
    // Handle the fade-out of the AppShell on exit
    if (isExiting) {
        const timer = setTimeout(() => {
            setIsAuthenticated(false);
            setIsExiting(false);
        }, 500); // Should match animation duration
        return () => clearTimeout(timer);
    }
  }, [isExiting]);

  const handleAuthenticated = () => {
    setIsAuthenticating(true);
  };

  const handleExit = () => {
    setIsExiting(true);
  };

  return (
    <div className="relative h-screen w-screen">
      <div className={cn("absolute inset-0 transition-opacity duration-500", 
        (isAuthenticated && !isExiting) ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        <AuthScreen onAuthenticated={handleAuthenticated} />
      </div>
      
      <div className={cn("absolute inset-0 transition-opacity duration-500", 
        (isAuthenticated && !isExiting) ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        {isAuthenticated && <AppShell onExit={handleExit} />}
      </div>
    </div>
  );
}
