
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Dot, GitBranch, MessageSquare, Workflow, PenTool, FileText, KanbanSquare, Zap, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';
import { useStorage } from '@/hooks/use-storage';
import { onDoc, setDoc } from '@/lib/storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type IntegrationId = 'google-calendar' | 'github' | 'slack' | 'n8n' | 'figma' | 'notion' | 'linear' | 'discord' | 'zapier';

type Credential = { [key: string]: string };

type IntegrationState = {
  connected: boolean;
  credentials: Credential;
};

const integrations = [
  {
    id: 'google-calendar' as IntegrationId,
    name: 'googleCalendar',
    description: 'googleCalendarDescription',
    icon: '/google-calendar.svg',
    category: 'Productivity',
    fields: ['Client ID', 'Client Secret', 'API Key']
  },
  {
    id: 'github' as IntegrationId,
    name: 'github',
    description: 'githubDescription',
    icon: '/github.svg',
    category: 'Development',
    fields: ['Personal Access Token']
  },
  {
    id: 'slack' as IntegrationId,
    name: 'slack',
    description: 'slackDescription',
    icon: '/slack.svg',
    category: 'Communication',
    fields: ['Bot User OAuth Token']
  },
  {
    id: 'n8n' as IntegrationId,
    name: 'n8n',
    description: 'n8nDescription',
    icon: <Workflow className="w-12 h-12 p-2 rounded-lg border bg-card text-primary"/>,
    category: 'Automation',
    fields: ['Webhook URL', 'API Key']
  },
  {
    id: 'figma' as IntegrationId,
    name: 'figma',
    description: 'figmaDescription',
    icon: <PenTool className="w-12 h-12 p-2 rounded-lg border bg-card text-primary"/>,
    category: 'Design',
    fields: ['Personal Access Token']
  },
  {
    id: 'notion' as IntegrationId,
    name: 'notion',
    description: 'notionDescription',
    icon: <FileText className="w-12 h-12 p-2 rounded-lg border bg-card text-primary"/>,
    category: 'Productivity',
    fields: ['Integration Token (Internal)']
  },
  {
    id: 'linear' as IntegrationId,
    name: 'linear',
    description: 'linearDescription',
    icon: <KanbanSquare className="w-12 h-12 p-2 rounded-lg border bg-card text-primary"/>,
    category: 'Development',
    fields: ['Personal API Key']
  },
  {
    id: 'discord' as IntegrationId,
    name: 'discord',
    description: 'discordDescription',
    icon: <MessageSquare className="w-12 h-12 p-2 rounded-lg border bg-card text-primary"/>,
    category: 'Communication',
    fields: ['Webhook URL']
  },
  {
    id: 'zapier' as IntegrationId,
    name: 'zapier',
    description: 'zapierDescription',
    icon: <Zap className="w-12 h-12 p-2 rounded-lg border bg-card text-primary"/>,
    category: 'Automation',
    fields: ['Webhook URL']
  }
];

const defaultConnectionState: Record<IntegrationId, IntegrationState> = integrations.reduce((acc, int) => {
    acc[int.id] = { connected: false, credentials: {} };
    return acc;
}, {} as Record<IntegrationId, IntegrationState>);


export default function IntegrationsHub() {
  const { t } = useLanguage();
  const [connectionStates, setConnectionStates] = useState<Record<IntegrationId, IntegrationState>>(defaultConnectionState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIntegration, setCurrentIntegration] = useState<(typeof integrations)[number] | null>(null);
  const [currentCredentials, setCurrentCredentials] = useState<Credential>({});
  const { storageMode } = useStorage();
  
  useEffect(() => {
    const unsubscribe = onDoc('integrations', 'connection-status', (doc) => {
        if (doc && doc.exists()) {
            const data = doc.data();
            setConnectionStates({ ...defaultConnectionState, ...data });
        } else {
            setDoc('integrations', 'connection-status', defaultConnectionState);
        }
    });
    
    return () => {
      if(unsubscribe) unsubscribe();
    }
  }, [storageMode]);

  const openModal = (integration: (typeof integrations)[number]) => {
      setCurrentIntegration(integration);
      setCurrentCredentials(connectionStates[integration.id]?.credentials || {});
      setIsModalOpen(true);
  };
  
  const handleSaveCredentials = async () => {
    if (!currentIntegration) return;

    const newStates = {
        ...connectionStates,
        [currentIntegration.id]: {
            connected: true,
            credentials: currentCredentials
        }
    };
    setConnectionStates(newStates); // Optimistic update
    await setDoc('integrations', 'connection-status', newStates, { merge: true });
    setIsModalOpen(false);
  };

  const handleDisconnect = async () => {
      if (!currentIntegration) return;
      
      const newStates = {
          ...connectionStates,
          [currentIntegration.id]: {
              connected: false,
              credentials: {}
          }
      };
      setConnectionStates(newStates);
      await setDoc('integrations', 'connection-status', newStates, { merge: true });
      setIsModalOpen(false);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">{t('integrationsHub')}</h1>
      <p className="text-muted-foreground mt-2 mb-8 max-w-2xl">
        {t('integrationsDescription')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => {
            const isConnected = connectionStates[integration.id]?.connected;
            return (
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
                    variant={isConnected ? "secondary" : "default"}
                    onClick={() => openModal(integration)}
                  >
                    {isConnected ? (
                      <>
                        <Check className="mr-2" /> {t('connected')}
                      </>
                    ) : t('connect')}
                  </Button>
                </CardFooter>
              </Card>
            )
        })}

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
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
            {currentIntegration && (
                <>
                    <DialogHeader>
                        <DialogTitle>
                            {connectionStates[currentIntegration.id]?.connected ? t('manage') : t('connect')} {t(currentIntegration.name as any)}
                        </DialogTitle>
                        <CardDescription>{t('saveCredentialsDescription')}</CardDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {currentIntegration.fields.map(field => (
                            <div key={field} className="space-y-2">
                                <Label htmlFor={field}>{field}</Label>
                                <Input 
                                    id={field}
                                    type="password"
                                    value={currentCredentials[field] || ''}
                                    onChange={(e) => setCurrentCredentials({...currentCredentials, [field]: e.target.value})}
                                />
                            </div>
                        ))}
                    </div>
                    <DialogFooter className="justify-between sm:justify-between">
                         <div>
                            {connectionStates[currentIntegration.id]?.connected && (
                                <Button variant="destructive" onClick={handleDisconnect}>
                                   <Trash2 /> {t('disconnect')}
                                </Button>
                            )}
                         </div>
                         <div className="flex gap-2">
                             <DialogClose asChild><Button variant="ghost">{t('cancel')}</Button></DialogClose>
                             <Button onClick={handleSaveCredentials}>{t('saveCredentials')}</Button>
                         </div>
                    </DialogFooter>
                </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
