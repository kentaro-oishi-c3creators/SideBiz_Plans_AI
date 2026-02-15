
import * as XLSX from 'xlsx';
import { BusinessPlanData } from '../types';

export const exportToExcel = (data: BusinessPlanData) => {
  const wb = XLSX.utils.book_new();
  const formattedDate = data.date.replace(/-/g, '/');

  // 1. 基本情報・動機・略歴
  const summaryData = [
    ["創業計画書 (概要)"],
    ["作成日", formattedDate],
    ["氏名", data.ownerName],
    [],
    ["1. 創業の動機"],
    [data.motivation],
    [],
    ["2. 経営者の略歴等"],
    [data.background],
    ["資格", data.qualifications],
    ["知的財産権", data.intellectualProperty],
    [],
    ["3. 事業の内容"],
    [data.businessContent],
    ["セールスポイント", data.salesPoints],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, "事業概要");

  // 2. 収支計画
  const outlookData = [
    ["項目", "創業当初 (月平均)", "1年後 (月平均)"],
    ["売上高", data.outlook.initial.sales, data.outlook.afterOneYear.sales],
    ["売上原価", data.outlook.initial.costOfSales, data.outlook.afterOneYear.costOfSales],
    ["人件費", data.outlook.initial.labor, data.outlook.afterOneYear.labor],
    ["家賃", data.outlook.initial.rent, data.outlook.afterOneYear.rent],
    ["その他経費", data.outlook.initial.others, data.outlook.afterOneYear.others],
    [],
    ["算出根拠"],
    [data.outlook.basis]
  ];
  const outlookSheet = XLSX.utils.aoa_to_sheet(outlookData);
  XLSX.utils.book_append_sheet(wb, outlookSheet, "収支計画");

  // ファイル書き出し
  XLSX.writeFile(wb, `創業計画書_${data.ownerName || '未入力'}.xlsx`);
};

export const exportToMarkdown = (data: BusinessPlanData) => {
  const formatYen = (num: number) => new Intl.NumberFormat('ja-JP').format(num) + '円';
  const formattedDate = data.date.replace(/-/g, '/');
  
  const calculateProfit = (period: 'initial' | 'afterOneYear') => {
    const p = data.outlook[period];
    return p.sales - (p.costOfSales + p.labor + p.rent + p.others);
  };

  const content = `# 創業計画書

**作成日:** ${formattedDate}
**氏名:** ${data.ownerName || '未入力'}

## 1. 創業の動機
${data.motivation || '未入力'}

## 2. 経営者の略歴等
### 略歴
${data.background || '未入力'}

### 資格・知的財産権
- **資格:** ${data.qualifications || '特になし'}
- **知的財産権:** ${data.intellectualProperty || '特になし'}

## 3. 取扱商品・サービス
### 事業内容
${data.businessContent || '未入力'}

### 主力商品・シェア
${data.products.map(p => `- ${p.name || '---'}: ${p.share || '0'}%`).join('\n')}

### セールスポイント
${data.salesPoints || '未入力'}

## 4. 従業員
- 役員: ${data.employees.directors}人
- 正社員: ${data.employees.staff}人
- 家族従業員: ${data.employees.family}人
- パート・アルバイト: ${data.employees.partTime}人

## 9. 事業の見通し (月平均)
| 項目 | 創業当初 | 1年後軌道に乗った後 |
| :--- | :--- | :--- |
| 売上高 | ${formatYen(data.outlook.initial.sales)} | ${formatYen(data.outlook.afterOneYear.sales)} |
| 売上原価 | ${formatYen(data.outlook.initial.costOfSales)} | ${formatYen(data.outlook.afterOneYear.costOfSales)} |
| 人件費 | ${formatYen(data.outlook.initial.labor)} | ${formatYen(data.outlook.afterOneYear.labor)} |
| 家賃 | ${formatYen(data.outlook.initial.rent)} | ${formatYen(data.outlook.afterOneYear.rent)} |
| その他経費 | ${formatYen(data.outlook.initial.others)} | ${formatYen(data.outlook.afterOneYear.others)} |
| **営業利益** | **${formatYen(calculateProfit('initial'))}** | **${formatYen(calculateProfit('afterOneYear'))}** |

### 売上・経費の算出根拠
${data.outlook.basis || '未入力'}
`;

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `創業計画書_${data.ownerName || '未入力'}.md`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
