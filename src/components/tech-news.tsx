"use client";
import { useState } from 'react';
import { fetchTechNews, type TechNewsOutput } from '@/ai/flows/fetch-tech-news-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Newspaper } from 'lucide-react';

export default function TechNews() {
  const [news, setNews] = useState<TechNewsOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadNews() {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchTechNews();
      setNews(result);
    } catch (err) {
      setError('Failed to fetch tech news. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Daily Tech News</h1>
        <Button onClick={loadNews} disabled={loading}>
          <Newspaper className="mr-2" />
          Fetch Latest News
        </Button>
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
            <h2 className="text-xl font-semibold mb-2">Ready for the latest headlines?</h2>
            <p className="text-muted-foreground">
                Click the "Fetch Latest News" button to get today's top stories from the world of tech.
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
