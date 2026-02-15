
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generateContent(prompt: string, sectionName: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `あなたは創業支援の専門家です。以下の情報に基づいて、「${sectionName}」の項目を、創業計画書にふさわしい公的で説得力のある文章に整えてください。
      
      ユーザー入力: ${prompt}
      
      制約事項:
      - 日本政策金融公庫の創業計画書にそのまま記載できるような、簡潔かつ明確な表現にしてください。
      - 箇条書きを適宜使用してください。
      - 文章のみを出力してください。`,
    });
    return response.text || "AIの生成に失敗しました。";
  } catch (error) {
    console.error("AI Error:", error);
    return "AIの生成中にエラーが発生しました。";
  }
}

export async function extractDataFromPDF(base64Data: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Data
          }
        },
        {
          text: "このPDFは職務経歴書または履歴書です。創業計画書に必要な情報を抽出してJSON形式で返してください。不明な項目は空文字にしてください。"
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ownerName: { type: Type.STRING, description: "氏名" },
            background: { type: Type.STRING, description: "経歴の要約（箇条書き）" },
            qualifications: { type: Type.STRING, description: "資格・免許" },
          },
          required: ["ownerName", "background", "qualifications"]
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    throw error;
  }
}

export async function getFinancialAdvice(data: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `あなたは金融機関の審査担当者です。以下の創業計画書の数値データを見て、リスクや改善点、または強みについてアドバイスをください。
      
      データ: ${data}
      
      制約事項:
      - 200文字程度で簡潔にアドバイスしてください。`,
    });
    return response.text || "";
  } catch (error) {
    return "";
  }
}
