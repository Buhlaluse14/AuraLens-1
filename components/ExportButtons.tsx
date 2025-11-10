import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult, AnalysisResultSet } from '../types';

interface ExportButtonsProps {
  data: AnalysisResultSet;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ data }) => {
  const getTimestamp = () => new Date().toISOString().replace(/[:.]/g, '-');
  const isComparison = !!data.sourceB;
  
  const allResults = [
      ...data.sourceA.map(r => ({ ...r, source: 'A' as const })),
      ...(data.sourceB?.map(r => ({ ...r, source: 'B' as const })) || [])
  ];

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const header = isComparison 
        ? 'source,text,sentiment,confidence,keywords,explanation\n'
        : 'text,sentiment,confidence,keywords,explanation\n';
        
    const rows = allResults.map(d => {
        const values = [
            `"${d.text.replace(/"/g, '""')}"`,
            d.sentiment,
            d.confidence,
            `"${d.keywords.join(';')}"`, 
            `"${d.explanation.replace(/"/g, '""')}"`
        ];
        if (isComparison) {
            values.unshift(d.source);
        }
        return values.join(',');
    }).join('\n');

    downloadFile(header + rows, `auralens_${getTimestamp()}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportJSON = () => {
    const exportData = isComparison ? data : data.sourceA;
    const jsonString = JSON.stringify(exportData, null, 2);
    downloadFile(jsonString, `auralens_${getTimestamp()}.json`, 'application/json');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("AuraLens Analysis Report", 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const addSummary = (sourceData: AnalysisResult[], sourceName: string, yPos: number) => {
        const total = sourceData.length;
        const pos = sourceData.filter(r => r.sentiment === 'positive').length;
        const neg = sourceData.filter(r => r.sentiment === 'negative').length;
        const neu = sourceData.filter(r => r.sentiment === 'neutral').length;
        doc.setFontSize(12);
        doc.text(`Summary for ${sourceName}:`, 14, yPos);
        doc.setFontSize(10);
        doc.text(`- Total: ${total}`, 16, yPos + 6);
        doc.text(`- Positive: ${pos} (${total > 0 ? ((pos / total) * 100).toFixed(1) : 0}%)`, 16, yPos + 11);
        doc.text(`- Negative: ${neg} (${total > 0 ? ((neg / total) * 100).toFixed(1) : 0}%)`, 16, yPos + 16);
        doc.text(`- Neutral: ${neu} (${total > 0 ? ((neu / total) * 100).toFixed(1) : 0}%)`, 16, yPos + 21);
        return yPos + 30;
    };
    
    let startY = 30;
    if (isComparison && data.sourceB) {
        startY = addSummary(data.sourceA, 'Source A', startY);
        startY = addSummary(data.sourceB, 'Source B', startY);
    } else {
        startY = addSummary(data.sourceA, 'Results', startY);
    }

    const head = isComparison
        ? [['Source', 'Text', 'Sentiment', 'Confidence', 'Keywords']]
        : [['Text', 'Sentiment', 'Confidence', 'Keywords']];
    
    const body = allResults.map(d => {
        const row = [
            d.text,
            d.sentiment,
            (d.confidence * 100).toFixed(1) + '%',
            d.keywords.join(', '),
        ];
        if (isComparison) row.unshift(d.source);
        return row;
    });

    autoTable(doc, {
      startY,
      head,
      body,
      didParseCell: (data) => {
        // To handle long text wrapping
        if (data.column.dataKey === 1 || (isComparison && data.column.dataKey === 0)) {
           if (typeof data.cell.raw === 'string') {
              data.cell.styles.cellWidth = 'wrap';
           }
        }
      }
    });

    doc.save(`auralens-report_${getTimestamp()}.pdf`);
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 mt-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Export Results</h3>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
                onClick={handleExportCSV}
                className="w-full bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-all duration-300 shadow-md"
            >
                Download CSV
            </button>
            <button
                onClick={handleExportJSON}
                className="w-full bg-slate-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-all duration-300 shadow-md"
            >
                Download JSON
            </button>
            <button
                onClick={handleExportPDF}
                className="w-full bg-rose-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-rose-600 transition-all duration-300 shadow-md"
            >
                Download PDF
            </button>
        </div>
    </div>
  );
};

export default ExportButtons;