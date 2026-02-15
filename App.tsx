
import React, { useState } from 'react';
import { initialData, BusinessPlanData } from './types';
import BusinessPlanForm from './components/BusinessPlanForm';
import BusinessPlanPreview from './components/BusinessPlanPreview';
import { Layout, FileText, Download, Save, Printer, ChevronLeft, ChevronRight, FileCode } from 'lucide-react';
import { exportToExcel, exportToMarkdown } from './utils/exportUtils';

const App: React.FC = () => {
  const [data, setData] = useState<BusinessPlanData>(initialData);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const handleUpdate = (newData: Partial<BusinessPlanData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleExportExcel = () => {
    exportToExcel(data);
  };

  const handleExportMarkdown = () => {
    exportToMarkdown(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg hidden md:block text-slate-800">創業計画書作成支援アプリ</h1>
        </div>

        <nav className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'edit' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            入力・編集
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'preview' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            プレビュー
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportMarkdown}
            className="flex items-center gap-2 bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            title="Markdownで書き出し"
          >
            <FileCode className="w-4 h-4" />
            <span className="hidden lg:inline">MD出力</span>
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            title="Excelで書き出し"
          >
            <Download className="w-4 h-4" />
            <span className="hidden lg:inline">Excel出力</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-4 h-4" />
            印刷
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'edit' ? (
          <div className="flex-1 flex flex-col">
            {/* Progress Bar */}
            <div className="bg-white px-6 py-4 border-b flex items-center gap-4">
               <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-blue-500 transition-all duration-300" 
                   style={{ width: `${(step / totalSteps) * 100}%` }}
                 />
               </div>
               <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Step {step} of {totalSteps}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-4xl mx-auto">
                <BusinessPlanForm step={step} data={data} onUpdate={handleUpdate} />
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="bg-white border-t p-4 flex justify-between items-center sticky bottom-0 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="flex items-center gap-2 px-6 py-2 rounded-lg border text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                戻る
              </button>
              
              <div className="flex items-center gap-4">
                {step === totalSteps && (
                  <button
                    onClick={() => setActiveTab('preview')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                  >
                    完成版を確認
                    <FileText className="w-4 h-4" />
                  </button>
                )}
                {step < totalSteps && (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-2 rounded-lg font-semibold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all"
                  >
                    次へ
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-slate-200 p-4 md:p-12 print:bg-white print:p-0">
            <BusinessPlanPreview data={data} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
