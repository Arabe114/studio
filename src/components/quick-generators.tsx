
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export default function QuickGenerators() {
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('quickGenerators')}</h1>
      <p className="text-muted-foreground mb-8">
        {t('quickGeneratorsDescription')}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Password Generator</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">
                    Create strong, secure passwords.
                </p>
                <Button disabled>Generate</Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>QR Code Generator</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">
                    Generate a QR code from any text or URL.
                </p>
                <Button disabled>Generate</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
