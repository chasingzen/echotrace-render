'use client'

import './globals.css'
import AudioProcessor from './components/AudioProcessor'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">EchoTrace Upload/Record Test</h1>
      <AudioProcessor />
    </main>
  )
}
