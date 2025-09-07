
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AtSign, Building2, MailCheck, MapPin, Search, Server, Smartphone } from 'lucide-react';

const lookupTools = [
    {
        id: 'email-validator',
        icon: MailCheck,
        titleKey: 'emailValidator',
        descriptionKey: 'emailValidatorDescription',
        placeholderKey: 'emailPlaceholder'
    },
    {
        id: 'phone-inspector',
        icon: Smartphone,
        titleKey: 'phoneInspector',
        descriptionKey: 'phoneInspectorDescription',
        placeholderKey: 'phonePlaceholder'
    },
    {
        id: 'ip-geolocation',
        icon: MapPin,
        titleKey: 'ipGeolocation',
        descriptionKey: 'ipGeolocationDescription',
        placeholderKey: 'ipPlaceholder'
    },
    {
        id: 'domain-whois',
        icon: Server,
        titleKey: 'domainWhois',
        descriptionKey: 'domainWhoisDescription',
        placeholderKey: 'domainPlaceholder'
    },
    {
        id: 'company-finder',
        icon: Building2,
        titleKey: 'companyFinder',
        descriptionKey: 'companyFinderDescription',
        placeholderKey: 'companyPlaceholder'
    },
    {
        id: 'username-search',
        icon: AtSign,
        titleKey: 'usernameSearch',
        descriptionKey: 'usernameSearchDescription',
        placeholderKey: 'usernamePlaceholder'
    }
]

export default function DataLookup() {
  const { t } = useLanguage();
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
                    <CardContent className="flex-grow"/>
                    <CardFooter>
                       <div className="w-full flex items-center gap-2">
                         <Input placeholder={t(tool.placeholderKey as any)} className="flex-grow"/>
                         <Button variant="outline" size="icon" className="shrink-0"><Search/></Button>
                       </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    </div>
  );
}
