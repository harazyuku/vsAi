import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const conversation = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
あなたは公平なディベート審判です。

以下の議論を読んで、

- winner（human / ai / draw）
- reason（50文字以内）

をJSON形式で返してください。

議論:
${conversation}
`,
    });

    return NextResponse.json({
      result: response.text,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}