"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Cpu } from 'lucide-react';

export default function DataLookup() {
  const { t } = useLanguage();
  return (
    <div>
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-lg bg-card border">
            <Cpu className="h-12 w-12 text-muted-foreground mb-4" />
            <h1 className="text-3xl font-bold mb-6">{t('dataLookupTools')}</h1>
            <p className="text-muted-foreground max-w-lg">
                {t('dataLookupToolsDescription')}
            </p>
        </div>
    </div>
  );
}
