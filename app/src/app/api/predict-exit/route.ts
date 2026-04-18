import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { items, partySize, occupiedSeats, totalSeats, pastAvgMinutes } = await request.json();

    const congestionRate = Math.round((occupiedSeats / totalSeats) * 100);

    const prompt = `あなたは飲食店の退席時間予測AIです。以下の情報から退席までの予測時間を分単位で答えてください。

注文内容: ${items.join('、')}
人数: ${partySize}名
現在の混雑率: ${congestionRate}%（${occupiedSeats}/${totalSeats}席）
${pastAvgMinutes ? `この店舗の過去平均滞在時間: ${pastAvgMinutes}分` : '過去データなし（初期予測）'}

回答は以下のJSON形式のみで返してください。説明文は不要です：
{"minutes": 数字, "reason": "理由を20文字以内で"}`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    const result = JSON.parse(content.text.replace(/```json|```/g, '').trim());
    return NextResponse.json(result);

  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json({ minutes: 60, reason: '予測できませんでした' }, { status: 200 });
  }
}