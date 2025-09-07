
"use client";
import { useState, useEffect } from 'react';
import { fetchTechNews, clearTechNews, type TechNewsOutput } from '@/ai/flows/fetch-tech-news-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Newspaper, Trash2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function TechNews() {
  const [news, setNews] = useState<TechNewsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    setLoading(true);
    const newsRef = doc(db, 'tech-news', 'latest');
    const unsubscribe = onSnapshot(newsRef, (doc) => {
      if (doc.exists()) {
        setNews(doc.data() as TechNewsOutput);
      } else {
        setNews(null);
      }
      setLoading(false);
    }, (err) => {
      setError(t('fetchError'));
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [t]);

  async function loadNews() {
    try {
      setLoading(true);
      setError(null);
      await fetchTechNews();
    } catch (err) {
      setError(t('fetchError'));
      console.error(err);
    } finally {
      // setLoading(false) is handled by the onSnapshot listener
    }
  }

  async function handleClearNews() {
    try {
        setLoading(true);
        setError(null);
        await clearTechNews();
    } catch (err) {
        setError("Failed to clear news.");
        console.error(err);
        setLoading(false);
    }
  }


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('dailyTechNews')}</h1>
        <div className="flex gap-2">
            <Button onClick={loadNews} disabled={loading}>
              <Newspaper className="mr-2" />
              {t('fetchLatestNews')}
            </Button>
            <Button onClick={handleClearNews} disabled={loading || !news} variant="outline">
                <Trash2 className="mr-2" />
                Clear News
            </Button>
        </div>
      </div>
      
      {error && <p className="text-destructive">{error}</p>}

      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
             <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6 mt-2" />
                </CardContent>
             </Card>
          ))}
        </div>
      )}

      {!loading && !news && (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-lg bg-card border">
            <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('headlinesReady')}</h2>
            <p className="text-muted-foreground">
                {t('getTodaysHeadlines')}
            </p>
        </div>
      )}

      {!loading && news && (
        <div className="space-y-4">
          {news.news.map((article, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{article.headline}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{article.summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
