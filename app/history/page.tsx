import { auth } from "@clerk/nextjs";
import { getTranslationsForUser } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const { userId } = auth();

  if (!userId) {
    return <p className="p-4 text-red-500">You must be signed in to view your history.</p>;
  }

  const items = await getTranslationsForUser(userId);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Translation History</h1>

      {items.length === 0 ? (
        <p className="text-gray-600">No translations saved yet.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item: any, idx: number) => (
            <li key={idx} className="bg-white border p-4 rounded shadow">
              <p className="text-sm text-gray-500 mb-1">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </p>
              <p className="font-semibold">Input:</p>
              <p className="mb-2 whitespace-pre-wrap">{item.input}</p>
              <p className="font-semibold">Result:</p>
              <p className="whitespace-pre-wrap">{item.result}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}