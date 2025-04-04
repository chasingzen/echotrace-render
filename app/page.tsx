'use client';
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
      <motion.h1
        className="text-5xl md:text-7xl font-bold text-cyan-400 mb-6"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        EchoTrace
      </motion.h1>
      <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
        Decoding Speech. Empowering Insight.
      </h2>
      <p className="text-md text-gray-300 max-w-2xl">
        EchoTrace analyzes speech using cognitive signal processing and research-backed algorithms
        to extract emotional, mental, and behavioral insights from spoken input. Designed for high-impact
        feedback in therapy, education, and professional performance.
      </p>

      <section className="mt-10 max-w-3xl space-y-4 text-gray-400">
        <h3 className="text-lg text-cyan-300 font-semibold">Cognitive Signal Technology</h3>
        <p>
          Leveraging linguistic markers, vocal tone, and speech rhythm, EchoTrace maps human communication
          into measurable cognitive patterns.
        </p>

        <h3 className="text-lg text-cyan-300 font-semibold">Backed by Science</h3>
        <p>
          Our models are rooted in validated research from neuroscience and behavioral psychology, ensuring
          both precision and reliability in emotional signal detection.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-4">
        <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-cyan-400 transition">
          Upload Audio
        </button>
        <button className="bg-cyan-700 hover:bg-cyan-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-cyan-500 transition">
          Record Live
        </button>
      </div>
    </main>
  );
}
