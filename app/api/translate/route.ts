// app/api/translate/route.ts
import { NextResponse } from 'next/server';
import { franc } from 'franc';
import OpenAI from 'openai';
import { currentUser } from '@clerk/nextjs/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const user = await currentUser(); // Get current Clerk user
    const body = await request.json();
    const input = body.text;
    const direction = body.direction || 'auto';

    if (!input) {
      return NextResponse.json({ error: 'Text input required.' }, { status: 400 });
    }

    const langCode = franc(input);
    const isSomali = direction === 'so-en' || (direction === 'auto' && langCode === 'som');

    const systemPrompt = isSomali
      ? 'You are a professional Somali-English translator. Translate the Somali text into formal and accurate English.'
      : 'You are a professional English-Somali translator. Translate the English text into formal Somali.';

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input },
      ],
    });

    const translatedText = response.choices[0]?.message?.content?.trim();

    if (!translatedText) {
      return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
    }

    // ✅ Save to Firebase if user is logged in
    if (user) {
      await addDoc(collection(db, 'translations'), {
        userId: user.id,
        original: input,
        result: translatedText,
        direction,
        createdAt: serverTimestamp(),
      });
    }

    return NextResponse.json({ translatedText });
  } catch (err: any) {
    console.error('Translation API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}