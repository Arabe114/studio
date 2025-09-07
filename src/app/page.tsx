"use client";

import { useState } from 'react';
import AppShell from '@/components/app-shell';
import AuthScreen from '@/components/auth-screen';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return <AppShell />;
}
