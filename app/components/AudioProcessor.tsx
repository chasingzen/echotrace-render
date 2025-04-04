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
      body: formData
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
    <div className="text-center space-y-4">
      <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" id="upload-input" />
      <label htmlFor="upload-input" className="px-4 py-2 bg-cyan-600 text-white rounded cursor-pointer">Upload Audio</label>
      <div>
        <button onClick={startRecording} className="px-4 py-2 bg-purple-600 text-white rounded mr-2">Record</button>
        <button onClick={stopRecording} className="px-4 py-2 bg-red-600 text-white rounded">Stop</button>
      </div>
      {status && <p>{status}</p>}
      {audioURL && <audio controls src={audioURL} className="mx-auto" />}
    </div>
  )
}
