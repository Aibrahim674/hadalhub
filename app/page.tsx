'use client';

import { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { SignedIn, SignedOut, SignOutButton, UserButton } from '@clerk/nextjs';
import { useUser } from "@clerk/nextjs";
import Link from 'next/link';

export default function Home() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<
  { input: string; result: string; direction: string; timestamp: string }[]
>([]);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [direction, setDirection] = useState<'auto' | 'so-en' | 'en-so'>('auto');
  const [micLabel, setMicLabel] = useState('🎙 Start Recording');
  const { user } = useUser();

  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (!listening && transcript) {
      setInput(transcript);
      if (autoTranslate) handleTranslate(transcript);
    }
    setMicLabel(listening ? '🛑 Stop Recording' : '🎙 Start Recording');
  }, [listening, transcript]);

  useEffect(() => {
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history');
    }
  };

  fetchHistory();
}, []);

const handleTranslate = async (text = input) => {
  if (!text.trim()) return;

  setLoading(true);
  setResult('');
  setError('');

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, direction }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Translation failed.');

    setResult(data.translatedText);

    // Save history if user is signed in
    await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: text,
        result: data.translatedText,
        direction,
      }),
    });

  } catch (err: any) {
    setError(err.message || 'Something went wrong');
  } finally {
    setLoading(false);
  }
};

  const handleMic = () => {
    resetTranscript();
    listening
      ? SpeechRecognition.stopListening()
      : SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError('');
    setResult('');
    const { data: { text } } = await Tesseract.recognize(file, 'eng');
    setInput(text);
    if (autoTranslate) await handleTranslate(text);
    setLoading(false);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "HadalHub Premium", amount: 499 }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error("Checkout failed.");
    } catch (err: any) {
      console.error("Payment error:", err);
      setError("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:px-2 bg-gray-100">
      <div className="w-full md:max-w-md lg:max-w-xl space-y-4">

        <div className="flex justify-between items-center mb-4">
          <SignedOut>
            <div className="space-x-4">
              <Link href="/auth/sign-in" className="text-blue-600 hover:underline">Sign In</Link>
              <Link href="/auth/sign-up" className="text-blue-600 hover:underline">Sign Up</Link>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center space-x-4">
              <UserButton afterSignOutUrl="/" />
              <SignOutButton>
                <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Sign Out</button>
              </SignOutButton>
            </div>
          </SignedIn>
        </div>
{user && (
  <div className="p-4 bg-blue-100 text-blue-900 rounded shadow text-sm mb-2">
    <p>👋 Welcome {user.firstName || "back"}! Ready to translate?</p>
    <p className="mt-1">
      Want faster results + history storage?{" "}
      <button
        onClick={handlePayment}
        className="underline text-blue-600 hover:text-blue-800"
      >
        Upgrade to Premium
      </button>
    </p>
  </div>
)}

        <h1 className="text-3xl font-bold text-center">HadalHub Translator</h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full border border-gray-300 p-2 rounded"
        />

        <label className="block">
          <input
            type="checkbox"
            checked={autoTranslate}
            onChange={() => setAutoTranslate(!autoTranslate)}
            className="mr-2"
          />
          Auto-Translate
        </label>

        <div>
          <label htmlFor="direction" className="block font-medium">Translation Mode</label>
          <select
            id="direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value as 'auto' | 'so-en' | 'en-so')}
            className="w-full border border-gray-300 rounded p-2"
          >
            <option value="auto">Auto Detect</option>
            <option value="so-en">Somali ➔ English</option>
            <option value="en-so">English ➔ Somali</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleMic}
            className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700"
          >
            {micLabel}
          </button>
          <span>{listening ? 'Listening...' : ''}</span>
        </div>

        <textarea
          value={listening ? transcript : input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter Somali or English..."
          className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={5}
        />

        <button
          onClick={() => handleTranslate()}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Translate'}
        </button>

        <button
          onClick={handlePayment}
          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
          disabled={loading}
        >
          💳 Buy Premium Access ($4.99)
        </button>

        {result && (
          <div className="mt-4 p-4 bg-white border rounded shadow space-y-2">
          {history.length > 0 && (
  <div className="mt-8">
    <h2 className="text-xl font-semibold mb-2">Your Translation History</h2>
    <div className="space-y-3">
      {history.map((entry, idx) => (
        <div
          key={idx}
          className="p-3 border bg-white rounded shadow-sm text-sm"
        >
          <div className="font-semibold mb-1">
            {entry.direction === 'so-en'
              ? 'Somali ➔ English'
              : entry.direction === 'en-so'
              ? 'English ➔ Somali'
              : 'Auto Detected'}
          </div>
          <div className="text-gray-700">
            <strong>Input:</strong> {entry.input}
          </div>
          <div className="text-gray-800 mt-1">
            <strong>Result:</strong> {entry.result}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {new Date(entry.timestamp).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
            <h2 className="font-semibold mb-2">Translation:</h2>
            <p className="whitespace-pre-wrap">{result}</p>
            <div className="flex gap-4">
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              >
                📋 Copy
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([result], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'translation.txt';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              >
                ⬇️ Download
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error}
          </div>
        )}
      </div>
    </main>
  );
}