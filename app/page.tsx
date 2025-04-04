export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
      <h1 className="text-4xl md:text-6xl font-bold text-cyan-400 mb-6 animate-pulse">
        EchoTrace
      </h1>
      <p className="text-lg md:text-xl max-w-2xl text-gray-300">
        Decoding Speech. Empowering Insight.
      </p>
      <p className="mt-4 text-md text-gray-400 max-w-xl">
        EchoTrace analyzes speech with cognitive signal processing and scientific research-backed algorithms to surface emotional, mental, and behavioral patterns from voice input.
      </p>
      <div className="mt-10">
        <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-cyan-500 transition">
          Upload Audio
        </button>
      </div>
    </main>
  );
}
