
"use client";

import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Loader2, BookText, SpellCheck, Volume2, Bot } from 'lucide-react';
import { englishLearningTool, textToSpeech, EnglishLearningInput, EnglishLearningOutput, TextToSpeechOutput } from '@/ai/flows/english-learning-flow';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';

type ResultState = EnglishLearningOutput | TextToSpeechOutput | null;

export default function EnglishLearning() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('vocabulary');
  const [input, setInput] = useState({
    vocabulary: '',
    corrector: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultState>(null);
  const [error, setError] = useState('');

  const handleInputChange = (tool: keyof typeof input, value: string) => {
    setInput(prev => ({...prev, [tool]: value}));
    setResult(null);
    setError('');
  };

  const handleSubmit = async (tool: 'vocabulary' | 'corrector' | 'pronunciation') => {
    let query = '';
    let toolKey: EnglishLearningInput['tool'] = 'vocabulary'; // default

    if (tool === 'vocabulary') {
        query = input.vocabulary;
        toolKey = 'search_word';
    } else if (tool === 'corrector') {
        query = input.corrector;
        toolKey = 'corrector';
    } else {
        query = input.vocabulary; // Use the same input for pronunciation
    }
    
    if (!query) return;

    setLoading(true);
    setResult(null);
    setError('');

    try {
        if (tool === 'pronunciation') {
            const response = await textToSpeech({ text: query });
            setResult(response);
        } else {
            const response = await englishLearningTool({ tool: toolKey, query });
            setResult(response);
        }
    } catch (e) {
        console.error(`Error with ${tool} tool:`, e);
        setError(t('englishLearningError'));
    } finally {
        setLoading(false);
    }
  };
  
  const renderVocabularyResult = () => {
    if (!result || !('definition' in result)) return null;
    return (
      <div className="space-y-4 animate-in fade-in-50">
        <div>
            <h3 className="font-semibold text-lg">{t('definition')}</h3>
            <p className="text-muted-foreground">{result.definition}</p>
        </div>
         <div>
            <h3 className="font-semibold text-lg">{t('exampleSentence')}</h3>
            <p className="text-muted-foreground italic">"{result.example}"</p>
        </div>
         <div>
            <h3 className="font-semibold text-lg">{t('synonyms')}</h3>
            <div className="flex flex-wrap gap-2">
                {result.synonyms.map(syn => <Badge key={syn} variant="secondary">{syn}</Badge>)}
            </div>
        </div>
        {!loading && (
          <Button onClick={() => handleSubmit('pronunciation')} variant="outline" size="sm" className="mt-4">
              <Volume2 className="mr-2"/> {t('speak')} &quot;{input.vocabulary}&quot;
          </Button>
        )}
      </div>
    );
  };

  const renderCorrectorResult = () => {
    if (!result || !('correctedSentence' in result)) return null;
    return (
        <div className="space-y-4 animate-in fade-in-50">
            <div>
                <h3 className="font-semibold text-lg">{t('correctedSentence')}</h3>
                <p className="text-muted-foreground p-3 bg-secondary/50 rounded-md">{result.correctedSentence}</p>
            </div>
            <div>
                <h3 className="font-semibold text-lg">{t('explanation')}</h3>
                <p className="text-muted-foreground">{result.explanation}</p>
            </div>
      </div>
    )
  };

  const renderPronunciationResult = () => {
      if (!result || !('media' in result)) return null;
      return (
        <div className="animate-in fade-in-50">
            <audio controls src={result.media} className="w-full">
                Your browser does not support the audio element.
            </audio>
        </div>
      );
  };


  const renderResultArea = (tool: 'vocabulary' | 'corrector' | 'pronunciation') => (
    <CardFooter className="min-h-[150px] bg-muted/30 rounded-b-lg p-6">
        {loading && <Skeleton className="w-full h-[120px]" />}
        {!loading && !error && result && (
            <div className="w-full">
                {tool === 'vocabulary' && renderVocabularyResult()}
                {tool === 'corrector' && renderCorrectorResult()}
                {tool === 'pronunciation' && renderPronunciationResult()}
            </div>
        )}
        {!loading && error && <p className="text-destructive mx-auto">{error}</p>}
        {!loading && !error && !result && (
            <div className="text-center mx-auto text-muted-foreground">
                 <Bot className="mx-auto h-10 w-10 mb-2"/>
                 <p>{t('aiReadyToAssist')}</p>
            </div>
        )}
    </CardFooter>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('englishLearningHub')}</h1>
        <p className="text-muted-foreground max-w-2xl mt-2">
          {t('englishLearningHubDescription')}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setResult(null); }} className="w-full">
        <TabsList className="mb-4 bg-transparent p-0 justify-start gap-2 h-auto">
          <TabsTrigger value="vocabulary" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon-accent hover:bg-primary/10 transition-all duration-300 py-2 px-4 rounded-lg">
            <BookText className="mr-2"/>{t('vocabularyBuilder')}
          </TabsTrigger>
          <TabsTrigger value="corrector" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon-accent hover:bg-primary/10 transition-all duration-300 py-2 px-4 rounded-lg">
            <SpellCheck className="mr-2"/>{t('sentenceCorrector')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="vocabulary" className="mt-0">
           <Card className="rounded-t-none">
             <CardHeader>
                <CardTitle>{t('vocabularyBuilder')}</CardTitle>
                <CardDescription>{t('vocabularyBuilderDescription')}</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="flex gap-2">
                    <Input placeholder={t('enterAWord')} value={input.vocabulary} onChange={e => handleInputChange('vocabulary', e.target.value)} />
                    <Button onClick={() => handleSubmit('vocabulary')} disabled={loading}>
                        {loading && <Loader2 className="animate-spin mr-2"/>} {t('search')}
                    </Button>
                </div>
             </CardContent>
             {renderResultArea('vocabulary')}
           </Card>
        </TabsContent>

        <TabsContent value="corrector" className="mt-0">
           <Card className="rounded-t-none">
             <CardHeader>
                <CardTitle>{t('sentenceCorrector')}</CardTitle>
                <CardDescription>{t('sentenceCorrectorDescription')}</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="flex flex-col gap-2">
                    <Textarea placeholder={t('enterASentence')} value={input.corrector} onChange={e => handleInputChange('corrector', e.target.value)} />
                    <Button onClick={() => handleSubmit('corrector')} disabled={loading} className="w-fit self-end">
                        {loading && <Loader2 className="animate-spin mr-2"/>} {t('correct')}
                    </Button>
                </div>
             </CardContent>
             {renderResultArea('corrector')}
           </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
