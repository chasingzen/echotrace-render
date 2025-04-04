'use client'

import { useState, useRef } from 'react'

export default function AudioProcessor() {
  const [status, setStatus] = useState<string | null>(null)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setStatus('Uploading...')
    const formData = new FormData()
    formData.append('audio', file)

    await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    })

    setAudioURL(URL.createObjectURL(file))
    setStatus('File uploaded!')
  }

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    audioChunks.current = []

    mediaRecorder.ondataavailable = (e) => {
      audioChunks.current.push(e.data)
    }

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' })
      const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' })
      setAudioURL(URL.createObjectURL(audioFile))
      setStatus('Recording complete!')

      const formData = new FormData()
      formData.append('audio', audioFile)

      await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })
    }

    mediaRecorder.start()
    setStatus('Recording...')
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
  }

  return (
    <div className="text-center mt-12 space-y-4">
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
        id="upload-input"
      />
      <label
        htmlFor="upload-input"
        className="px-6 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer inline-block"
      >
        Upload Audio
      </label>

      <div>
        <button
          onClick={startRecording}
          className="px-6 py-3 rounded-2xl bg-purple-500/10 border border-purple-400 text-purple-300 hover:bg-purple-500/20 transition mr-2"
        >
          Record Live
        </button>
        <button
          onClick={stopRecording}
          className="px-6 py-3 rounded-2xl bg-red-500/10 border border-red-400 text-red-300 hover:bg-red-500/20 transition"
        >
          Stop
        </button>
      </div>

      {status && <p className="text-sm text-gray-400">{status}</p>}
      {audioURL && (
        <audio controls className="mx-auto mt-4">
          <source src={audioURL} />
        </audio>
      )}
    </div>
  )
}
