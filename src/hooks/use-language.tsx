"use client";

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import en from '@/locales/en.json';
import pt from '@/locales/pt.json';

type Language = 'en' | 'pt';

type Translations = typeof en;

const translations: Record<Language, Translations> = { en, pt };

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof Translations, options?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = useMemo(() => (key: keyof Translations, options?: Record<string, string | number>) => {
    let text = translations[language][key] || translations['en'][key];
    if (options) {
      Object.entries(options).forEach(([optionKey, optionValue]) => {
        text = text.replace(`{{${optionKey}}}`, String(optionValue));
      });
    }
    return text;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
