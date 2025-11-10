import React, { useState, useCallback } from 'react';
import { InputMethod } from '../types';
import Spinner from './Spinner';

interface InputAreaProps {
  inputMethod: InputMethod;
  onAnalyze: (data: { sourceA: string[]; sourceB: string[] }) => void;
  isLoading: boolean;
  isComparison: boolean;
  isApiConfigured: boolean;
}

type InputState = {
    text: string;
    file: File | null;
    fileName: string;
    csvHeaders: string[];
    selectedColumn: string;
}

const initialState: InputState = {
    text: '',
    file: null,
    fileName: '',
    csvHeaders: [],
    selectedColumn: ''
};

const InputArea: React.FC<InputAreaProps> = ({ inputMethod, onAnalyze, isLoading, isComparison, isApiConfigured }) => {
  const [sourceA, setSourceA] = useState<InputState>(initialState);
  const [sourceB, setSourceB] = useState<InputState>(initialState);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, source: 'A' | 'B') => {
    const selectedFile = e.target.files?.[0];
    const setSource = source === 'A' ? setSourceA : setSourceB;

    if (selectedFile) {
        setSource(prev => ({ ...prev, file: selectedFile, fileName: selectedFile.name, csvHeaders: [], selectedColumn: '' }));
        if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const fileContent = event.target?.result as string;
                const firstLine = fileContent.split('\n')[0];
                const headers = firstLine.split(',').map(h => h.trim().replace(/"/g, ''));
                setSource(prev => ({ ...prev, csvHeaders: headers }));
            };
            reader.readAsText(selectedFile);
        }
    }
  };
  
  const getTextsFromFile = (file: File, selectedColumn: string, headers: string[]): Promise<string[]> => {
      return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                if (inputMethod === InputMethod.TXT) {
                    resolve(content.split('\n').map(l => l.trim()).filter(Boolean));
                } else if (inputMethod === InputMethod.CSV) {
                    const rows = content.split('\n').slice(1);
                    const colIndex = headers.indexOf(selectedColumn);
                    if (colIndex > -1) {
                       const texts = rows.map(row => {
                           const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // handle commas inside quotes
                           return columns[colIndex]?.trim().replace(/"/g, '') || '';
                       }).filter(Boolean);
                       resolve(texts);
                    } else {
                        resolve([]);
                    }
                }
            };
            reader.readAsText(file);
      });
  }

  const handleAnalyzeClick = async () => {
    let textsA: string[] = [];
    let textsB: string[] = [];

    // Process Source A
    if (inputMethod === InputMethod.Single || inputMethod === InputMethod.Batch) {
        textsA = sourceA.text.split('\n').map(l => l.trim()).filter(Boolean);
    } else if (sourceA.file) {
        textsA = await getTextsFromFile(sourceA.file, sourceA.selectedColumn, sourceA.csvHeaders);
    }

    // Process Source B if in comparison mode
    if (isComparison) {
        if (inputMethod === InputMethod.Single || inputMethod === InputMethod.Batch) {
            textsB = sourceB.text.split('\n').map(l => l.trim()).filter(Boolean);
        } else if (sourceB.file) {
            textsB = await getTextsFromFile(sourceB.file, sourceB.selectedColumn, sourceB.csvHeaders);
        }
    }
    
    if(textsA.length > 0 || textsB.length > 0) {
        onAnalyze({ sourceA: textsA, sourceB: textsB });
    }
  };

  const renderInputSource = (source: 'A' | 'B') => {
    const state = source === 'A' ? sourceA : sourceB;
    const setState = source === 'A' ? setSourceA : setSourceB;

    switch (inputMethod) {
      case InputMethod.Single:
        return <textarea value={state.text} onChange={(e) => setState(p => ({...p, text: e.target.value}))} placeholder="Enter text..." className="w-full h-40 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none transition-shadow" />;
      case InputMethod.Batch:
        return <textarea value={state.text} onChange={(e) => setState(p => ({...p, text: e.target.value}))} placeholder="Paste multiple lines..." className="w-full h-64 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none transition-shadow" />;
      case InputMethod.TXT:
      case InputMethod.CSV:
        return (
          <div className="w-full">
            <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-rose-600 rounded-lg shadow-md tracking-wide uppercase border border-slate-200 cursor-pointer hover:bg-rose-50 hover:text-rose-700">
              <svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4 4-4-4h3v-4h2v4z" />
              </svg>
              <span className="mt-2 text-base leading-normal">{state.fileName || `Select a ${inputMethod === InputMethod.TXT ? '.txt' : '.csv'} file`}</span>
              <input type='file' className="hidden" onChange={(e) => handleFileChange(e, source)} accept={inputMethod === InputMethod.TXT ? '.txt' : '.csv'} />
            </label>
            {inputMethod === InputMethod.CSV && state.csvHeaders.length > 0 && (
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select text column:</label>
                    <select value={state.selectedColumn} onChange={e => setState(p => ({...p, selectedColumn: e.target.value}))} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none">
                        <option value="">-- Choose a column --</option>
                        {state.csvHeaders.map(header => <option key={header} value={header}>{header}</option>)}
                    </select>
                </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const isAnalyzeDisabled = isLoading || !isApiConfigured;
  const buttonTooltip = !isApiConfigured ? 'Analysis is disabled because the primary Gemini API key is not configured.' : '';

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">{isComparison ? 'Source A' : `${inputMethod} Analysis`}</h2>
        {renderInputSource('A')}
      </div>
      {isComparison && (
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Source B</h2>
            {renderInputSource('B')}
          </div>
      )}
      <button
        onClick={handleAnalyzeClick}
        disabled={isAnalyzeDisabled}
        title={buttonTooltip}
        className="w-full flex justify-center items-center bg-gradient-to-r from-sky-500 to-rose-500 text-white font-bold py-3 px-4 rounded-lg hover:from-sky-600 hover:to-rose-600 transition-all duration-300 shadow-lg disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed disabled:shadow-inner"
      >
        {isLoading ? <Spinner /> : 'Analyze'}
      </button>
    </div>
  );
};

export default InputArea;
