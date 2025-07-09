export default function CancelPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-red-50">
      <div className="bg-white border border-red-300 p-8 rounded-lg shadow text-center space-y-4">
        <h1 className="text-3xl font-bold text-red-700">❌ Payment Cancelled</h1>
        <p className="text-lg">Looks like you didn’t finish the checkout.</p>
        <a
          href="/"
          className="inline-block mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Back to Home
        </a>
      </div>
    </main>
  );
}