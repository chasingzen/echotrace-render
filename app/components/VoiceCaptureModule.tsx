'use client'

import { useState } from 'react'

export default function VoiceCaptureModule() {
  const [step, setStep] = useState(1)

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 space-y-12">
      <h1 className="text-3xl font-bold text-center">EchoTrace Voice Analysis</h1>

      {step === 1 && (
        <div className="w-full max-w-2xl bg-gray-900 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-xl font-semibold">Step 1: Read Aloud Prompt</h2>
          <p className="text-lg italic">
            "When the sunlight hits the mountain at just the right angle, the shadows dance across the trees like a gentle breeze. The quick brown fox jumps over the lazy dog, while birds chirp softly in the distance. She sells seashells by the seashore, and Peter Piper picked a peck of pickled peppers."
          </p>
          <button
            onClick={() => setStep(2)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow"
          >
            Start Recording
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-2xl bg-gray-900 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-xl font-semibold">Step 2: Natural Conversation</h2>
          <p className="text-lg">
            {randomQuestion()}
          </p>
          <button
            onClick={() => alert('Recording started (placeholder)')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow"
          >
            Answer and Record
          </button>
        </div>
      )}
    </div>
  )
}

function randomQuestion() {
  const questions = [
    "Tell me about a recent memory that made you feel happy.",
    "If you could design the perfect day, what would it look like?",
    "How do you usually handle stress?",
    "Can you describe a time when you felt overwhelmed?",
    "What's a goal you're currently working toward?"
  ]
  return questions[Math.floor(Math.random() * questions.length)]
}
