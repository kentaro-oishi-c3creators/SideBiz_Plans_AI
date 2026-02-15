
import { GoogleGenAI, Type } from "@google/genai";

// Use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    // .text is a property, not a method
    return response.text || "AIの生成に失敗しました。";
  } catch (error) {
    console.error("AI Error:", error);
    return "AIの生成中にエラーが発生しました。";
  }
}

/**
 * 融資担当者になりきって内容を厳しくレビューする
 */
export async function reviewSection(content: string, sectionName: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `あなたは日本政策金融公庫の、非常に厳格な融資審査担当者です。
      以下の「${sectionName}」の内容を審査し、融資判断の観点から「ここが弱い」「具体性が足りない」といった厳しい指摘を必ず3点挙げてください。
      
      その後、その3点を改善するために、申請者（ユーザー）に対して投げかけるべき具体的な質問を提示してください。
      
      レビュー対象の文章:
      ${content}
      
      応答は以下のJSON形式で返してください。
      {
        "critiques": ["指摘1", "指摘2", "指摘3"],
        "questions": ["質問1", "質問2", "質問3"]
      }`,
      config: {
        responseMimeType: "application/json",
        // Adding responseSchema as recommended by guidelines
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            critiques: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["critiques", "questions"]
        }
      }
    });
    
    // .text is a property, not a method
    return JSON.parse(response.text || '{"critiques":[], "questions":[]}');
  } catch (error) {
    console.error("Review Error:", error);
    return { 
      critiques: ["レビューの生成中にエラーが発生しました。"], 
      questions: ["再度お試しください。"] 
    };
  }
}

/**
 * Google Search を使用して市場規模やニュースを検索し、ビジネスの背景データを生成する
 */
export async function searchMarketInsights(businessIdea: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `ビジネスアイデア: 「${businessIdea}」
      このビジネスに関連する最新の市場規模、トレンド、将来性、および関連ニュースをGoogle検索を使用して調査してください。
      
      調査結果に基づき、創業計画書の「市場の背景・有望性」として記載できる、客観的な数値や事実を含んだ説得力のある文章を作成してください。
      
      制約:
      - 信頼できるデータソース（官公庁、調査機関、ニュース記事）を元にしてください。
      - 200〜300文字程度で、具体的かつ専門的なトーンで記述してください。`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // .text is a property, not a method
    const text = response.text || "";
    // グラウンディング情報から出典URLを抽出
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || "出典",
        uri: chunk.web?.uri || ""
      }))
      .filter((s: any) => s.uri) || [];

    return { text, sources };
  } catch (error) {
    console.error("Search Error:", error);
    return { text: "市場調査中にエラーが発生しました。時間を置いて再度お試しください。", sources: [] };
  }
}

export async function extractDataFromPDF(base64Data: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data
            }
          },
          {
            text: "このPDFは職務経歴書または履歴書です。創業計画書に必要な情報を抽出してJSON形式で返してください。不明な項目は空文字にしてください。"
          }
        ]
      },
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
    
    // .text is a property, not a method
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    throw error;
  }
}
