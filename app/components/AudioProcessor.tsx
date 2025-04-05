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
    form.append('audio', file)

    setStatus('Analyzing...')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      console.log('API Response:', data)

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

    console.log('Selected file:', file)
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

  const downloadPDF = () => {
    const content = document.getElementById('analysis-report')
    if (!content) return

    const printWindow = window.open('', '', 'width=800,height=600')
    if (!printWindow) return

    printWindow.document.write('<html><head><title>EchoTrace Report</title></head><body>')
    printWindow.document.write(content.innerHTML)
    printWindow.document.write('</body></html>')
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <div className="text-center mt-12 space-y-6 max-w-3xl mx-auto">
      {/* Upload */}
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

      {/* Record Controls */}
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

      {/* Status */}
      {status && <p className="text-sm text-gray-400">{status}</p>}

      {/* Audio Preview */}
      {audioURL && (
        <audio controls className="mx-auto mt-4">
          <source src={audioURL} />
        </audio>
      )}

      {/* Analysis Result */}
      {result && (
        <div
          className="bg-gray-900 border border-cyan-600 p-6 rounded-xl mt-8 shadow-lg text-left"
          id="analysis-report"
        >
          <h3 className="text-cyan-400 font-bold text-lg mb-2">Transcript:</h3>
          <p className="text-gray-300 text-sm mb-4 whitespace-pre-wrap">{result.transcript}</p>

          <h3 className="text-purple-400 font-bold text-lg mb-2">AI Insight:</h3>
          <p className="text-gray-300 text-sm whitespace-pre-wrap">{result.analysis}</p>

          <div className="mt-6 flex justify-center gap-4 print:hidden">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            >
              Print
            </button>
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              Save as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}