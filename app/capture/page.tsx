// app/capture/page.tsx

'use client'

import dynamic from 'next/dynamic'

// Dynamically import the VoiceCaptureModule to avoid server-side rendering
const VoiceCaptureModule = dynamic(() => import('@/components/VoiceCaptureModule'), { ssr: false })

export default function CapturePage() {
  return (
    <main className="min-h-screen bg-black text-white p-4">
      <VoiceCaptureModule />
    </main>
  )
}
