import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: 'nova',
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI TTS error:', errorData);
      return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(Buffer.from(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="output.mp3"',
      },
    });
  } catch (err) {
    console.error('TTS route error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
