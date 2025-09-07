import {genkit, Genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import 'dotenv/config';

let aiInstance: Genkit | null = null;

export function getAi(): Genkit {
  if (!aiInstance) {
    aiInstance = genkit({
      plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
      model: 'googleai/gemini-2.5-flash',
    });
  }
  return aiInstance;
}

export const ai = getAi();
