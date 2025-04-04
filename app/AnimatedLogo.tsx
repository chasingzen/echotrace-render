
'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function AnimatedLogo() {
  const [points, setPoints] = useState<string>('')
  const [volume, setVolume] = useState(0)
  const [listening, setListening] = useState(false)

  useEffect(() => {
    if (!listening) return

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
        setVolume(avg)

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
  }, [listening])

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
      <h2
        className={`text-4xl md:text-6xl font-extrabold tracking-wide neon-text ${
          listening ? 'text-cyan-300' : 'text-white'
        }`}
      >
        EchoTrace
      </h2>

      {!listening && (
        <button
          onClick={() => setListening(true)}
          className="mt-2 px-4 py-2 bg-cyan-600 rounded-full text-white text-sm hover:bg-cyan-500 transition"
        >
          Start Listening
        </button>
      )}
    </motion.div>
  )
}
