
import React from 'react';

// The execution environment provides API keys via process.env
const geminiKeyConfigured = !!process.env.API_KEY;
const openaiKeyConfigured = !!process.env.OPENAI_API_KEY;

const StatusIndicator: React.FC<{ configured: boolean; name: string }> = ({ configured, name }) => (
    <div className="flex items-center space-x-2">
        {configured ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
        )}
        <span className={`text-sm ${configured ? 'text-slate-600' : 'text-red-600 font-medium'}`}>
            {name}: {configured ? 'Configured' : 'Missing'}
        </span>
    </div>
);


const ApiStatus: React.FC = () => {
  return (
    <div className="bg-white/70 backdrop-blur-xl p-3 rounded-2xl shadow-lg border border-slate-200 w-full text-center">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-x-8 gap-y-2">
        <StatusIndicator configured={geminiKeyConfigured} name="Gemini (Primary)" />
        <StatusIndicator configured={openaiKeyConfigured} name="OpenAI (Fallback)" />
      </div>
       {!geminiKeyConfigured && (
        <p className="text-xs text-center text-amber-800 mt-2 p-2 bg-amber-100/80 rounded-lg border border-amber-200">
            The primary Gemini API key is missing, so analysis is disabled. Please add it to your environment variables to continue.
        </p>
      )}
    </div>
  );
};

export default ApiStatus;