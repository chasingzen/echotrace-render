'use client'

import { useRef, useState } from 'react'

export default function AudioProcessor() {
  const [status, setStatus] = useState<string | null>(null)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [result, setResult] = useState<{ transcript: string; analysis: string } | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  const sendToAPI = async (file: File) => {
    const formData = new FormData()
    formData.append('audio', file)

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
      </html>
    `

    const blob = new Blob([html], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `EchoTrace_Report_${new Date().toISOString()}.pdf`
    link.click()
  }

  return (
    <div className="text-center mt-12 space-y-6 max-w-3xl mx-auto">
      <input
        type="file"
        accept=".mp3, .wav, .m4a, .ogg, .webm, audio/*"
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

      {result && (
        <div className="bg-gray-900 border border-cyan-600 p-6 rounded-xl mt-8 shadow-lg text-left" id="analysis-report">
          <p className="text-xs text-gray-400 mb-4">Generated: {new Date().toLocaleString()}</p>

          <h3 className="text-cyan-400 font-bold text-lg mb-2">Transcript:</h3>
          <pre className="text-sm bg-black/30 text-gray-200 rounded-md p-4 overflow-auto font-mono mb-6 whitespace-pre-wrap border border-cyan-700">
            {result.transcript}
          </pre>

          <h3 className="text-purple-400 font-bold text-lg mb-2">AI Insight:</h3>
          <div className="text-sm text-gray-300 space-y-6 whitespace-pre-wrap leading-relaxed">
            {result.analysis
              .split(/(?=\*\*Transcript:|\*\*Clinical Insights:|\*\*Risk Flags:|\*\*Patient Summary:|\*\*References:)/g)
              .map((section, i) => {
                const title = section.match(/\*\*(.*?)\*\*/)?.[1] || 'Section'
                const content = section.replace(/\*\*(.*?)\*\*\s*/, '').trim()

                let titleColor = 'text-cyan-400'
                if (title.includes('Risk')) titleColor = 'text-yellow-400'
                else if (title.includes('Patient')) titleColor = 'text-green-400'
                else if (title.includes('Insights')) titleColor = 'text-purple-400'

                const lines = content.split('\n').map((line, j) => {
                  const isBullet = line.trim().startsWith('-')
                  const hasUrl = line.includes('http')
                  let formatted = line

                  if (hasUrl) {
                    const urlMatch = line.match(/https?:\/\/[^\s]+/)
                    if (urlMatch) {
                      const url = urlMatch[0]
                      formatted = line.replace(
                        url,
                        `<a href="${url}" target="_blank" class="text-blue-400 underline hover:text-blue-200">${url}</a>`
                      )
                    }
                  }

                  return (
                    <p key={j} className="pl-2" dangerouslySetInnerHTML={{ __html: isBullet ? `• ${formatted.trim().slice(1).trim()}` : formatted }} />
                  )
                })

                return (
                  <div key={i}>
                    <h4 className={`font-semibold mb-2 text-lg ${titleColor}`}>{title}</h4>
                    <div className="space-y-1">{lines}</div>
                  </div>
                )
              })}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-4 print:hidden">
            <button onClick={() => window.print()} className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">Print</button>
            <button onClick={downloadCustomPDF} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">Download .pdf</button>
            <button onClick={downloadText} className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition">Download .txt</button>
          </div>
        </div>
      )}
    </div>
  )
}