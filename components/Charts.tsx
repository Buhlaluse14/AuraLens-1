import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AnalysisResult, Sentiment } from '../types';

interface ChartsProps {
  dataA: AnalysisResult[];
  dataB?: AnalysisResult[];
}

const COLORS = {
  [Sentiment.Positive]: '#22c55e', // green-500
  [Sentiment.Negative]: '#ef4444', // red-500
  [Sentiment.Neutral]: '#64748b',  // slate-500
  [Sentiment.Error]: '#a0a0a0',
};

const renderPieChart = (data: AnalysisResult[], title: string) => {
    const sentimentCounts = data.reduce((acc, curr) => {
        acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
        return acc;
    }, {} as Record<Sentiment, number>);

    const pieData = Object.entries(sentimentCounts).map(([name, value]) => ({ name, value }));

    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name as Sentiment]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};


const Charts: React.FC<ChartsProps> = ({ dataA, dataB }) => {

    const getAvgConfidenceData = (data: AnalysisResult[]) => {
        return Object.values(Sentiment).filter(s => s !== Sentiment.Error).map(sentiment => {
            const sentimentData = data.filter(d => d.sentiment === sentiment);
            return sentimentData.length > 0
                ? sentimentData.reduce((sum, item) => sum + item.confidence, 0) / sentimentData.length
                : 0;
        });
    }
    
    const avgConfidenceData = Object.values(Sentiment).filter(s => s !== Sentiment.Error).map((sentiment, i) => {
        const avgA = getAvgConfidenceData(dataA);
        const avgB = dataB ? getAvgConfidenceData(dataB) : [];
        return {
            name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
            'Source A': avgA[i],
            ...(dataB && { 'Source B': avgB[i] }),
        };
    });


  if (!dataB) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {renderPieChart(dataA, "Sentiment Distribution")}
            <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">Average Confidence</h3>
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={avgConfidenceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 1]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Source A">
                        {avgConfidenceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as Sentiment]} />
                        ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {renderPieChart(dataA, "Source A: Sentiment Distribution")}
            {renderPieChart(dataB, "Source B: Sentiment Distribution")}
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">Average Confidence Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={avgConfidenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 1]}/>
                <Tooltip />
                <Legend />
                <Bar dataKey="Source A" fill="#60a5fa" />
                <Bar dataKey="Source B" fill="#f472b6" />
            </BarChart>
            </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;