
"use client";

import { useState, useEffect } from 'react';
import AppShell from '@/components/app-shell';
import AuthScreen from '@/components/auth-screen';
import { cn } from '@/lib/utils';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (isAuthenticating) {
      const timer = setTimeout(() => {
        setIsAuthenticated(true);
      }, 500); // Should match animation duration
      return () => clearTimeout(timer);
    }
  }, [isAuthenticating]);

  const handleAuthenticated = () => {
    setIsAuthenticating(true);
  };

  return (
    <div className="relative h-screen w-screen">
      {!isAuthenticated && (
          <div className={cn("absolute inset-0 transition-opacity duration-500", isAuthenticating ? "opacity-0" : "opacity-100")}>
             <AuthScreen onAuthenticated={handleAuthenticated} />
          </div>
      )}
      {(isAuthenticating || isAuthenticated) && (
        <div className={cn("absolute inset-0 transition-opacity duration-500", isAuthenticating && !isAuthenticated ? "opacity-0" : "opacity-100")}>
            <AppShell />
        </div>
      )}
    </div>
  );
}
