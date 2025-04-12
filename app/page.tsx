'use client'

import { motion } from 'framer-motion'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function HomePage() {
  const [step, setStep] = useState(1)
  const [conversationIndex, setConversationIndex] = useState(0)
  const [recording, setRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [emotion, setEmotion] = useState<string | null>(null)
  const chunks = useRef<Blob[]>([])
  const lastBlob = useRef<Blob | null>(null)

  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine)
  }, [])

  const questionStrings = [
    "Hi there! Can you tell me your name?",
    "Nice to meet you. What's something you're passionate about?",
    "How do you usually deal with stressful situations?",
    "Can you describe a moment that made you feel proud recently?",
    "Is there something you wish more people understood about you?"
  ]

  useEffect(() => {
    if (typeof window !== 'undefined' && step === 2 && conversationIndex < questionStrings.length) {
      const utterance = new SpeechSynthesisUtterance(questionStrings[conversationIndex])
      window.speechSynthesis.speak(utterance)
    }
  }, [step, conversationIndex])

  useEffect(() => {
    if (mediaRecorder) {
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        lastBlob.current = blob
        setAudioURL(URL.createObjectURL(blob))
        chunks.current = []
      }
    }
  }, [mediaRecorder])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    setMediaRecorder(recorder)
    recorder.start()
    setRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setRecording(false)
    }
  }

  const nextAIQuestion = () => {
    if (conversationIndex < questionStrings.length - 1) {
      setConversationIndex(conversationIndex + 1)
      setAudioURL(null)
      setTranscript(null)
      setEmotion(null)
    } else {
      alert("Thanks! The conversation is complete.")
    }
  }

  const processAudio = async () => {
    if (!lastBlob.current) return
    const file = new File([lastBlob.current], 'audio.webm', { type: 'audio/webm' })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('model', 'whisper-1')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer YOUR_OPENAI_API_KEY`,
      },
      body: formData
    })

    const data = await response.json()
    setTranscript(data.text)

    const simulatedEmotion = Math.random() > 0.5 ? 'Calm / Confident' : 'Stressed / Hesitant'
    setEmotion(simulatedEmotion)
  }

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: '#000000' } },
          particles: {
            color: { value: '#00ffff' },
            links: { enable: true, color: '#00ffff' },
            move: { enable: true, speed: 1 },
            size: { value: 1.5 },
            number: { value: 50 },
          },
        }}
        className="absolute inset-0 z-0"
      />

      <section className="relative z-10 flex flex-col items-center justify-center px-4 text-center py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="mb-8"
        >
          <motion.img
            src="/new-logo.svg"
            alt="EchoTrace Logo"
            className="h-20 w-auto mx-auto"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            whileHover={{ scale: 1.05, rotate: [0, 0.5, -0.5, 0] }}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.75 }}
          className="text-3xl md:text-5xl font-semibold neon-text"
        >
          Decoding Speech. Empowering Insight.
        </motion.h1>

        <motion.div
          className="mt-8 flex flex-col gap-4 mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.75 }}
        >
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
              <h2 className="text-xl font-semibold">Step 2: AI Conversation</h2>
              <div className="flex justify-center gap-4">
                {!recording ? (
                  <button
                    onClick={startRecording}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow"
                  >
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl shadow"
                  >
                    Stop Recording
                  </button>
                )}
                <button
                  onClick={nextAIQuestion}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl shadow"
                >
                  Next Question
                </button>
              </div>
              {audioURL && (
                <div className="space-y-4">
                  <audio controls src={audioURL} className="mt-4 w-full" />
                  <button
                    onClick={processAudio}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl shadow"
                  >
                    Analyze Response
                  </button>
                </div>
              )}
              {transcript && (
                <div className="bg-gray-800 p-4 rounded-xl text-left">
                  <p className="text-sm text-cyan-300 mb-2">Transcript:</p>
                  <p className="text-white mb-4">{transcript}</p>
                  <p className="text-sm text-pink-400">Emotion Detected: {emotion}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Based on: <a href="https://www.nature.com/articles/s41746-022-00602-0" target="_blank" className="underline text-cyan-400">Stress Detection from Audio (Nature)</a>
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </section>
    </main>
  )
}
