
/**
 * @fileOverview A flow for fetching and managing the latest tech news.
 *
 * - fetchTechNews - Fetches news from the AI model.
 * - saveTechNews - Saves a given set of news to Firestore.
 * - clearTechNews - Clears the news from Firestore.
 * - viewSavedNews - Retrieves the saved news from Firestore.
 * - TechNewsOutput - The data structure for news articles.
 */
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { db } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

const TechNewsOutputSchema = z.object({
  news: z
    .array(
      z.object({
        headline: z.string().describe('The headline of the news article.'),
        summary: z.string().describe('A brief summary of the news article.'),
      })
    )
    .describe('An array of top 5 tech news articles.'),
});
export type TechNewsOutput = z.infer<typeof TechNewsOutputSchema>;

const techNewsPrompt = ai.definePrompt({
  name: 'techNewsPrompt',
  input: {
    schema: z.object({
      currentDate: z.string(),
    }),
  },
  output: {schema: TechNewsOutputSchema},
  prompt: `You are a tech news aggregator. Provide a list of the top 5 most important tech news headlines for today, {{{currentDate}}}. For each headline, provide a brief summary.`,
});

const fetchTechNewsFlow = ai.defineFlow(
  {
    name: 'fetchTechNewsFlow',
    outputSchema: TechNewsOutputSchema,
  },
  async () => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const {output} = await techNewsPrompt({currentDate});
    return output!;
  }
);

export async function fetchTechNews(): Promise<TechNewsOutput> {
  return fetchTechNewsFlow();
}

const saveTechNewsFlow = ai.defineFlow(
    {
        name: 'saveTechNewsFlow',
        inputSchema: TechNewsOutputSchema,
    },
    async (newsToSave) => {
        const plainOutput = JSON.parse(JSON.stringify(newsToSave));
        const newsRef = db.collection('tech-news').doc('latest');
        await newsRef.set(plainOutput);
    }
);

export async function saveTechNews(news: TechNewsOutput): Promise<void> {
    await saveTechNewsFlow(news);
}


const clearTechNewsFlow = ai.defineFlow(
    {
        name: 'clearTechNewsFlow',
    },
    async () => {
        const newsRef = db.collection('tech-news').doc('latest');
        await newsRef.delete();
    }
);

export async function clearTechNews(): Promise<void> {
    await clearTechNewsFlow();
}

const viewSavedNewsFlow = ai.defineFlow(
    {
        name: 'viewSavedNewsFlow',
        outputSchema: TechNewsOutputSchema.nullable(),
    },
    async () => {
        const newsRef = db.collection('tech-news').doc('latest');
        const docSnap = await newsRef.get();
        if (docSnap.exists) {
            return docSnap.data() as TechNewsOutput;
        }
        return null;
    }
);

export async function viewSavedNews(): Promise<TechNewsOutput | null> {
    return viewSavedNewsFlow();
}
