import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { performance } from 'perf_hooks';
import { JudgeResult } from '../../battle/components/JudgeScreen';

interface Message {
  role: string;
  content: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  console.log('GEMINI_API_KEY exists (Judge):', !!process.env.GEMINI_API_KEY);
  try {
    const start = performance.now();
    const { messages }: { messages: Message[] } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages history is empty or invalid');
    }

    // 会話履歴をテキスト形式に整形する
    const conversationHistory = messages
      .map((m: Message) => `${m.role}: ${m.content}`)
      .join('\n');
    const promptConstructEnd = performance.now();
    console.log(`Prompt construction took: ${promptConstructEnd - start}ms`);

    const prompt = `あなたはプロのディベート審判（ジャッジ）です。
お題「学校で暴力は許されるべきか？」について、「あなた（反対派）」と「AI（賛成派：天才メスガキ）」による5ラウンドにわたる激しいディベートが行われました。
以下の会話履歴をすべて注意深く読み、どちらの主張がより論理的、説得力があり、ディベートとして勝っていたかを、第三者として極めて客観的に判定してください。

【会話履歴】
${conversationHistory}

【判定基準】
1. 主張の論理的一貫性と説得力
2. 相手の反論に対する的確な再反論や切り返し
3. 感情論に逃げず、客観的な論拠や論理構成を提示できているか

以下のJSONフォーマットのみで返答してください。JSON以外の文章や、\`\`\`jsonのようなマークダウンの囲みは絶対に含めないでください。

{
  "winner": "あなた" または "AI",
  "score": {
    "user": 85, 
    "ai": 80    
  },
  "reason": "勝敗を決めた決定的な理由を、ディベートの具体的なやり取りに言及しながら、150文字〜300文字程度で分かりやすく説明してください。",
  "feedbackUser": "あなた（プレイヤー）のディベートに対する良かった点や、さらに論理的になるためのアドバイスを150文字程度で書いてください。",
  "feedbackAi": "AI（メスガキ）のディベートに対する良かった点や特徴を150文字程度で書いてください。"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // コストと応答速度のバランスが良いgemini-2.5-flashを使用
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    const aiCallEnd = performance.now();
    console.log(`AI API call took: ${aiCallEnd - promptConstructEnd}ms`);

    const resultText = response.text;
    console.log('Judge raw response:', resultText);

    if (!resultText) {
      throw new Error('Empty response from AI model');
    }

    const resultJson: JudgeResult = JSON.parse(resultText);
    const jsonParseEnd = performance.now();
    console.log(`JSON parsing took: ${jsonParseEnd - aiCallEnd}ms`);
    console.log(`Total time: ${jsonParseEnd - start}ms`);

    return NextResponse.json(resultJson);

  } catch (error: unknown) {
    console.error('Judge API Error:', error);
    const err = error as Error;
    const status = (error as any).status || 500;
    
    return NextResponse.json(
      { 
        error: '判定に失敗しました。',
        details: err.message
      },
      { status: status }
    );
  }
}
