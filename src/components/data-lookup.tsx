
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AtSign, Building2, MailCheck, MapPin, Search, Server, Smartphone, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { dataLookup, DataLookupOutput } from '@/ai/flows/data-lookup-flow';
import { Skeleton } from './ui/skeleton';

type ToolId = 'email-validator' | 'phone-inspector' | 'ip-geolocation' | 'domain-whois' | 'company-finder' | 'username-search';

const lookupTools = [
    {
        id: 'email-validator' as ToolId,
        icon: MailCheck,
        titleKey: 'emailValidator',
        descriptionKey: 'emailValidatorDescription',
        placeholderKey: 'emailPlaceholder'
    },
    {
        id: 'phone-inspector' as ToolId,
        icon: Smartphone,
        titleKey: 'phoneInspector',
        descriptionKey: 'phoneInspectorDescription',
        placeholderKey: 'phonePlaceholder'
    },
    {
        id: 'ip-geolocation' as ToolId,
        icon: MapPin,
        titleKey: 'ipGeolocation',
        descriptionKey: 'ipGeolocationDescription',
        placeholderKey: 'ipPlaceholder'
    },
    {
        id: 'domain-whois' as ToolId,
        icon: Server,
        titleKey: 'domainWhois',
        descriptionKey: 'domainWhoisDescription',
        placeholderKey: 'domainPlaceholder'
    },
    {
        id: 'company-finder' as ToolId,
        icon: Building2,
        titleKey: 'companyFinder',
        descriptionKey: 'companyFinderDescription',
        placeholderKey: 'companyPlaceholder'
    },
    {
        id: 'username-search' as ToolId,
        icon: AtSign,
        titleKey: 'usernameSearch',
        descriptionKey: 'usernameSearchDescription',
        placeholderKey: 'usernamePlaceholder'
    }
]

export default function DataLookup() {
  const { t } = useLanguage();
  const [inputs, setInputs] = useState<Record<ToolId, string>>({
    'email-validator': 'hello@example.com',
    'phone-inspector': '+15551234567',
    'ip-geolocation': '8.8.8.8',
    'domain-whois': 'google.com',
    'company-finder': 'Firebase',
    'username-search': 'awesome-user',
  });
  const [results, setResults] = useState<Record<ToolId, DataLookupOutput['result'] | null>>({
    'email-validator': null,
    'phone-inspector': null,
    'ip-geolocation': null,
    'domain-whois': null,
    'company-finder': null,
    'username-search': null,
  });
  const [loading, setLoading] = useState<Record<ToolId, boolean>>({
    'email-validator': false,
    'phone-inspector': false,
    'ip-geolocation': false,
    'domain-whois': false,
    'company-finder': false,
    'username-search': false,
  });

  const handleInputChange = (id: ToolId, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSearch = async (id: ToolId) => {
    if (!inputs[id]) return;
    setLoading(prev => ({...prev, [id]: true}));
    setResults(prev => ({...prev, [id]: null}));
    try {
        const response = await dataLookup({ tool: id, query: inputs[id] });
        setResults(prev => ({...prev, [id]: response.result}));
    } catch(e) {
        console.error("Lookup failed", e);
    } finally {
        setLoading(prev => ({...prev, [id]: false}));
    }
  };

  const handleClear = (id: ToolId) => {
      setResults(prev => ({...prev, [id]: null}));
  }

  const renderResult = (result: DataLookupOutput['result']) => (
    <div className="space-y-2 text-sm animate-in fade-in-50">
        {Object.entries(result).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
                <span className="text-muted-foreground">{key}</span>
                <span className="font-medium text-right">{String(value)}</span>
            </div>
        ))}
    </div>
  );

  return (
    <div>
        <div className="mb-8">
            <h1 className="text-3xl font-bold">{t('dataLookupTools')}</h1>
            <p className="text-muted-foreground max-w-2xl mt-2">
                {t('dataLookupToolsDescription')}
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lookupTools.map(tool => (
                <Card key={tool.id} className="flex flex-col">
                    <CardHeader className="flex-row items-start gap-4">
                        <tool.icon className="w-10 h-10 p-2 rounded-lg border bg-card text-primary shrink-0"/>
                        <div>
                            <CardTitle>{t(tool.titleKey as any)}</CardTitle>
                            <CardDescription className="mt-1">{t(tool.descriptionKey as any)}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                         {loading[tool.id] && (
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-1/2" />
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-5 w-2/3" />
                            </div>
                         )}
                         {results[tool.id] && renderResult(results[tool.id])}
                    </CardContent>
                    <CardFooter>
                       <div className="w-full flex items-center gap-2">
                        {results[tool.id] ? (
                            <Button variant="outline" className="w-full" onClick={() => handleClear(tool.id)}>
                                <XCircle className="mr-2" /> Clear
                            </Button>
                        ) : (
                            <>
                                <Input 
                                    placeholder={t(tool.placeholderKey as any)} 
                                    className="flex-grow"
                                    value={inputs[tool.id]}
                                    onChange={(e) => handleInputChange(tool.id, e.target.value)}
                                    disabled={loading[tool.id]}
                                />
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="shrink-0"
                                    onClick={() => handleSearch(tool.id)}
                                    disabled={loading[tool.id]}
                                >
                                    {loading[tool.id] ? <Loader2 className="animate-spin"/> : <Search/>}
                                </Button>
                            </>
                        )}
                       </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    </div>
  );
}
