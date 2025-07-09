import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// ✅ Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ✅ Fix: Prevent "Firebase App already exists" crash
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// POST: Save new history
export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { input, result } = await request.json();

    const docRef = await addDoc(collection(db, 'translations'), {
      userId,
      input,
      result,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('History POST error:', err);
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}

// GET: Fetch user history
export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const q = query(collection(db, 'translations'), where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ history });
  } catch (err) {
    console.error('History GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}