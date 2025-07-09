import { NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';

export async function POST(req: Request) {
  const data = await req.formData();
  const file = data.get('image') as File;

  if (!file) return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await Tesseract.recognize(buffer, 'eng'); // Change to 'eng+som' when somali traineddata is added
    return NextResponse.json({ text: result.data.text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'OCR failed' }, { status: 500 });
  }
}
