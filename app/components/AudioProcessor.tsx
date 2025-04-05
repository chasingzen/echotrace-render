'use client'

import { useRef, useState } from 'react'

export default function AudioProcessor() {
  const [status, setStatus] = useState<string | null>(null)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [result, setResult] = useState<{ transcript: string; analysis: string; language?: string } | null>(null)
  const [language, setLanguage] = useState('en')
  const [medicalMode, setMedicalMode] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  const sendToAPI = async (file: File) => {
    const formData = new FormData()
    formData.append('audio', file)
    formData.append('language', language)
    formData.append('medicalMode', medicalMode.toString())

    setStatus('Analyzing...')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        setStatus('Done!')
      } else {
        setStatus('Error analyzing audio.')
        console.error('API error response:', data)
      }
    } catch (err) {
      console.error('API fetch error:', err)
      setStatus('Error contacting server.')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAudioURL(URL.createObjectURL(file))
    setStatus('Uploading...')
    await sendToAPI(file)
  }

  const startRecording = async () => {
    try {
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
        await sendToAPI(audioFile)
      }

      mediaRecorder.start()
      setStatus('Recording...')
    } catch (err) {
      console.error('Microphone access error:', err)
      setStatus('Microphone access denied.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
  }

  const downloadText = () => {
    const content = document.getElementById('analysis-report')
    if (!content) return
    const text = content.innerText
    const blob = new Blob([text], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `EchoTrace_Report_${new Date().toISOString()}.txt`
    link.click()
  }

  const downloadCustomPDF = () => {
    const content = document.getElementById('analysis-report')
    if (!content) return
    const timestamp = new Date().toLocaleString()
    const logo = `<h1 style="color:#00ffff; font-family:sans-serif;">EchoTrace</h1>`
    const html = `
      <html>
        <head>
          <title>EchoTrace Report</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; color: #333; }
            h1 { margin-bottom: 0; }
            .timestamp { font-size: 0.9rem; color: #666; margin-bottom: 1rem; }
            a { color: #1e90ff; text-decoration: underline; }
          </style>
        </head>
        <body>
          ${logo}
          <div class="timestamp">Generated: ${timestamp}</div>
          ${content.innerHTML}
        </body>
      </html>`
    const blob = new Blob([html], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `EchoTrace_Report_${new Date().toISOString()}.pdf`
    link.click()
  }

  return (
    <div className="text-center mt-12 space-y-6 max-w-3xl mx-auto px-4">
      {/* Language Selector */}
      <div className="mb-4">
        <label htmlFor="language" className="mr-2 text-gray-300">Language:</label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="zh">Chinese</option>
          <option value="ar">Arabic</option>
          <option value="hi">Hindi</option>
          <option value="pt">Portuguese</option>
        </select>
      </div>

      {/* Medical Mode Toggle */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
        <label htmlFor="medical-mode" className="cursor-pointer">Enable Medical Mode</label>
        <input
          id="medical-mode"
          type="checkbox"
          checked={medicalMode}
          onChange={() => setMedicalMode(!medicalMode)}
          className="w-4 h-4"
        />
      </div>

      {/* Upload and Record */}
      <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" id="upload-input" />
      <label htmlFor="upload-input" className="cursor-pointer bg-cyan-700 text-white px-4 py-2 rounded-xl hover:bg-cyan-600">
        Upload Audio
      </label>
      <div>
        <button onClick={startRecording} className="bg-purple-700 text-white px-4 py-2 rounded-xl mr-2 hover:bg-purple-600">Start Recording</button>
        <button onClick={stopRecording} className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-500">Stop</button>
      </div>

      {status && <p className="text-gray-400 text-sm">{status}</p>}
      {audioURL && <audio controls className="mx-auto mt-4"><source src={audioURL} /></audio>}
      {result && (
        <div id="analysis-report" className="mt-6 text-left bg-gray-900 border border-cyan-600 p-6 rounded-xl shadow-md max-w-full overflow-x-auto">
          <p className="text-xs text-gray-400 mb-4">Generated: {new Date().toLocaleString()}</p>
          <h3 className="text-cyan-400 font-bold text-lg mb-2">Transcript:</h3>
          <div className="w-full md:max-w-2xl mx-auto bg-black/30 text-gray-200 text-sm md:text-base p-4 rounded mb-6 border border-cyan-700 whitespace-pre-wrap overflow-x-auto space-y-2">{result.transcript}</div>
          <h3 className="text-purple-400 font-bold text-lg mb-2">AI Insight:</h3>
          <div className="w-full md:max-w-2xl mx-auto bg-gray-800 text-gray-200 text-sm md:text-base p-4 rounded whitespace-pre-wrap overflow-x-auto space-y-4 leading-relaxed">{result.analysis}</div>
          <div className="mt-6 flex flex-wrap justify-center gap-4 print:hidden">
            <button onClick={() => window.print()} className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">Print</button>
            <button onClick={downloadCustomPDF} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">Download PDF</button>
            <button onClick={downloadText} className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700">Download TXT</button>
          </div>
        </div>
      )}
    </div>
  )
}
