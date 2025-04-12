'use client'

import { useEffect, useRef, useState } from 'react'

export default function ChatGPTVoiceSession() {
  const [chatLog, setChatLog] = useState([
    {
      role: 'system',
      content:
        'You are a helpful, kind, and curious AI that is having a voice-based conversation to assess emotional clarity and mental focus. Speak in natural, thoughtful questions. Keep replies short and pause for human response.',
    },
  ])
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [sessionStarted, setSessionStarted] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const lastBlob = useRef<Blob | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (sessionStarted && chatLog.length === 1) {
      getNextChatGPTReply()
    }
  }, [sessionStarted])

  const getNextChatGPTReply = async () => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatLog }),
    })
    const data = await res.json()
    const reply = data.choices[0].message.content
    setChatLog((prev) => [...prev, { role: 'assistant', content: reply }])
    speakWithTTS(reply)
  }

  const speakWithTTS = async (text: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }

    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: text, voice: 'nova' }),
    })

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    setAudioURL(url)

    const audio = new Audio(url)
    audioRef.current = audio

    audio.onended = () => {
      console.log('AI finished speaking, starting mic...')
      startRecording()
    }

    try {
      await audio.play()
    } catch (err) {
      console.error('Audio playback failed:', err)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunks.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        lastBlob.current = blob
        transcribeAndContinue(blob)
      }

      recorder.start()
      setTimeout(() => recorder.stop(), 6000)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const transcribeAndContinue = async (blob: Blob) => {
    const file = new File([blob], 'audio.webm', { type: 'audio/webm' })
    const formData = new FormData()
    formData.append('file', file)
    formData.append('model', 'whisper-1')

    const res = await fetch('/api/whisper', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    const userReply = data.text.trim()
    console.log('User said:', userReply)

    if (!userReply) {
      console.warn('Empty transcription, retrying...')
      getNextChatGPTReply()
      return
    }

    setChatLog((prev) => [...prev, { role: 'user', content: userReply }])
    getNextChatGPTReply()
  }

  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl space-y-4">
      <h2 className="text-xl font-semibold">Voice Conversation with ChatGPT</h2>
      {!sessionStarted ? (
        <button
          onClick={() => setSessionStarted(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow"
        >
          Start Voice Session
        </button>
      ) : (
        <>
          <p className="text-sm text-gray-400">
            ChatGPT is leading this conversation out loud. When it finishes speaking, your mic will activate.
          </p>
          {audioURL && (
            <audio ref={audioRef} src={audioURL} controls autoPlay className="mt-2 w-full" />
          )}
        </>
      )}
    </div>
  )
}
