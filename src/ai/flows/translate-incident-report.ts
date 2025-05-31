// src/ai/flows/translate-incident-report.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to translate an incident report from a local language to English.
 *
 * - translateIncidentReport - A function that translates the incident report to english.
 * - TranslateIncidentReportInput - The input type for the translateIncidentReport function.
 * - TranslateIncidentReportOutput - The return type for the translateIncidentReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateIncidentReportInputSchema = z.object({
  incidentReport: z
    .string()
    .describe('The incident report in the local language that needs to be translated to english.'),
  sourceLanguage: z.string().describe('The language of the incident report'),
});

export type TranslateIncidentReportInput = z.infer<
  typeof TranslateIncidentReportInputSchema
>;

const TranslateIncidentReportOutputSchema = z.object({
  translatedReport: z
    .string()
    .describe('The translated incident report in English.'),
});

export type TranslateIncidentReportOutput = z.infer<
  typeof TranslateIncidentReportOutputSchema
>;

export async function translateIncidentReport(
  input: TranslateIncidentReportInput
): Promise<TranslateIncidentReportOutput> {
  return translateIncidentReportFlow(input);
}

const translateIncidentReportPrompt = ai.definePrompt({
  name: 'translateIncidentReportPrompt',
  input: {schema: TranslateIncidentReportInputSchema},
  output: {schema: TranslateIncidentReportOutputSchema},
  prompt: `Translate the following incident report from {{sourceLanguage}} to English:\n\n{{{incidentReport}}}`,
});

const translateIncidentReportFlow = ai.defineFlow(
  {
    name: 'translateIncidentReportFlow',
    inputSchema: TranslateIncidentReportInputSchema,
    outputSchema: TranslateIncidentReportOutputSchema,
  },
  async input => {
    const {output} = await translateIncidentReportPrompt(input);
    return output!;
  }
);
