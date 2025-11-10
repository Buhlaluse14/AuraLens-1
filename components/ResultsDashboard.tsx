import React from 'react';
import { AnalysisResultSet, Sentiment, AnalysisResult } from '../types';
import MetricCard from './MetricCard';
import Charts from './Charts';
import DataTable from './DataTable';
import ExportButtons from './ExportButtons';

interface ResultsDashboardProps {
  results: AnalysisResultSet;
}

const renderMetrics = (data: AnalysisResult[], title: string) => {
    const total = data.length;
    const pos = data.filter(r => r.sentiment === Sentiment.Positive).length;
    const neg = data.filter(r => r.sentiment === Sentiment.Negative).length;
    const neu = data.filter(r => r.sentiment === Sentiment.Neutral).length;

    return (
        <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-rose-600 mb-4">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Total Texts" value={total} />
            <MetricCard title="Positive" value={pos} delta={total > 0 ? `${((pos / total) * 100).toFixed(1)}%` : '0%'} />
            <MetricCard title="Negative" value={neg} delta={total > 0 ? `${((neg / total) * 100).toFixed(1)}%` : '0%'} />
            <MetricCard title="Neutral" value={neu} delta={total > 0 ? `${((neu / total) * 100).toFixed(1)}%` : '0%'} />
            </div>
        </div>
    )
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results }) => {
  const { sourceA, sourceB } = results;
  const isComparison = !!sourceB;
  
  const combinedData = [
      ...sourceA.map(r => ({ ...r, source: 'A' as const })),
      ...(sourceB?.map(r => ({ ...r, source: 'B' as const })) || [])
  ];

  return (
    <div className="space-y-8">
        {isComparison && sourceB
            ? (
                <div className="space-y-8">
                    {renderMetrics(sourceA, "Summary: Source A")}
                    {renderMetrics(sourceB, "Summary: Source B")}
                </div>
            )
            : renderMetrics(sourceA, "Summary")
        }
      
      <div>
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-rose-600 mb-4">Visualizations</h2>
        <Charts dataA={sourceA} dataB={sourceB} />
      </div>

      <DataTable data={isComparison ? combinedData : sourceA} />
      <ExportButtons data={results} />
    </div>
  );
};

export default ResultsDashboard;