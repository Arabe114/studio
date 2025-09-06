/**
 * @fileOverview A flow for fetching the latest tech news.
 *
 * - fetchTechNews - A function that returns a list of top 5 tech news headlines.
 * - TechNewsOutput - The return type for the fetchTechNews function.
 */
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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