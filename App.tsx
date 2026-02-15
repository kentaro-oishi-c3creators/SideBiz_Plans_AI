
import React, { useState, useEffect, useRef } from 'react';
import { initialData, BusinessPlanData } from './types';
import BusinessPlanForm from './components/BusinessPlanForm';
import BusinessPlanPreview from './components/BusinessPlanPreview';
import { Layout, FileText, Download, Save, Printer, ChevronLeft, ChevronRight, FileCode, RotateCcw, CloudCheck, Cloud } from 'lucide-react';
import { exportToExcel, exportToMarkdown } from './utils/exportUtils';

const STORAGE_KEY = 'business_plan_draft_v1';

const App: React.FC = () => {
  const [data, setData] = useState<BusinessPlanData>(initialData);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [step, setStep] = useState(1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const totalSteps = 6;

  // 1. マウント時にデータを読み込む
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(parsed);
        setLastSaved(new Date());
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
  }, []);

  // 2. データが変更されたら自動保存する
  useEffect(() => {
    // 初期の空データでないことを確認して保存（またはマウント後の初回実行を許容）
    const saveTimer = setTimeout(() => {
      setIsSaving(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setLastSaved(new Date());
      // 保存アニメーション用のウェイト
      setTimeout(() => setIsSaving(false), 500);
    }, 1000); // タイピングが終わって1秒後に保存

    return () => clearTimeout(saveTimer);
  }, [data]);

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

  const handleReset = () => {
    if (window.confirm('入力内容をすべて削除して、最初から作り直しますか？')) {
      localStorage.removeItem(STORAGE_KEY);
      setData(initialData);
      setStep(1);
      setLastSaved(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg hidden md:block text-slate-800">創業計画書作成支援アプリ</h1>
          </div>
          
          {/* Save Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            {isSaving ? (
              <>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span>保存中...</span>
              </>
            ) : lastSaved ? (
              <>
                <CloudCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>保存済み ({lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5" />
                <span>未保存</span>
              </>
            )}
          </div>
        </div>

        <nav className="flex items-center bg-slate-100 p-1 rounded-xl mx-2">
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
            onClick={handleReset}
            className="flex items-center gap-2 text-slate-400 hover:text-rose-500 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            title="内容をリセット"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden lg:inline">リセット</span>
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1 hidden lg:block" />
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
                <BusinessPlanForm 
                  step={step} 
                  data={data} 
                  onUpdate={handleUpdate} 
                  onNext={nextStep}
                />
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
