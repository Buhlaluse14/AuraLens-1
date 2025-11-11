import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ModelName, Sentiment } from '../types';

// Use the API key from environment variables, which is the standard for this app.
const GEMINI_API_KEY = process.env.API_KEY;

// Initialize the client. The SDK will handle errors if a call is made without a valid key.
// The UI already prevents this from happening.
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || '' });


const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    sentiment: {
      type: Type.STRING,
      description: "The sentiment of the text. Must be 'positive', 'negative', or 'neutral'.",
    },
    confidence: {
      type: Type.NUMBER,
      description: "A confidence score between 0.0 and 1.0.",
    },
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of up to 3 most relevant keywords from the text.",
    },
    explanation: {
      type: Type.STRING,
      description: "A brief, one-sentence explanation for the sentiment prediction.",
    },
  },
  required: ["sentiment", "confidence", "keywords", "explanation"],
};

const analyzeWithOpenAI = async (text: string): Promise<AnalysisResult> => {
    // Use the API key from environment variables.
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
        throw new Error("OpenAI API key is not configured in environment variables.");
    }
    
    const prompt = `Analyze the sentiment of the following text. Your response must be a JSON object with the following keys: "sentiment" (string, must be 'positive', 'negative', or 'neutral'), "confidence" (number, between 0.0 and 1.0), "keywords" (array of up to 3 strings), and "explanation" (string, a brief, one-sentence explanation).

Text: "${text}"`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`OpenAI API error: ${response.statusText} - ${errorBody.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const resultJson = JSON.parse(data.choices[0].message.content);

        return {
            text,
            sentiment: resultJson.sentiment.toLowerCase(),
            confidence: resultJson.confidence,
            keywords: resultJson.keywords,
            explanation: resultJson.explanation,
            engine: 'openai',
        };

    } catch (error) {
        console.error("Error analyzing text with OpenAI:", error);
        throw error;
    }
};


export const analyzeText = async (text: string, model: ModelName): Promise<AnalysisResult> => {
    if (!GEMINI_API_KEY) {
        // This is a safeguard; the UI should prevent this call from happening.
        return {
            text,
            sentiment: Sentiment.Error,
            confidence: 0,
            keywords: [],
            explanation: `Primary API (Gemini) key is not configured. Analysis disabled.`,
        };
    }
    
    if (!text || !text.trim()) {
        return {
            text: text,
            sentiment: Sentiment.Neutral,
            confidence: 0.0,
            keywords: [],
            explanation: 'Empty input',
        };
    }

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `Analyze the sentiment of the following text. Classify it as 'positive', 'negative', or 'neutral'. Provide a confidence score, extract key words, and give a brief explanation.\n\nText: "${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });
        
        const resultJson = JSON.parse(response.text);
        
        return {
            text,
            sentiment: resultJson.sentiment.toLowerCase(),
            confidence: resultJson.confidence,
            keywords: resultJson.keywords,
            explanation: resultJson.explanation,
            engine: 'gemini',
        };
    } catch (geminiError) {
        console.warn("Error analyzing text with Gemini, falling back to OpenAI:", geminiError);
        try {
            return await analyzeWithOpenAI(text);
        } catch (openaiError) {
             console.error("Error analyzing text with OpenAI fallback:", openaiError);
             return {
                text,
                sentiment: Sentiment.Error,
                confidence: 0,
                keywords: [],
                explanation: `Primary API (Gemini) failed. Fallback API (OpenAI) also failed. See console for details.`,
             };
        }
    }
};

export const analyzeBatch = async (texts: string[], model: ModelName): Promise<AnalysisResult[]> => {
    // This sequentialResults array will hold our results.
    const sequentialResults: AnalysisResult[] = [];
    
    // We use a for...of loop, which respects the 'await' keyword.
    for (const text of texts) {
      // It will 'await' the result of one call before starting the next.
      const result = await analyzeText(text, model);
      sequentialResults.push(result);
    }
    
    // Return the results once all calls are complete.
    return sequentialResults;
};
