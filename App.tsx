
import React, { useState, useCallback } from 'react';
import { AnalysisResultSet, InputMethod } from './types';
import Controls from './components/Sidebar';
import InputArea from './components/InputArea';
import ResultsDashboard from './components/ResultsDashboard';
import { analyzeBatch } from './services/geminiService';
import HelpModal from './components/HelpModal';

const App: React.FC = () => {
  const [inputMethod, setInputMethod] = useState<InputMethod>(InputMethod.Single);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResultSet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isComparison, setIsComparison] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  const geminiKeyConfigured = !!process.env.API_KEY;

  const handleAnalyze = useCallback(async (data: { sourceA: string[], sourceB: string[] }) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResults(null);
    try {
      const [resultsA, resultsB] = await Promise.all([
        analyzeBatch(data.sourceA, 'gemini-2.5-flash'),
        isComparison && data.sourceB.length > 0 ? analyzeBatch(data.sourceB, 'gemini-2.5-flash') : Promise.resolve(undefined)
      ]);
      setAnalysisResults({ sourceA: resultsA, sourceB: resultsB });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [isComparison]);

  return (
    <>
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-rose-100 p-4 sm:p-6 lg:p-8 font-sans flex justify-center">
        <div className="max-w-5xl mx-auto w-full">
          <header className="relative text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-rose-600">
              AuraLens
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Interactive sentiment analysis powered by AI
            </p>
             <button
              onClick={() => setIsHelpModalOpen(true)}
              className="absolute top-0 right-0 h-12 w-12 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-white transition-all duration-300 shadow-md border border-slate-200"
              aria-label="Open help tutorial"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </header>

          <main className="flex flex-col gap-8">
              <Controls 
                  selectedMethod={inputMethod} 
                  setSelectedMethod={setInputMethod}
                  isComparison={isComparison}
                  setIsComparison={setIsComparison}
              />

              <InputArea 
                  inputMethod={inputMethod} 
                  onAnalyze={handleAnalyze} 
                  isLoading={isLoading}
                  isComparison={isComparison}
                  isApiConfigured={geminiKeyConfigured}
              />
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              
              {analysisResults && (
                <div className="mt-4">
                  <ResultsDashboard results={analysisResults} />
                </div>
              )}
          </main>
        </div>
      </div>
    </>
  );
};

export default App;