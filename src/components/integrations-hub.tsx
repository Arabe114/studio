
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Dot, GitBranch, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';

type IntegrationId = 'google-calendar' | 'github' | 'slack';

const integrations = [
  {
    id: 'google-calendar',
    name: 'googleCalendar',
    description: 'googleCalendarDescription',
    icon: '/google-calendar.svg',
    category: 'Productivity',
  },
  {
    id: 'github',
    name: 'github',
    description: 'githubDescription',
    icon: '/github.svg',
    category: 'Development',
  },
  {
    id: 'slack',
    name: 'slack',
    description: 'slackDescription',
    icon: '/slack.svg',
    category: 'Communication',
  }
];

export default function IntegrationsHub() {
  const { t } = useLanguage();
  const [connected, setConnected] = useState<Record<IntegrationId, boolean>>({
    'google-calendar': false,
    'github': false,
    'slack': false,
  });

  const handleConnect = (id: IntegrationId) => {
    setConnected(prev => ({...prev, [id]: !prev[id]}));
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold">{t('integrationsHub')}</h1>
      <p className="text-muted-foreground mt-2 mb-8 max-w-2xl">
        {t('integrationsDescription')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="flex flex-col">
            <CardHeader className="flex-row items-start gap-4">
               <Image src={integration.icon} alt={t(integration.name as any)} width={48} height={48} className="rounded-lg border p-2 bg-card"/>
               <div>
                <CardTitle>{t(integration.name as any)}</CardTitle>
                <p className="text-sm text-muted-foreground">{integration.category}</p>
               </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">{t(integration.description as any)}</p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                variant={connected[integration.id as IntegrationId] ? "secondary" : "default"}
                onClick={() => handleConnect(integration.id as IntegrationId)}
              >
                {connected[integration.id as IntegrationId] ? (
                  <>
                    <Check className="mr-2" /> {t('connected')}
                  </>
                ) : t('connect')}
              </Button>
            </CardFooter>
          </Card>
        ))}
        {/* Placeholder for more integrations */}
        <Card className="flex flex-col items-center justify-center border-dashed text-center p-6">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                <Dot />
                <Dot />
                <Dot />
            </div>
            <h3 className="font-semibold">{t('comingSoon')}</h3>
            <p className="text-sm text-muted-foreground">More integrations are on the way!</p>
        </Card>
      </div>
    </div>
  );
}

