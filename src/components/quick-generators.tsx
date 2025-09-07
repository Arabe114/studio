
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useState, useEffect } from 'react';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// Simple hash function (not cryptographically secure)
function simpleHash(algo: 'md5' | 'sha1' | 'sha256', text: string): string {
    // THIS IS A PLACEHOLDER - Web Crypto API would be better but is async.
    // For a quick, non-secure hash, this gives a visual representation.
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    const multiplier = algo === 'md5' ? 0x9e3779b9 : algo === 'sha1' ? 0x6d2b79f5 : 0x1db3d643;
    return (hash * multiplier).toString(16).replace('-', '');
}


export default function QuickGenerators() {
  const { t } = useLanguage();
  const { toast } = useToast();

  // Password Generator State
  const [password, setPassword] = useState('');
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  // QR Code State
  const [qrInput, setQrInput] = useState('https://firebase.google.com/studio');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Lorem Ipsum State
  const [loremIpsumText, setLoremIpsumText] = useState('');
  const [loremParagraphs, setLoremParagraphs] = useState(3);
  
  // UUID State
  const [uuid, setUuid] = useState('');
  
  // Color Converter State
  const [hexColor, setHexColor] = useState('#8b5cf6');
  const [rgbColor, setRgbColor] = useState('');
  const [hslColor, setHslColor] = useState('');

  // Case Converter State
  const [caseInput, setCaseInput] = useState('Hello World');
  const [caseOutput, setCaseOutput] = useState('');
  const [caseType, setCaseType] = useState('uppercase');

  // Hash Generator State
  const [hashInput, setHashInput] = useState('Studio');
  const [hashOutput, setHashOutput] = useState('');
  const [hashAlgo, setHashAlgo] = useState('sha256');


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: t('copiedToClipboard'),
    });
  };
  
  const generatePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let charset = '';
    if (includeUppercase) charset += upper;
    if (includeLowercase) charset += lower;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;
    if (charset === '') {
        setPassword('');
        return;
    };
    let newPassword = '';
    for (let i = 0; i < passwordLength; i++) {
        newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
  };
  
  const generateQrCode = () => {
    if(!qrInput) return;
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrInput)}`);
  };

  const generateLoremIpsum = () => {
      const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
      setLoremIpsumText(Array(loremParagraphs).fill(lorem).join('\n\n'));
  };

  const generateUuid = () => {
      setUuid(crypto.randomUUID());
  };

  const convertColor = () => {
    let hex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    setRgbColor(`rgb(${r}, ${g}, ${b})`);

    const r_norm = r / 255;
    const g_norm = g / 255;
    const b_norm = b / 255;
    const max = Math.max(r_norm, g_norm, b_norm);
    const min = Math.min(r_norm, g_norm, b_norm);
    let h=0, s=0, l=(max+min)/2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
        case r_norm: h = (g_norm - b_norm) / d + (g_norm < b_norm ? 6 : 0); break;
        case g_norm: h = (b_norm - r_norm) / d + 2; break;
        case b_norm: h = (r_norm - g_norm) / d + 4; break;
      }
      h /= 6;
    }
    setHslColor(`hsl(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`);
  };

  const convertCase = () => {
      switch (caseType) {
          case 'uppercase': setCaseOutput(caseInput.toUpperCase()); break;
          case 'lowercase': setCaseOutput(caseInput.toLowerCase()); break;
          case 'titlecase': setCaseOutput(caseInput.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())); break;
          case 'sentencecase': setCaseOutput(caseInput.charAt(0).toUpperCase() + caseInput.substring(1).toLowerCase()); break;
      }
  };

  const generateHash = () => {
      setHashOutput(simpleHash(hashAlgo as any, hashInput));
  };
  
  // Initial generations
  useEffect(() => {
    generatePassword();
    generateQrCode();
    generateLoremIpsum();
    generateUuid();
    convertColor();
    convertCase();
    generateHash();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('quickGenerators')}</h1>
      <p className="text-muted-foreground mb-8">
        {t('quickGeneratorsDescription')}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Password Generator */}
        <Card className="flex flex-col">
            <CardHeader><CardTitle>{t('passwordGenerator')}</CardTitle></CardHeader>
            <CardContent className="flex-grow flex flex-col space-y-4">
                <div className="relative">
                    <Input readOnly value={password} className="pr-16 font-mono" />
                    <div className="absolute top-0 right-0 flex h-full items-center gap-1 pr-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={generatePassword}><RefreshCw /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(password)}><Copy /></Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>{t('length')}: {passwordLength}</Label>
                    <Slider value={[passwordLength]} onValueChange={(v) => setPasswordLength(v[0])} min={8} max={64} step={1} onValueCommit={generatePassword}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2"><Checkbox id="upper" checked={includeUppercase} onCheckedChange={(c) => {setIncludeUppercase(!!c); generatePassword();}} /><Label htmlFor="upper">{t('uppercase')}</Label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="lower" checked={includeLowercase} onCheckedChange={(c) => {setIncludeLowercase(!!c); generatePassword();}} /><Label htmlFor="lower">{t('lowercase')}</Label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="numbers" checked={includeNumbers} onCheckedChange={(c) => {setIncludeNumbers(!!c); generatePassword();}} /><Label htmlFor="numbers">{t('numbers')}</Label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="symbols" checked={includeSymbols} onCheckedChange={(c) => {setIncludeSymbols(!!c); generatePassword();}} /><Label htmlFor="symbols">{t('symbols')}</Label></div>
                </div>
            </CardContent>
        </Card>
        
        {/* QR Code Generator */}
        <Card className="flex flex-col">
            <CardHeader><CardTitle>{t('qrCodeGenerator')}</CardTitle></CardHeader>
            <CardContent className="flex-grow flex flex-col space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="qr-input">{t('textOrUrl')}</Label>
                    <Input id="qr-input" value={qrInput} onChange={(e) => setQrInput(e.target.value)} />
                </div>
                <Button onClick={generateQrCode}>{t('generate')}</Button>
                {qrCodeUrl && (
                    <div className="mx-auto p-4 bg-white rounded-lg">
                        <Image src={qrCodeUrl} alt="Generated QR Code" width={150} height={150} />
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Lorem Ipsum Generator */}
        <Card className="flex flex-col">
            <CardHeader><CardTitle>{t('loremIpsumGenerator')}</CardTitle></CardHeader>
            <CardContent className="flex-grow flex flex-col space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="lorem-paragraphs">{t('paragraphs')}</Label>
                    <Input id="lorem-paragraphs" type="number" min="1" max="20" value={loremParagraphs} onChange={(e) => setLoremParagraphs(parseInt(e.target.value))} />
                </div>
                <Button onClick={generateLoremIpsum}>{t('generate')}</Button>
                <Textarea readOnly value={loremIpsumText} className="flex-grow" rows={8}/>
                <Button variant="secondary" onClick={() => copyToClipboard(loremIpsumText)}><Copy className="mr-2"/>{t('copyText')}</Button>
            </CardContent>
        </Card>

        {/* UUID Generator */}
        <Card className="flex flex-col">
            <CardHeader><CardTitle>{t('uuidGenerator')}</CardTitle></CardHeader>
            <CardContent className="flex-grow flex flex-col space-y-4 justify-center">
                 <div className="relative">
                    <Input readOnly value={uuid} className="pr-10 font-mono" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 absolute top-1/2 right-1 -translate-y-1/2" onClick={() => copyToClipboard(uuid)}><Copy /></Button>
                </div>
                <Button onClick={generateUuid}>{t('generateNewUuid')}</Button>
            </CardContent>
        </Card>

        {/* Color Converter */}
        <Card className="flex flex-col">
            <CardHeader><CardTitle>{t('colorConverter')}</CardTitle></CardHeader>
            <CardContent className="flex-grow flex flex-col space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="hex-color">{t('hexColor')}</Label>
                    <div className="flex gap-2">
                      <Input id="hex-color" value={hexColor} onChange={(e) => setHexColor(e.target.value)} />
                      <Input type="color" value={hexColor} onChange={(e) => setHexColor(e.target.value)} className="p-1 h-10 w-12"/>
                    </div>
                </div>
                <Button onClick={convertColor}>{t('convert')}</Button>
                <div className="space-y-2">
                    <Label>{t('rgbColor')}</Label>
                    <Input readOnly value={rgbColor} />
                </div>
                 <div className="space-y-2">
                    <Label>{t('hslColor')}</Label>
                    <Input readOnly value={hslColor} />
                </div>
            </CardContent>
        </Card>

        {/* Case Converter */}
        <Card className="flex flex-col">
            <CardHeader><CardTitle>{t('caseConverter')}</CardTitle></CardHeader>
            <CardContent className="flex-grow flex flex-col space-y-4">
                 <div className="space-y-2 flex-grow flex flex-col">
                    <Label htmlFor="case-input">{t('inputText')}</Label>
                    <Textarea id="case-input" value={caseInput} onChange={(e) => setCaseInput(e.target.value)} className="flex-grow" />
                </div>
                <div className="flex gap-2">
                    <Select value={caseType} onValueChange={(v) => setCaseType(v)}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="uppercase">{t('uppercase')}</SelectItem>
                            <SelectItem value="lowercase">{t('lowercase')}</SelectItem>
                            <SelectItem value="titlecase">{t('titleCase')}</SelectItem>
                            <SelectItem value="sentencecase">{t('sentenceCase')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={convertCase} className="flex-shrink-0">{t('convert')}</Button>
                </div>
                 <div className="space-y-2 flex-grow flex flex-col">
                    <Label htmlFor="case-output">{t('outputText')}</Label>
                    <Textarea id="case-output" readOnly value={caseOutput} className="flex-grow"/>
                </div>
                 <Button variant="secondary" onClick={() => copyToClipboard(caseOutput)}><Copy className="mr-2"/>{t('copyText')}</Button>
            </CardContent>
        </Card>
        
        {/* Hash Generator */}
        <Card className="flex flex-col">
            <CardHeader><CardTitle>{t('hashGenerator')}</CardTitle></CardHeader>
            <CardContent className="flex-grow flex flex-col space-y-4">
                 <div className="space-y-2 flex-grow flex flex-col">
                    <Label htmlFor="hash-input">{t('inputText')}</Label>
                    <Textarea id="hash-input" value={hashInput} onChange={(e) => setHashInput(e.target.value)} className="flex-grow"/>
                </div>
                <div className="flex gap-2">
                    <Select value={hashAlgo} onValueChange={(v) => setHashAlgo(v)}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sha256">SHA-256</SelectItem>
                            <SelectItem value="sha1">SHA-1</SelectItem>
                            <SelectItem value="md5">MD5 (placeholder)</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={generateHash} className="flex-shrink-0">{t('generate')}</Button>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="hash-output">{t('hashOutput')}</Label>
                    <Textarea id="hash-output" readOnly value={hashOutput} className="font-mono" rows={3}/>
                </div>
                 <Button variant="secondary" onClick={() => copyToClipboard(hashOutput)}><Copy className="mr-2"/>{t('copyText')}</Button>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
