import React from 'react';
import { AnalysisResult, Sentiment } from '../types';

interface DataTableProps {
  data: AnalysisResult[];
}

const sentimentColorMap: Record<Sentiment, string> = {
    [Sentiment.Positive]: 'bg-green-100 text-green-800',
    [Sentiment.Negative]: 'bg-red-100 text-red-800',
    [Sentiment.Neutral]: 'bg-gray-100 text-gray-800',
    [Sentiment.Error]: 'bg-yellow-100 text-yellow-800',
}

const engineColorMap: Record<'gemini' | 'openai', string> = {
    gemini: 'bg-blue-100 text-blue-800',
    openai: 'bg-teal-100 text-teal-800',
};

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const showSourceColumn = data.length > 0 && !!data[0].source;
  const showEngineColumn = data.length > 0 && !!data[0].engine;


  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 mt-8">
       <h3 className="text-lg font-semibold text-slate-800 mb-4">Detailed Results</h3>
       <div className="overflow-x-auto max-h-96">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              {showSourceColumn && <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-rose-900/60 uppercase tracking-wider">Source</th>}
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-rose-900/60 uppercase tracking-wider">Text</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-rose-900/60 uppercase tracking-wider">Sentiment</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-rose-900/60 uppercase tracking-wider">Confidence</th>
              {showEngineColumn && <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-rose-900/60 uppercase tracking-wider">Engine</th>}
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-rose-900/60 uppercase tracking-wider">Keywords</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-rose-900/60 uppercase tracking-wider">Explanation</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index}>
                {showSourceColumn && <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">{item.source}</td>}
                <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-700 max-w-xs">{item.text}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sentimentColorMap[item.sentiment]}`}>
                    {item.sentiment}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(item.confidence * 100).toFixed(1)}%</td>
                {showEngineColumn && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.engine && (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${engineColorMap[item.engine]}`}>
                        {item.engine}
                      </span>
                    )}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs">{item.keywords.join(', ')}</td>
                <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-500 max-w-xs">{item.explanation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;