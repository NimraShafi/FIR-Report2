"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const AnalyzeIncidentInputSchema = z.object({
  chatHistory: z.string(),
  language: z.string(),
});

export type AnalyzeIncidentInput = z.infer<typeof AnalyzeIncidentInputSchema>;

const AnalyzeIncidentOutputSchema = z.object({
  assistantMessage: z.string(),
  readyForReport: z.boolean(),
  incidentSummary: z.string(),
});

export type AnalyzeIncidentOutput = z.infer<typeof AnalyzeIncidentOutputSchema>;

export async function analyzeIncident(
  input: AnalyzeIncidentInput,
): Promise<AnalyzeIncidentOutput> {
  return analyzeIncidentFlow(input);
}

const analyzeIncidentPrompt = ai.definePrompt({
  name: "analyzeIncidentPrompt",
  input: { schema: AnalyzeIncidentInputSchema },
  output: { schema: AnalyzeIncidentOutputSchema },

  prompt: `You are an AI incident-report assistant.

The user is having a conversation with you to provide details about an incident.

Selected language:
{{language}}

Conversation:
{{chatHistory}}

Your job is to:

1. Understand the incident.
2. Ask relevant follow-up questions when important information is missing.
3. Ask only one clear question at a time.
4. Do not generate the formal report yet.
5. When you have enough information, set readyForReport to true.
6. When enough information is available, provide a short incident summary.
7. Respond entirely in the selected language.
8. Never invent facts.
9. If the user says something like "I'm not safe" or indicates immediate danger, prioritize an appropriate safety-related question.

Return:
- assistantMessage: your next response to the user.
- readyForReport: true only when enough information is available.
- incidentSummary: a short summary when ready, otherwise an empty string.`,
});

const analyzeIncidentFlow = ai.defineFlow(
  {
    name: "analyzeIncidentFlow",
    inputSchema: AnalyzeIncidentInputSchema,
    outputSchema: AnalyzeIncidentOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeIncidentPrompt(input);
    return output!;
  },
);
