
"use client";
import { useState } from 'react';
import { fetchTechNews, saveTechNews, clearTechNews, viewSavedNews, type TechNewsOutput } from '@/ai/flows/fetch-tech-news-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Newspaper, Save, Trash2, Eye } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';


export default function TechNews() {
  const [fetchedNews, setFetchedNews] = useState<TechNewsOutput | null>(null);
  const [savedNews, setSavedNews] = useState<TechNewsOutput | null>(null);
  const [newsToDisplay, setNewsToDisplay] = useState<TechNewsOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  async function handleFetchNews() {
    try {
      setLoading(true);
      setError(null);
      const news = await fetchTechNews();
      setFetchedNews(news);
      setNewsToDisplay(news);
      setSavedNews(null); 
    } catch (err) {
      setError(t('fetchError'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveNews() {
    if (!fetchedNews) return;
    try {
        setLoading(true);
        setError(null);
        await saveTechNews(fetchedNews);
        setSavedNews(fetchedNews);
        setNewsToDisplay(fetchedNews);
    } catch(err) {
        setError("Failed to save news.");
        console.error(err);
    } finally {
        setLoading(false);
    }
  }

  async function handleClearNews() {
    try {
        setLoading(true);
        setError(null);
        await clearTechNews();
        setFetchedNews(null);
        setSavedNews(null);
        setNewsToDisplay(null);
    } catch (err) {
        setError("Failed to clear news.");
        console.error(err);
    } finally {
        setLoading(false);
    }
  }
  
  async function handleViewSavedNews() {
    setLoading(true);
    setError(null);
    try {
        const data = await viewSavedNews();
        if (data) {
            setSavedNews(data);
            setNewsToDisplay(data);
            setFetchedNews(null);
        } else {
            setSavedNews(null);
            setNewsToDisplay(null);
        }
    } catch (err) {
        setError("Failed to load saved news.");
        console.error(err);
    } finally {
        setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('dailyTechNews')}</h1>
        <div className="flex gap-2">
            <Button onClick={handleFetchNews} disabled={loading}>
              <Newspaper className="mr-2" />
              {t('fetchLatestNews')}
            </Button>
            <Button onClick={handleViewSavedNews} disabled={loading} variant="outline">
              <Eye className="mr-2" />
              View Saved News
            </Button>
            <Button onClick={handleSaveNews} disabled={loading || !fetchedNews}>
              <Save className="mr-2" />
              Save News
            </Button>
            <Button onClick={handleClearNews} disabled={loading} variant="destructive">
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

      {!loading && !newsToDisplay && (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-lg bg-card border">
            <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('headlinesReady')}</h2>
            <p className="text-muted-foreground">
                {t('getTodaysHeadlines')}
            </p>
        </div>
      )}

      {!loading && newsToDisplay && (
        <div className="space-y-4">
          {newsToDisplay.news.map((article, index) => (
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
