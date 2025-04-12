// SmartChatGPTInteraction.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function SmartChatGPTInteraction() {
  const [transcript, setTranscript] = useState<string | null>(null)
  const [chatLog, setChatLog] = useState<any[]>([{
    role: 'system',
    content: 'You are a helpful, kind, and thoughtful interviewer asking open-ended questions for a cognitive voice analysis.'
  }])
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const lastBlob = useRef<Blob | null>(null)

  useEffect(() => {
    if (chatLog.length === 1) {
      fetchInitialQuestion()
    }
  }, [])

  const fetchInitialQuestion = async () => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatLog }),
    })
    const data = await res.json()
    const reply = data.choices[0].message.content
    speakAndListen(reply)
    setChatLog(prev => [...prev, { role: 'assistant', content: reply }])
  }

  const speakAndListen = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => startListening()
    speechSynthesis.speak(utterance)
  }

  const startListening = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    mediaRecorderRef.current = recorder
    chunks.current = []

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.current.push(e.data)
    }

    recorder.onstop = () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' })
      lastBlob.current = blob
      uploadToWhisper(blob)
    }

    recorder.start()
    setRecording(true)

    setTimeout(() => {
      recorder.stop()
      setRecording(false)
    }, 6000)
  }

  const uploadToWhisper = async (blob: Blob) => {
    const file = new File([blob], 'audio.webm', { type: 'audio/webm' })
    const formData = new FormData()
    formData.append('file', file)
    formData.append('model', 'whisper-1')

    const res = await fetch('/api/whisper', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    setTranscript(data.text)
    sendToChatGPT(data.text)
  }

  const sendToChatGPT = async (userInput: string) => {
    const newChatLog = [...chatLog, { role: 'user', content: userInput }]
    setChatLog(newChatLog)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newChatLog }),
    })

    const data = await res.json()
    const reply = data.choices[0].message.content
    setChatLog(prev => [...prev, { role: 'assistant', content: reply }])
    speakAndListen(reply)
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-semibold text-white">Interactive AI Conversation</h2>
      {recording ? (
        <p className="text-green-400">Listening...</p>
      ) : (
        <p className="text-gray-400">Waiting for AI to speak...</p>
      )}
      {transcript && (
        <div>
          <p className="text-sm text-cyan-300">You said:</p>
          <p className="text-white italic">{transcript}</p>
        </div>
      )}
    </div>
  )
}
