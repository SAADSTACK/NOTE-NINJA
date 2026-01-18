
import React, { useState, useMemo } from 'react';

declare const window: any;

interface ResultDisplayProps {
  markdown: string;
}

type TabType = 'summary' | 'transcript' | 'metadata' | 'insights';

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ markdown }) => {
  const [activeTab, setActiveTab] = useState<TabType>('transcript');

  // Elite Parsing Engine: Categorizes raw markdown into specific linguistic buckets
  const parsedSections = useMemo(() => {
    const rawSections = markdown.split(/(?=###|##|# )/g);
    const data: Record<TabType, { title: string; content: string }> = {
      summary: { title: 'Executive Summary', content: '' },
      transcript: { title: 'The Transcript', content: '' },
      metadata: { title: 'Metadata', content: '' },
      insights: { title: 'QA Insights', content: '' },
    };

    rawSections.forEach((section) => {
      const match = section.match(/^#+\s*(.*)/);
      if (!match) return;
      
      const title = match[1].trim().toLowerCase();
      const content = section.replace(/^#+.*\n/, '').trim();

      if (title.includes('metadata')) {
        data.metadata.content = content;
      } else if (title.includes('summary')) {
        data.summary.content = content;
      } else if (title.includes('transcript')) {
        data.transcript.content = content;
      } else if (title.includes('insights') || title.includes('qa')) {
        data.insights.content = content;
      }
    });

    return data;
  }, [markdown]);

  const handleDownloadPDF = () => {
    const element = document.getElementById('transcription-report');
    if (!element) return;

    const opt = {
      margin: [15, 15, 15, 15],
      filename: `Note-Ninja-Report-${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    window.html2pdf().set(opt).from(element).save();
  };

  const handleDownloadTXT = () => {
    const blob = new Blob([markdown], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Note-Ninja-Transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderTranscriptContent = (content: string) => {
    const lines = content.split('\n');
    const blocks: { timestamp: string; contentLines: string[] }[] = [];
    let currentBlock: { timestamp: string; contentLines: string[] } | null = null;

    lines.forEach((line) => {
      const timestampMatch = line.match(/^\[(\d{2}:\d{2})\]/);
      if (timestampMatch) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = {
          timestamp: timestampMatch[0],
          contentLines: [line.replace(/^\[\d{2}:\d{2}\]\s*/, '')]
        };
      } else if (line.trim()) {
        if (currentBlock) {
          currentBlock.contentLines.push(line.trim());
        } else {
          blocks.push({ timestamp: '--:--', contentLines: [line.trim()] });
        }
      }
    });
    if (currentBlock) blocks.push(currentBlock);

    return blocks.map((block, bIdx) => (
      <div key={bIdx} className="flex gap-6 group mb-6 break-inside-avoid animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${bIdx * 50}ms` }}>
        <span className="text-indigo-600 font-black shrink-0 tabular-nums h-fit py-1.5 px-3 bg-indigo-50 rounded-xl text-xs border border-indigo-100/50 shadow-sm">{block.timestamp}</span>
        <div className="border-l-2 border-slate-100 pl-6 group-hover:border-indigo-400 transition-colors space-y-3">
          {block.contentLines.map((l, lIdx) => {
            const isTranslation = l.toLowerCase().startsWith('translation:');
            return (
              <p key={lIdx} className={`${isTranslation ? 'italic text-slate-500 font-medium text-[14px] bg-slate-50/80 p-3 rounded-xl border border-slate-100' : 'text-slate-800 font-medium leading-relaxed'}`}>
                {l}
              </p>
            );
          })}
        </div>
      </div>
    ));
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'summary', label: 'Summary', icon: 'fa-align-left' },
    { id: 'transcript', label: 'Transcript', icon: 'fa-list-check' },
    { id: 'metadata', label: 'Metadata', icon: 'fa-info-circle' },
    { id: 'insights', label: 'Insights', icon: 'fa-lightbulb' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Global Action Header */}
      <div className="flex flex-col lg:flex-row items-center gap-6 bg-white border border-slate-200/60 p-6 rounded-[2.5rem] no-print shadow-xl shadow-slate-200/20">
        <div className="flex items-center gap-5 flex-1">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <i className="fas fa-shield-check text-2xl"></i>
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 tracking-tight">Intelligence Verification Complete</h4>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Linguistic fidelity status: <span className="text-emerald-500">OPTIMAL</span></p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={handleDownloadPDF}
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <i className="fas fa-file-pdf"></i>
            Export PDF
          </button>
          <button 
            onClick={handleDownloadTXT}
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-slate-800 hover:text-white transition-all active:scale-95"
          >
            <i className="fas fa-file-lines"></i>
            TXT
          </button>
        </div>
      </div>

      {/* Tab Navigation Dashboard */}
      <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar no-print">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
              activeTab === tab.id 
              ? 'bg-white text-indigo-600 shadow-md border border-indigo-100 ring-2 ring-indigo-50' 
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className={`fas ${tab.icon} ${activeTab === tab.id ? 'text-indigo-500' : 'text-slate-300'}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Content Frame */}
      <div className="relative group" id="transcription-report">
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-100 p-8 md:p-14 overflow-hidden min-h-[400px]">
          {/* Header section for the active tab */}
          <div className="flex items-center justify-between mb-12 border-b border-slate-50 pb-8">
            <div className="flex items-center gap-5">
              <span className="w-1.5 h-10 gradient-bg rounded-full shadow-sm"></span>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                {parsedSections[activeTab].title}
              </h3>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
               <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LIVE DATA FEED</span>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {parsedSections[activeTab].content ? (
              <div className={`prose prose-slate max-w-none text-slate-700 ${activeTab === 'transcript' ? 'space-y-4' : 'whitespace-pre-wrap leading-relaxed font-medium text-lg'}`}>
                {activeTab === 'transcript' 
                  ? renderTranscriptContent(parsedSections[activeTab].content) 
                  : parsedSections[activeTab].content}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <i className="fas fa-ghost text-3xl"></i>
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No data captured for this sector</p>
              </div>
            )}
          </div>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 blur-3xl -z-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-50/30 blur-3xl -z-10 rounded-full"></div>
      </div>
    </div>
  );
};
