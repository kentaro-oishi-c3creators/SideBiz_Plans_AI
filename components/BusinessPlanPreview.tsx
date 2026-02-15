
import React from 'react';
import { BusinessPlanData } from '../types';

interface Props {
  data: BusinessPlanData;
}

const BusinessPlanPreview: React.FC<Props> = ({ data }) => {
  const formatYen = (num: number) => new Intl.NumberFormat('ja-JP').format(num);

  const calculateProfit = (period: 'initial' | 'afterOneYear') => {
    const p = data.outlook[period];
    return p.sales - (p.costOfSales + p.labor + p.rent + p.interest + p.others);
  };

  return (
    <div className="bg-white shadow-2xl max-w-4xl mx-auto p-[10mm] min-h-[297mm] text-[10pt] leading-relaxed text-slate-900 font-serif print:shadow-none print:m-0">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-widest border-b-4 border-double border-slate-900 pb-2 inline-block">創業計画書</h1>
        <div className="text-right mt-2">
          <span>令和 {new Date().getFullYear() - 2018} 年 {new Date().getMonth() + 1} 月 {new Date().getDate()} 日 作成</span>
        </div>
      </div>

      <div className="mb-4">
        <span className="border-b border-slate-900 pb-1 pr-12">お名前： {data.ownerName || '________________'}</span>
      </div>

      <Section title="1 創業の動機">
        <p className="whitespace-pre-wrap min-h-[3em]">{data.motivation || '（未入力）'}</p>
      </Section>

      <Section title="2 経営者の略歴等">
        <div className="space-y-4">
          <div className="whitespace-pre-wrap">{data.background || '（未入力）'}</div>
          <div className="grid grid-cols-2 gap-4 text-sm border-t pt-2">
            <div>取得資格： {data.qualifications || '特になし'}</div>
            <div>知的財産権： {data.intellectualProperty || '特になし'}</div>
          </div>
        </div>
      </Section>

      <Section title="3 取扱商品・サービス">
        <div className="space-y-4">
          <div>
            <span className="font-bold underline mb-1 block">事業内容</span>
            <p className="whitespace-pre-wrap">{data.businessContent || '（未入力）'}</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <span className="font-bold underline mb-1 block">取扱商品・サービスの内容</span>
              <ul className="list-decimal list-inside">
                {data.products.map((p, i) => (
                  <li key={i}>{p.name || '---'} (シェア: {p.share || '0'}%)</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-bold underline mb-1 block">セールスポイント</span>
              <p className="whitespace-pre-wrap text-[9pt]">{data.salesPoints || '（未入力）'}</p>
            </div>
          </div>
        </div>
      </Section>

      <div className="grid grid-cols-2 gap-8">
        <Section title="4 従業員">
          <table className="w-full text-center border-collapse border border-slate-900">
            <tbody>
              <tr className="border-b border-slate-900">
                <td className="bg-slate-50 p-1 border-r border-slate-900">役員</td>
                <td className="p-1">{data.employees.directors}人</td>
                <td className="bg-slate-50 p-1 border-x border-slate-900">従業員</td>
                <td className="p-1">{data.employees.staff}人</td>
              </tr>
              <tr>
                <td className="bg-slate-50 p-1 border-r border-slate-900">家族</td>
                <td className="p-1">{data.employees.family}人</td>
                <td className="bg-slate-50 p-1 border-x border-slate-900">パート</td>
                <td className="p-1">{data.employees.partTime}人</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="9 事業の見通し (月平均)">
           <table className="w-full text-right text-[9pt] border-collapse border border-slate-900">
             <thead>
               <tr className="bg-slate-50 border-b border-slate-900">
                 <th className="p-1 text-left border-r border-slate-900">項目</th>
                 <th className="p-1 border-r border-slate-900">創業当初</th>
                 <th className="p-1">1年後</th>
               </tr>
             </thead>
             <tbody>
               <tr className="border-b border-slate-900">
                 <td className="p-1 text-left border-r border-slate-900 font-bold">売上高</td>
                 <td className="p-1 border-r border-slate-900">{formatYen(data.outlook.initial.sales)}</td>
                 <td className="p-1">{formatYen(data.outlook.afterOneYear.sales)}</td>
               </tr>
               <tr className="border-b border-slate-900">
                 <td className="p-1 text-left border-r border-slate-900">売上原価</td>
                 <td className="p-1 border-r border-slate-900">{formatYen(data.outlook.initial.costOfSales)}</td>
                 <td className="p-1">{formatYen(data.outlook.afterOneYear.costOfSales)}</td>
               </tr>
               <tr className="border-b border-slate-900">
                 <td className="p-1 text-left border-r border-slate-900">人件費</td>
                 <td className="p-1 border-r border-slate-900">{formatYen(data.outlook.initial.labor)}</td>
                 <td className="p-1">{formatYen(data.outlook.afterOneYear.labor)}</td>
               </tr>
               <tr className="border-b border-slate-900 bg-slate-100 font-bold">
                 <td className="p-1 text-left border-r border-slate-900">利益</td>
                 <td className="p-1 border-r border-slate-900">{formatYen(calculateProfit('initial'))}</td>
                 <td className="p-1">{formatYen(calculateProfit('afterOneYear'))}</td>
               </tr>
             </tbody>
           </table>
        </Section>
      </div>

      <div className="mt-8">
        <span className="font-bold underline mb-1 block">売上・経費の算出根拠</span>
        <p className="whitespace-pre-wrap text-[9pt] border p-4 rounded min-h-[4em]">{data.outlook.basis || '（未入力）'}</p>
      </div>

      <div className="mt-12 text-center text-[8pt] text-slate-400 print:hidden">
        ※ 実際の様式に合わせて適宜修正してご使用ください。
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="bg-slate-900 text-white px-3 py-1 text-sm font-bold mb-3 inline-block">{title}</h2>
    <div className="pl-2 border-l-2 border-slate-200">
      {children}
    </div>
  </div>
);

export default BusinessPlanPreview;
