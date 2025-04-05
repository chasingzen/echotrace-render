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
      </html>
    `

    const blob = new Blob([html], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `EchoTrace_Report_${new Date().toISOString()}.pdf`
    link.click()
  }

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

      {/* Upload / Record Controls */}
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
          Start Recording
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
          <p className="text-xs text-gray-400 mb-4">
            Generated: {new Date().toLocaleString()} | Language: {result.language?.toUpperCase() || 'EN'}
          </p>

          <h3 className="text-cyan-400 font-bold text-lg mb-2">Transcript:</h3>
          <div className="text-sm text-gray-200 bg-black/30 rounded-md p-4 mb-6 whitespace-pre-wrap border border-cyan-700 max-w-full overflow-x-auto">
            {result.transcript}
          </div>

          <h3 className="text-purple-400 font-bold text-lg mb-2">AI Insight:</h3>
          <div className="text-sm text-gray-300 space-y-6 leading-relaxed max-w-full overflow-x-auto">
            {result.analysis
              .split(/(?=\*\*Transcript:|\*\*Clinical Insights:|\*\*Risk Flags:|\*\*Neurological & Psychological Flags:|\*\*Patient Summary:|\*\*References:)/g)
              .map((section, i) => {
                const title = section.match(/\*\*(.*?)\*\*/)?.[1] || 'Section'
                const content = section.replace(/\*\*(.*?)\*\*\s*/, '').trim()

                let titleColor = 'text-cyan-400'
                if (title.includes('Risk')) titleColor = 'text-yellow-400'
                else if (title.includes('Patient')) titleColor = 'text-green-400'
                else if (title.includes('Insights')) titleColor = 'text-purple-400'

                if (title.includes('References')) {
                  const lines = content.split('\n').filter(line => line.trim() !== '')
                  return (
                    <div key={i}>
                      <h4 className={\`font-semibold mb-2 text-lg \${titleColor}\`}>{title}</h4>
                      <div className="space-y-4 mt-2">
                        {lines.map((line, i) => {
                          const titleMatch = line.match(/^- (.+?): (.+)$/)
                          const urlMatch = line.match(/URL: (https?:\/\/[^\s]+)/)

                          if (titleMatch && urlMatch) {
                            return (
                              <div key={i} className="bg-gray-800 p-4 rounded border-l-4 border-blue-500 hover:shadow-lg transition">
                                <p className="text-sm font-semibold text-cyan-300">{titleMatch[1]}</p>
                                <p className="text-sm text-gray-300">{titleMatch[2]}</p>
                                <a href={urlMatch[1]} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline text-sm mt-1 inline-block">
                                  {urlMatch[1]}
                                </a>
                              </div>
                            )
                          }

                          return <p key={i} className="text-sm text-gray-300 pl-2">{line}</p>
                        })}
                      </div>
                    </div>
                  )
                }

                const lines = content.split('\n').map((line, j) => {
                  const isBullet = line.trim().startsWith('-')
                  return (
                    <p key={j} className="pl-2">
                      {isBullet ? `â¢ ${line.trim().slice(1).trim()}` : line}
                    </p>
                  )
                })

                return (
                  <div key={i}>
                    <h4 className={\`font-semibold mb-2 text-lg \${titleColor}\`}>{title}</h4>
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