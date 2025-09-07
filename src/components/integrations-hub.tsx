
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Dot, GitBranch, MessageSquare, Workflow, PenTool, FileText, KanbanSquare, Zap } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';

type IntegrationId = 'google-calendar' | 'github' | 'slack' | 'n8n' | 'figma' | 'notion' | 'linear' | 'discord' | 'zapier';

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
  },
  {
    id: 'n8n',
    name: 'n8n',
    description: 'n8nDescription',
    icon: <Workflow className="w-12 h-12 p-2 rounded-lg border bg-card text-primary"/>,
    category: 'Automation',
  },
  {
    id: 'figma',
    name: 'figma',
    description: 'figmaDescription',
    icon: <PenTool className="w-12 h-12 p-2 rounded-lg border bg-card text-primary"/>,
    category: 'Design',
  },
  {
    id: 'notion',
    name: 'notion',
    description: 'notionDescription',
    icon: <FileText className="w-12 h-12 p-2 rounded-lg border bg-card text-primary"/>,
    category: 'Productivity',
  },
  {
    id: 'linear',
    name: 'linear',
    description: 'linearDescription',
    icon: <KanbanSquare className="w-12 h-12 p-2 rounded-lg border bg-card text-primary"/>,
    category: 'Development',
  },
  {
    id: 'discord',
    name: 'discord',
    description: 'discordDescription',
    icon: <MessageSquare className="w-12 h-12 p-2 rounded-lg border bg-card text-primary"/>,
    category: 'Communication',
  },
  {
    id: 'zapier',
    name: 'zapier',
    description: 'zapierDescription',
    icon: <Zap className="w-12 h-12 p-2 rounded-lg border bg-card text-primary"/>,
    category: 'Automation',
  }
];

export default function IntegrationsHub() {
  const { t } = useLanguage();
  const [connected, setConnected] = useState<Record<IntegrationId, boolean>>({
    'google-calendar': false,
    'github': false,
    'slack': false,
    'n8n': false,
    'figma': false,
    'notion': false,
    'linear': false,
    'discord': false,
    'zapier': false,
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
               {typeof integration.icon === 'string' ? <Image src={integration.icon} alt={t(integration.name as any)} width={48} height={48} className="rounded-lg border p-2 bg-card"/> : integration.icon}
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
