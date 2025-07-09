export default function SuccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-green-50">
      <div className="bg-white border border-green-300 p-8 rounded-lg shadow text-center space-y-4">
        <h1 className="text-3xl font-bold text-green-700">✅ Payment Successful!</h1>
        <p className="text-lg">Thank you for upgrading to HadalHub Premium.</p>
        <a
          href="/"
          className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Go Back Home
        </a>
      </div>
    </main>
  );
}