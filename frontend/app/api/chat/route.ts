import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// .env.local に保存したAPIキーを使って、Geminiを動かす準備をする
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    // フロントエンド（画面）から送られてきたデータを受け取る
    const { message, prompt, persona } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    // Geminiに投げるプロンプトを作成
    const fullPrompt = `${persona}\n\n${prompt}\n\nユーザーの意見: ${message}`;

    // Geminiに文字を投げて、返事を待つ
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: fullPrompt,
    });

    // Geminiから返ってきたテキストを取り出す
    const aiResponse = response.text;

    // 成功したら、フロントエンドにAIの返事を返す
    return NextResponse.json({ reply: aiResponse });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    // APIからのエラーであれば、そのステータスコードをそのまま返す
    const status = error.status || 500;
    
    return NextResponse.json(
      { 
        error: 'AIの呼び出しに失敗しました。',
        details: error.message
      },
      { status: status }
    );
  }
}