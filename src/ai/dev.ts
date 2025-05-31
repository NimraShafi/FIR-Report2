import { config } from 'dotenv';
config();

import '@/ai/flows/translate-incident-report.ts';
import '@/ai/flows/generate-fir.ts';