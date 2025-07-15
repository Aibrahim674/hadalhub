import { OpenAI } from "openai";
import { currentUser } from "@clerk/nextjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    const body = await request.json();
    const input = body.text;
    const direction = body.direction || "auto";

    if (!input || typeof input !== "string") {
      return new Response(JSON.stringify({ error: "No input provided." }), { status: 400 });
    }

    // Build system prompt based on direction
    const systemPrompt = {
      "so-en": "You are a Somali-English translator. Translate Somali input into fluent, grammatically correct English. Only reply with the translated sentence.",
      "en-so": "You are a Somali-English translator. Translate English input into accurate, culturally appropriate Somali. Only reply with the translated sentence.",
      "auto": "You are a Somali-English translator. Detect the input language and translate accordingly between Somali and English. Ensure correct grammar and context. Only reply with the translated sentence.",
    }[direction];

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input },
      ],
      temperature: 0.4,
    });

    const translatedText = completion.choices[0].message.content;

    return new Response(JSON.stringify({ translatedText }), {
      status: 200,
    });
  } catch (err: any) {
    console.error("Translation API error:", err);
    return new Response(JSON.stringify({ error: "Translation failed." }), {
      status: 500,
    });
  }
}