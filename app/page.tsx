'use client'
import ChatGPTVoiceSession from './components/ChatGPTVoiceSession'

...

{step === 2 && (
  <ChatGPTVoiceSession />
)}
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
            <div className="w-full max-w-2xl">
              <SmartChatGPTInteraction />
  </div>
)}
        </motion.div>
      </section>
      <section className="relative z-10 px-6 py-16 bg-gradient-to-b from-gray-950 to-gray-900 text-center">
  <h2 className="text-4xl font-bold text-cyan-400 mb-4">Scientific Backing</h2>
  <div className="text-left max-w-4xl mx-auto space-y-6">
    {[
      {
        title: 'Emotion Recognition in Voice: A Deep Learning Review',
        summary: 'Journal of AI Research, 2023 — Proven models show how vocal biomarkers can indicate emotional states with over 85% accuracy using spectral features.',
        link: 'https://www.jair.org/index.php/jair/article/view/12980',
        border: 'border-cyan-500',
        glow: 'cyan-500',
        text: 'text-cyan-300',
      },
      {
        title: 'Stress Detection from Audio: Cortisol-Inspired AI Systems',
        summary: 'Nature Digital Medicine, 2022 — Research supports the use of audio analysis for early signs of stress, anxiety, and fatigue.',
        link: 'https://www.nature.com/articles/s41746-022-00602-0',
        border: 'border-pink-500',
        glow: 'pink-500',
        text: 'text-pink-300',
      },
      {
        title: 'Vocal Biomarkers in Neurological and Psychiatric Diagnosis',
        summary: 'Frontiers in Neuroscience, 2021 — Describes how AI-powered analysis of vocal patterns is emerging as a tool in neurological health.',
        link: 'https://www.frontiersin.org/articles/10.3389/fnins.2021.752512/full',
        border: 'border-purple-500',
        glow: 'purple-500',
        text: 'text-purple-300',
      },
      {
        title: 'Speech as a Biomarker in Mental Health Diagnostics',
        summary: 'IEEE Transactions on Affective Computing, 2020 — Studies how stress, depression, and anxiety leave measurable acoustic fingerprints in speech.',
        link: 'https://ieeexplore.ieee.org/document/8930425',
        border: 'border-yellow-500',
        glow: 'yellow-500',
        text: 'text-yellow-300',
      },
    ].map((source, i) => (
      <motion.div
        key={i}
        className={`bg-gray-800 p-6 rounded-xl border-l-4 ${source.border} transition duration-500 transform hover:scale-105 hover:shadow-xl hover:shadow-${source.glow}/50`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: i * 0.1 }}
      >
        <h3 className={`text-xl font-semibold ${source.text}`}>{source.title}</h3>
        <p className="text-gray-300 text-sm">
          {source.summary}
          <a href={source.link} className={`${source.text} underline ml-2`} target="_blank" rel="noreferrer">Read Study</a>
        </p>
      </motion.div>
    ))}
  </div>
        <section className="relative z-10 px-6 py-20 bg-gradient-to-b from-gray-900 to-black">
  <h2 className="text-4xl font-bold text-green-400 text-center mb-10">Your Cognitive Signal At A Glance</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
    {[
      {
        title: 'Transcript',
        body: "Today we're going to explore the impact of AI-driven speech diagnostics...",
        border: 'border-green-500',
        glow: 'green-500',
        text: 'text-green-300',
      },
      {
        title: 'Emotional Analysis',
        body: 'Detected emotion: Confident | Stress Level: Low',
        border: 'border-pink-500',
        glow: 'pink-500',
        text: 'text-pink-300',
      },
      {
        title: 'Session Summary',
        body: 'Overall tone: Analytical | Key Phrases: "impact", "metrics", "feedback"',
        border: 'border-blue-500',
        glow: 'blue-500',
        text: 'text-blue-300',
      },
      {
        title: 'Log History',
        body: 'View your last 10 audio sessions and compare sentiment trends.',
        border: 'border-yellow-500',
        glow: 'yellow-500',
        text: 'text-yellow-300',
      },
    ].map((card, i) => (
      <motion.div
        key={i}
        className={`bg-gray-800 rounded-2xl p-6 shadow-lg border ${card.border} transition duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-${card.glow}/50`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: i * 0.1 }}
      >
        <h3 className={`text-lg font-semibold ${card.text} mb-2`}>{card.title}</h3>
        <p className="text-sm text-gray-300">{card.body}</p>
      </motion.div>
    ))}
  </div>
</section>

</section>

    </main>
  )
}
