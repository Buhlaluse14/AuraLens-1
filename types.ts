export enum Sentiment {
  Positive = 'positive',
  Negative = 'negative',
  Neutral = 'neutral',
  Error = 'error',
}

export type ModelName = 'gemini-2.5-flash';

export interface AnalysisResult {
  text: string;
  sentiment: Sentiment;
  confidence: number;
  keywords: string[];
  explanation: string;
  source?: 'A' | 'B';
  engine?: 'gemini' | 'openai';
}

export interface AnalysisResultSet {
    sourceA: AnalysisResult[];
    sourceB?: AnalysisResult[];
}


export enum InputMethod {
  Single = 'Single Text',
  Batch = 'Batch Text (paste)',
  TXT = 'Upload TXT',
  CSV = 'Upload CSV',
}