'use client'

import { motion } from 'framer-motion'
import AudioProcessor from './components/AudioProcessor'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'
import { useCallback } from 'react'

export default function HomePage() {
  const particlesInit = useCallback(async (engine: any) => {
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
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.75 }}
          className="text-4xl md:text-6xl font-extrabold tracking-wide neon-text"
        >
          EchoTrace
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.75 }}
          className="text-xl md:text-2xl text-cyan-400 mt-4"
        >
          Decoding Speech. Empowering Insight.
        </motion.h2>

        {/* Upload / Record Section */}
        <motion.div
          className="mt-10 w-full max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.75 }}
        >
          <AudioProcessor />
        </motion.div>
      </section>

      {/* Mission / Backing / Cognitive sections */}
      <section className="relative z-10 px-6 py-16 bg-gradient-to-b from-gray-950 to-gray-900 text-center">
        <h2 className="text-4xl font-bold text-cyan-400 mb-4">Our Mission</h2>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          EchoTrace aims to revolutionize communication by translating raw speech into actionable intelligence. Our AI-driven
