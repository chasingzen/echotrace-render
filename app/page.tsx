'use client'

import './globals.css'
import { motion } from 'framer-motion'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'
import { useCallback, useEffect, useState } from 'react'

export default function HomePage() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine)
  }, [])

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Particle Background */}
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

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 text-center py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="mb-8"
        >
          <AnimatedLogo />
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
          className="mt-8 flex flex-col sm:flex-row gap-4 mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.75 }}
        >
          <button className="px-6 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/20 transition">
            Upload Audio
          </button>
          <button className="px-6 py-3 rounded-2xl bg-purple-500/10 border border-purple-400 text-purple-300 hover:bg-purple-500/20 transition">
            Record Live
          </button>
        </motion.div>
      </section>

      {/* Mission Statement */}
      <section className="relative z-10 px-6 py-16 bg-gradient-to-b from-gray-950 to-gray-900 text-center">
        <h2 className="text-4xl font-bold text-cyan-400 mb-4">Our Mission</h2>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          EchoTrace aims to revolutionize communication by translating raw speech into actionable intelligence. Our AI-driven analysis helps users detect tone, stress, emotion, and clarity—empowering clearer, more informed communication.
        </p>
      </section>

     {/* Scientific Support Section */}
<section className="relative z-10 px-6 py-16 bg-gray-900 text-center">
  <h2 className="text-4xl font-bold text-purple-400 mb-4">Scientific Backing</h2>
  <div className="text-left max-w-4xl mx-auto space-y-6">
    {scientificSources.map((source, i) => (
      <motion.div
        key={i}
        className={`bg-gray-800 p-6 rounded-xl border-l-4 ${source.border} ${source.shadow} transition duration-500 transform hover:scale-105`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: i * 0.1 }}
      >
        <h3 className={`text-xl font-semibold ${source.text}`}>{source.title}</h3>
        <p className="text-gray-300 text-sm">
          {source.summary}
          <a href={source.link} className={`${source.text} underline ml-2`} target="_blank" rel="noreferrer">
            Read Study
          </a>
        </p>
      </motion.div>
    ))}
  </div>
</section>
      {/* Cognitive Signal Section */}
      <section className="relative z-10 px-6 py-20 bg-gradient-to-b from-gray-900 to-black">
        <h2 className="text-4xl font-bold text-green-400 text-center mb-10">Your Cognitive Signal At A Glance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {signalCards.map((card, i) => (
            <motion.div
              key={i}
              className={`bg-gray-800 rounded-2xl p-6 shadow-lg border ${card.border} ${card.shadow} transition duration-500 transform hover:scale-105`}
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
    </main>
  )
}

const scientificSources = [
  {
    title: 'Emotion Recognition in Voice: A Deep Learning Review',
    summary:
      'Journal of AI Research, 2023 — Proven models show how vocal biomarkers can indicate emotional states with over 85% accuracy using spectral features.',
    link: 'https://www.jair.org/index.php/jair/article/view/12980',
    border: 'border-cyan-500',
    text: 'text-cyan-300',
    shadow: 'hover:shadow-[0_0_25px_#22d3ee]',
  },
  {
    title: 'Stress Detection from Audio: Cortisol-Inspired AI Systems',
    summary:
      'Nature Digital Medicine, 2022 — Research supports the use of audio analysis for early signs of stress, anxiety, and fatigue.',
    link: 'https://www.nature.com/articles/s41746-022-00602-0',
    border: 'border-pink-500',
    text: 'text-pink-300',
    shadow: 'hover:shadow-[0_0_25px_#ec4899]',
  },
  {
    title: 'Vocal Biomarkers in Neurological and Psychiatric Diagnosis',
    summary:
      'Frontiers in Neuroscience, 2021 — Describes how AI-powered analysis of vocal patterns is emerging as a tool in neurological health.',
    link: 'https://www.frontiersin.org/articles/10.3389/fnins.2021.752512/full',
    border: 'border-purple-500',
    text: 'text-purple-300',
    shadow: 'hover:shadow-[0_0_25px_#a855f7]',
  },
  {
    title: 'Speech as a Biomarker in Mental Health Diagnostics',
    summary:
      'IEEE Transactions on Affective Computing, 2020 — Studies how stress, depression, and anxiety leave measurable acoustic fingerprints in speech.',
    link: 'https://ieeexplore.ieee.org/document/8930425',
    border: 'border-yellow-500',
    text: 'text-yellow-300',
    shadow: 'hover:shadow-[0_0_25px_#facc15]',
  },
]


const signalCards = [
  {
    title: 'Transcript',
    body: '"Today we\'re going to explore the impact of AI-driven speech diagnostics..."',
    border: 'border-green-500',
    text: 'text-green-300',
    shadow: 'hover:shadow-green-500/50',
  },
  {
    title: 'Emotional Analysis',
    body: 'Detected emotion: Confident | Stress Level: Low',
    border: 'border-pink-500',
    text: 'text-pink-300',
    shadow: 'hover:shadow-pink-500/50',
  },
  {
    title: 'Session Summary',
    body: 'Overall tone: Analytical | Key Phrases: "impact", "metrics", "feedback"',
    border: 'border-blue-500',
    text: 'text-blue-300',
    shadow: 'hover:shadow-blue-500/50',
  },
  {
    title: 'Log History',
    body: 'View your last 10 audio sessions and compare sentiment trends.',
    border: 'border-yellow-500',
    text: 'text-yellow-300',
    shadow: 'hover:shadow-yellow-500/50',
  },
]

function AnimatedLogo() {
  const [points, setPoints] = useState<string>('')

  useEffect(() => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)()
    let analyser: AnalyserNode
    let dataArray: Uint8Array
    let rafId: number

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const source = context.createMediaStreamSource(stream)
      analyser = context.createAnalyser()
      source.connect(analyser)
      analyser.fftSize = 64
      const bufferLength = analyser.frequencyBinCount
      dataArray = new Uint8Array(bufferLength)

      const animate = () => {
        analyser.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength

        const newPoints = Array.from({ length: 21 }, (_, i) => {
          const x = i * 10
          const y = 25 + Math.sin(i + avg * 0.05) * (avg / 10)
          return `${x},${y.toFixed(2)}`
        }).join(' ')

        setPoints(newPoints)
        rafId = requestAnimationFrame(animate)
      }

      animate()
    })

    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <motion.div
      className="text-center flex flex-col items-center relative"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      <svg
        className="w-40 h-10 md:w-56 md:h-12 mb-2"
        viewBox="0 0 200 50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ffff" />
            <stop offset="50%" stopColor="#00ff99" />
            <stop offset="100%" stopColor="#00ffff" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke="url(#waveGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h2 className="text-4xl md:text-6xl font-extrabold tracking-wide neon-text">
        EchoTrace
      </h2>
    </motion.div>
  )
}
