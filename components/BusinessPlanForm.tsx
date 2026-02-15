
import React, { useState, useRef } from 'react';
import { BusinessPlanData } from '../types';
import { Sparkles, Loader2, Info, FileUp, Upload } from 'lucide-react';
import { generateContent, extractDataFromPDF } from '../geminiService';

interface Props {
  step: number;
  data: BusinessPlanData;
  onUpdate: (newData: Partial<BusinessPlanData>) => void;
}

const BusinessPlanForm: React.FC<Props> = ({ step, data, onUpdate }) => {
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAIHelp = async (section: keyof BusinessPlanData, title: string) => {
    const prompt = (data[section] as string) || '';
    if (!prompt.trim()) {
      alert("AIで整えるためのメモやキーワードを先に入力してください。");
      return;
    }
    setLoadingSection(section as string);
    const result = await generateContent(prompt, title);
    onUpdate({ [section]: result });
    setLoadingSection(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('PDFファイルを選択してください。');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        const extracted = await extractDataFromPDF(base64);
        onUpdate({
          ownerName: extracted.ownerName || data.ownerName,
          background: extracted.background || data.background,
          qualifications: extracted.qualifications || data.qualifications
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      alert('PDFの解析に失敗しました。');
      setIsUploading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8">
            <section className="bg-blue-50 border border-blue-100 rounded-2xl p-6 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 mb-1 flex items-center gap-2">
                    <FileUp className="w-5 h-5" />
                    職務経歴書から自動入力
                  </h3>
                  <p className="text-sm text-blue-700">PDFをアップロードすると、AIが氏名や経歴を抽出します。</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-white border-2 border-blue-200 text-blue-600 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-100 transition-all disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {isUploading ? '解析中...' : 'PDFをアップロード'}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf" 
                  onChange={handleFileUpload} 
                />
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">お名前</label>
                <input
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="氏名を入力"
                  value={data.ownerName}
                  onChange={(e) => onUpdate({ ownerName: e.target.value })}
                />
              </div>
            </div>

            <section className="space-y-4">
              <label className="block text-lg font-bold text-slate-800">1. 創業の動機</label>
              <div className="relative group">
                <textarea
                  className="w-full min-h-[160px] p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="例: 長年エンジニアとして働いてきましたが、地元特産の野菜を使ったカフェを開きたいと考えるようになりました..."
                  value={data.motivation}
                  onChange={(e) => onUpdate({ motivation: e.target.value })}
                />
                <button
                  onClick={() => handleAIHelp('motivation', '創業の動機')}
                  disabled={loadingSection === 'motivation'}
                  className="absolute bottom-4 right-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loadingSection === 'motivation' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  AIで清書
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <label className="block text-lg font-bold text-slate-800">2. 経営者の略歴等</label>
              <textarea
                className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="勤務先、役職、身につけた技能など"
                value={data.background}
                onChange={(e) => onUpdate({ background: e.target.value })}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">取得資格</label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-lg border border-slate-200"
                    value={data.qualifications}
                    onChange={(e) => onUpdate({ qualifications: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">知的財産権等</label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-lg border border-slate-200"
                    value={data.intellectualProperty}
                    onChange={(e) => onUpdate({ intellectualProperty: e.target.value })}
                  />
                </div>
              </div>
            </section>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <label className="block text-lg font-bold text-slate-800">3. 取扱商品・サービス</label>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">具体的な内容</label>
                  <textarea
                    className="w-full min-h-[100px] p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={data.businessContent}
                    onChange={(e) => onUpdate({ businessContent: e.target.value })}
                  />
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <span className="block font-semibold mb-4 text-slate-700">主力商品のシェア</span>
                  {data.products.map((p, idx) => (
                    <div key={idx} className="flex gap-4 mb-3">
                      <input
                        placeholder={`商品名 ${idx + 1}`}
                        className="flex-1 p-2 border rounded-lg"
                        value={p.name}
                        onChange={(e) => {
                          const newProds = [...data.products];
                          newProds[idx].name = e.target.value;
                          onUpdate({ products: newProds });
                        }}
                      />
                      <input
                        placeholder="シェア %"
                        className="w-24 p-2 border rounded-lg"
                        value={p.share}
                        onChange={(e) => {
                          const newProds = [...data.products];
                          newProds[idx].share = e.target.value;
                          onUpdate({ products: newProds });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <label className="block text-lg font-bold text-slate-800">セールスポイント</label>
              <div className="relative">
                <textarea
                  className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={data.salesPoints}
                  onChange={(e) => onUpdate({ salesPoints: e.target.value })}
                  placeholder="競合との違いや自社の強み"
                />
                <button
                  onClick={() => handleAIHelp('salesPoints', 'セールスポイント')}
                  disabled={loadingSection === 'salesPoints'}
                  className="absolute bottom-4 right-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md transition-all disabled:opacity-50"
                >
                  {loadingSection === 'salesPoints' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  AIで強化
                </button>
              </div>
            </section>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <section className="space-y-4">
              <label className="block text-lg font-bold text-slate-800">販売ターゲット・販売戦略</label>
              <div className="relative">
                <textarea
                  className="w-full min-h-[140px] p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={data.targets}
                  onChange={(e) => onUpdate({ targets: e.target.value })}
                  placeholder="どんな顧客層に、どうやってアプローチするか"
                />
                <button
                   onClick={() => handleAIHelp('targets', '販売ターゲット')}
                   disabled={loadingSection === 'targets'}
                   className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md transition-all"
                >
                   {loadingSection === 'targets' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                   戦略をAI提案
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <label className="block text-lg font-bold text-slate-800">4. 従業員</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {['directors', 'staff', 'family', 'partTime'].map((key) => (
                   <div key={key}>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                       {key === 'directors' ? '役員' : key === 'staff' ? '正社員' : key === 'family' ? '家族' : 'パート'}
                     </label>
                     <div className="flex items-center gap-2">
                       <input
                        type="number"
                        className="w-full p-3 border rounded-lg text-center font-bold"
                        value={data.employees[key as keyof typeof data.employees]}
                        onChange={(e) => onUpdate({ employees: { ...data.employees, [key]: e.target.value } })}
                       />
                       <span className="text-sm text-slate-500">人</span>
                     </div>
                   </div>
                 ))}
              </div>
            </section>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8">
            <section className="space-y-4">
               <div className="flex justify-between items-center">
                 <label className="text-lg font-bold text-slate-800">5. 取引先関係</label>
               </div>
               <p className="text-sm text-slate-500">主要な販売先や仕入先を入力してください。</p>
               
               <div className="bg-white rounded-2xl border overflow-hidden">
                 <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 border-b">
                     <tr>
                       <th className="px-4 py-3">取引先名</th>
                       <th className="px-4 py-3">所在地</th>
                       <th className="px-4 py-3">シェア %</th>
                       <th className="px-4 py-3">回収/支払条件</th>
                     </tr>
                   </thead>
                   <tbody>
                     <tr className="border-b">
                        <td className="px-4 py-3"><input className="w-full bg-transparent outline-none" placeholder="一般顧客" /></td>
                        <td className="px-4 py-3"><input className="w-full bg-transparent outline-none" placeholder="全国" /></td>
                        <td className="px-4 py-3"><input className="w-full bg-transparent outline-none" placeholder="100" /></td>
                        <td className="px-4 py-3"><input className="w-full bg-transparent outline-none" placeholder="即時" /></td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </section>

            <section className="space-y-4">
              <label className="block text-lg font-bold text-slate-800">7. お借入の状況</label>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">法人の場合は代表者の方のお借入を含めます。住宅ローン、自動車ローン、カードローン等。副業の場合は個人の債務状況が重要になります。</p>
              </div>
              <div className="space-y-2">
                <div className="flex gap-4">
                  <input className="flex-1 p-3 border rounded-lg" placeholder="お借入先名" />
                  <input className="w-40 p-3 border rounded-lg" placeholder="残高 (万円)" />
                  <input className="w-40 p-3 border rounded-lg" placeholder="年間返済額 (万円)" />
                </div>
              </div>
            </section>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8">
             <section className="space-y-4">
               <label className="block text-lg font-bold text-slate-800">8. 必要な資金と調達方法</label>
               
               <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                   <h3 className="font-bold text-slate-600 flex items-center gap-2">
                     <span className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-xs">A</span>
                     必要な資金
                   </h3>
                   <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                     <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                       <span>設備資金 (店舗・PC等)</span>
                       <input 
                         type="number" 
                         className="w-32 p-2 border rounded bg-white text-right" 
                         placeholder="0"
                         value={data.funds.fundingSelf} // Placeholder mapping
                         onChange={(e) => onUpdate({ funds: { ...data.funds, fundingSelf: Number(e.target.value) } })}
                       />
                     </div>
                     <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                       <span>運転資金 (仕入等)</span>
                       <input 
                         type="number" 
                         className="w-32 p-2 border rounded bg-white text-right" 
                         placeholder="0"
                       />
                     </div>
                   </div>
                 </div>

                 <div className="space-y-4">
                   <h3 className="font-bold text-slate-600 flex items-center gap-2">
                     <span className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-xs">B</span>
                     調達方法
                   </h3>
                   <div className="bg-blue-50/50 p-4 rounded-xl space-y-3 border border-blue-100">
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-600">自己資金</span>
                       <input type="number" className="w-32 p-2 border rounded bg-white text-right" placeholder="0" />
                     </div>
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-600">公庫からの借入</span>
                       <input type="number" className="w-32 p-2 border rounded bg-white text-right" placeholder="0" />
                     </div>
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-600">親・知人等からの借入</span>
                       <input type="number" className="w-32 p-2 border rounded bg-white text-right" placeholder="0" />
                     </div>
                   </div>
                 </div>
               </div>
             </section>
          </div>
        );
      case 6:
        return (
          <div className="space-y-8">
             <section className="space-y-6">
                <label className="block text-lg font-bold text-slate-800">9. 事業の見通し (月平均)</label>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-500 border-b">
                        <th className="px-4 py-2 font-medium text-left">項目</th>
                        <th className="px-4 py-2 font-medium text-right">創業当初</th>
                        <th className="px-4 py-2 font-medium text-right">1年後</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[
                        { label: '売上高', key: 'sales' },
                        { label: '売上原価', key: 'costOfSales' },
                        { label: '人件費', key: 'labor' },
                        { label: '家賃', key: 'rent' },
                        { label: 'その他', key: 'others' },
                      ].map((item) => (
                        <tr key={item.key}>
                          <td className="px-4 py-4 font-bold text-slate-700">{item.label}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <input 
                                type="number" 
                                className="w-32 p-2 border rounded text-right bg-slate-50" 
                                value={data.outlook.initial[item.key as keyof typeof data.outlook.initial]}
                                onChange={(e) => {
                                  const newVal = Number(e.target.value);
                                  onUpdate({ outlook: { ...data.outlook, initial: { ...data.outlook.initial, [item.key]: newVal } } });
                                }}
                              />
                              <span className="text-slate-400">円</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <input 
                                type="number" 
                                className="w-32 p-2 border rounded text-right bg-blue-50/50" 
                                value={data.outlook.afterOneYear[item.key as keyof typeof data.outlook.afterOneYear]}
                                onChange={(e) => {
                                  const newVal = Number(e.target.value);
                                  onUpdate({ outlook: { ...data.outlook, afterOneYear: { ...data.outlook.afterOneYear, [item.key]: newVal } } });
                                }}
                              />
                              <span className="text-slate-400">円</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
                   <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">Calculated Profit (利益)</h4>
                   <div className="grid grid-cols-2 gap-8">
                     <div>
                       <span className="text-slate-400 text-xs">創業当初</span>
                       <div className="text-2xl font-bold">
                         {(data.outlook.initial.sales - (data.outlook.initial.costOfSales + data.outlook.initial.labor + data.outlook.initial.rent + data.outlook.initial.others)).toLocaleString()} 円
                       </div>
                     </div>
                     <div>
                       <span className="text-slate-400 text-xs">1年後軌道に乗った後</span>
                       <div className="text-2xl font-bold text-blue-400">
                         {(data.outlook.afterOneYear.sales - (data.outlook.afterOneYear.costOfSales + data.outlook.afterOneYear.labor + data.outlook.afterOneYear.rent + data.outlook.afterOneYear.others)).toLocaleString()} 円
                       </div>
                     </div>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">売上・経費の根拠</label>
                  <textarea 
                    className="w-full min-h-[100px] p-4 border rounded-xl"
                    placeholder="例: 客単価1,000円 × 1日20人 × 月25日営業として算出..."
                    value={data.outlook.basis}
                    onChange={(e) => onUpdate({ outlook: { ...data.outlook, basis: e.target.value } })}
                  />
                </div>
             </section>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {renderStep()}
    </div>
  );
};

export default BusinessPlanForm;
