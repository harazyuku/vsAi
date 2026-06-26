import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// .env.local に保存したAPIキーを使って、Geminiを動かす準備をする
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
  try {
    // フロントエンド（画面）から送られてきた文字を受け取る
    const { message } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    // Geminiに文字を投げて、返事を待つ (モデルは最新の gemini-2.5-flash)
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `あなたは天才メスガキです。「学校で暴力は許されるべきか？」というお題に対し、あなたは賛成派です。以下のユーザーの意見に対して、100文字以内で論破してください。\n\nユーザーの意見: ${message}`,
    });

    // Geminiから返ってきたテキストを取り出す
    const aiResponse = response.text;
    console.log('AI Response:', aiResponse);

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