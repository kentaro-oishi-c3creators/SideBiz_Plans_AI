
import * as XLSX from 'xlsx';
import { BusinessPlanData } from '../types';

export const exportToExcel = (data: BusinessPlanData) => {
  const wb = XLSX.utils.book_new();

  // 1. 基本情報・動機・略歴
  const summaryData = [
    ["創業計画書 (概要)"],
    ["作成日", data.date],
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
