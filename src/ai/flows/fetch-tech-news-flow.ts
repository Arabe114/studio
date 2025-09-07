
/**
 * @fileOverview A flow for fetching and managing the latest tech news.
 *
 * - fetchTechNews - Fetches news and saves it to Firestore.
 * - clearTechNews - Clears the news from Firestore.
 * - TechNewsOutput - The return type for the fetchTechNews function.
 */
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

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
    if (output) {
        // We need to convert the Zod object to a plain JS object for Firestore
        const plainOutput = JSON.parse(JSON.stringify(output));
        const newsRef = doc(db, 'tech-news', 'latest');
        await setDoc(newsRef, plainOutput);
    }
    return output!;
  }
);

export async function fetchTechNews(): Promise<TechNewsOutput> {
  return fetchTechNewsFlow();
}

const clearTechNewsFlow = ai.defineFlow(
    {
        name: 'clearTechNewsFlow',
    },
    async () => {
        const newsRef = doc(db, 'tech-news', 'latest');
        await deleteDoc(newsRef);
    }
);

export async function clearTechNews(): Promise<void> {
    await clearTechNewsFlow();
}
