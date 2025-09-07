
/**
 * @fileOverview A flow for providing English learning assistance.
 * - englishLearningTool - A function that provides various language tools.
 * - textToSpeech - A function that converts text to audio.
 */
'use server';

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import wav from 'wav';

// Vocabulary Builder Schema
const VocabularyInputSchema = z.object({
    tool: z.literal('vocabulary'),
    query: z.string().describe('The word to look up.'),
});

const VocabularyOutputSchema = z.object({
    definition: z.string(),
    example: z.string(),
    synonyms: z.array(z.string()),
});

// Sentence Corrector Schema
const CorrectorInputSchema = z.object({
    tool: z.literal('corrector'),
    query: z.string().describe('The sentence to correct.'),
});

const CorrectorOutputSchema = z.object({
    correctedSentence: z.string(),
    explanation: z.string().describe("An explanation of the corrections made."),
});

// Union Schemas for the main flow
const EnglishLearningInputSchema = z.union([VocabularyInputSchema, CorrectorInputSchema]);
const EnglishLearningOutputSchema = z.union([VocabularyOutputSchema, CorrectorOutputSchema]);

export type EnglishLearningInput = z.infer<typeof EnglishLearningInputSchema>;
export type EnglishLearningOutput = z.infer<typeof EnglishLearningOutputSchema>;

const englishLearningPrompt = ai.definePrompt({
  name: 'englishLearningPrompt',
  input: { schema: EnglishLearningInputSchema },
  output: { schema: EnglishLearningOutputSchema },
  prompt: `You are an expert English language tutor. Based on the tool and query, perform the requested action.

Tool: {{{tool}}}
Query: {{{query}}}

If the tool is 'vocabulary', provide a clear definition, a simple example sentence, and a list of common synonyms for the given word.
If the tool is 'corrector', identify any grammatical errors in the sentence, provide the corrected version, and give a brief explanation of the changes.`,
});

const englishLearningFlow = ai.defineFlow(
  {
    name: 'englishLearningFlow',
    inputSchema: EnglishLearningInputSchema,
    outputSchema: EnglishLearningOutputSchema,
  },
  async (input) => {
    const { output } = await englishLearningPrompt(input);
    return output!;
  }
);

export async function englishLearningTool(input: EnglishLearningInput): Promise<EnglishLearningOutput> {
  return englishLearningFlow(input);
}


// --- Text to Speech Flow ---

const TextToSpeechInputSchema = z.object({
    text: z.string(),
});

const TextToSpeechOutputSchema = z.object({
    media: z.string().describe("A data URI of the generated audio in WAV format."),
});

export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text }) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: text,
    });
    if (!media) {
      throw new Error('No media returned from TTS model');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);
    return {
      media: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
    return textToSpeechFlow(input);
}
