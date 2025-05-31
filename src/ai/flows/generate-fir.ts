'use server';

/**
 * @fileOverview Generates a formal incident report (FIR) from a user's chat description of an incident.
 *
 * - generateFir - A function that generates a formal incident report from chat input.
 * - GenerateFirInput - The input type for the generateFir function.
 * - GenerateFirOutput - The return type for the generateFir function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFirInputSchema = z.object({
  chatHistory: z
    .string()
    .describe('The user provided chat history describing the incident.'),
});
export type GenerateFirInput = z.infer<typeof GenerateFirInputSchema>;

const GenerateFirOutputSchema = z.object({
  firReport: z.string().describe('The generated formal incident report.'),
});
export type GenerateFirOutput = z.infer<typeof GenerateFirOutputSchema>;

export async function generateFir(input: GenerateFirInput): Promise<GenerateFirOutput> {
  return generateFirFlow(input);
}

const generateFirPrompt = ai.definePrompt({
  name: 'generateFirPrompt',
  input: {schema: GenerateFirInputSchema},
  output: {schema: GenerateFirOutputSchema},
  prompt: `You are an AI assistant that transforms a user's description of an incident into a formal incident report (FIR).

  Here is the user's description of the incident:
  {{chatHistory}}

  Please generate a formal incident report based on the description.`,
});

const generateFirFlow = ai.defineFlow(
  {
    name: 'generateFirFlow',
    inputSchema: GenerateFirInputSchema,
    outputSchema: GenerateFirOutputSchema,
  },
  async input => {
    const {output} = await generateFirPrompt(input);
    return output!;
  }
);
