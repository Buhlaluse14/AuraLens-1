import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Close help"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-4">How to Use AuraLens</h2>
        <p className="text-slate-600 mb-6">
          Welcome to AuraLens! This guide will help you get started with analyzing text sentiment.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-rose-600 mb-2">1. Select an Input Method</h3>
            <p className="text-slate-600 mb-2">Choose how you want to provide your text data:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li><strong>Single Text:</strong> Ideal for analyzing a single block of text, like a comment or a short review. Just type or paste directly into the text area.</li>
              <li><strong>Batch Text (paste):</strong> Analyze multiple pieces of text at once. Paste your text with each entry on a new line.</li>
              <li><strong>Upload TXT:</strong> Select a <code>.txt</code> file from your computer. AuraLens will treat each line in the file as a separate text entry for analysis.</li>
              <li><strong>Upload CSV:</strong> For structured data, upload a <code>.csv</code> file. After uploading, you'll be prompted to select which column contains the text you wish to analyze.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-rose-600 mb-2">2. AI Model</h3>
            <p className="text-slate-600 mb-2">AuraLens is primarily powered by Google's Gemini AI.</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li><strong>Primary Model:</strong> It uses <strong>`gemini-2.5-flash`</strong> for its speed and efficiency.</li>
                <li><strong>Fallback Support:</strong> If the primary Gemini model encounters an issue, AuraLens will automatically try to process your request using OpenAI's <strong>`gpt-4o-mini`</strong> model as a backup to ensure high availability. The 'Engine' column in the results table will show you which AI model was used for each analysis.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-rose-600 mb-2">3. Choose an Analysis Mode</h3>
            <p className="text-slate-600 mb-2">Decide if you want to analyze one or two sets of data:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li><strong>Single:</strong> The default mode for analyzing one data source.</li>
              <li><strong>Compare:</strong> Analyze two data sources (Source A and Source B) side-by-side. This is perfect for comparing sentiment before and after an event, or between two different products. The input method you chose will apply to both sources.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-rose-600 mb-2">4. Analyze and View Results</h3>
            <p className="text-slate-600 mb-3">Once your data is ready, click the <strong>Analyze</strong> button. After processing, you'll see a comprehensive dashboard:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li><strong>Summary Metrics:</strong> Get a quick overview with cards showing total texts, and counts/percentages of positive, negative, and neutral sentiments.</li>
              <li><strong>Visualizations:</strong> Interactive pie and bar charts show sentiment distribution and average confidence scores.</li>
              <li><strong>Detailed Results:</strong> A sortable table displays the analysis for each individual text entry, including sentiment, confidence, keywords, and an explanation from the AI.</li>
              <li><strong>Export:</strong> Download your complete analysis report as a CSV, JSON, or PDF file for offline use.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;