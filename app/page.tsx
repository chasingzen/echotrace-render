
'use client'

import { motion } from 'framer-motion'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'
import { useCallback } from 'react'
import AnimatedLogo from './AnimatedLogo'

export default function HomePage() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine)
  }, [])

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
    </main>
  )
}
