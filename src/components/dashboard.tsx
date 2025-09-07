"use client";

import { useLanguage } from "@/hooks/use-language";

export default function Dashboard() {
  const { t } = useLanguage();
  return (
    <div className="flex h-full min-h-[80vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-primary">
          {t('eln')}
        </h1>
        <p className="mt-4 text-2xl font-medium text-foreground">
          {t('electronicLabNotebook')}
        </p>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          {t('welcomeMessage')}
        </p>
      </div>
    </div>
  );
}
