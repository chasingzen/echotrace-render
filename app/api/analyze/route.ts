export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import fetch from 'node-fetch'
import FormData from 'form-data'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    console.log('🔐 RUNTIME API KEY:', apiKey ? 'Exists ✅' : 'Missing ❌')

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OpenAI API Key' }, { status: 500 })
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio') as unknown as File

    if (!audioFile || typeof audioFile === 'string') {
      return NextResponse.json({ error: 'Invalid or missing audio file' }, { status: 400 })
    }

    console.log('📦 Received file:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
    })

    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const form = new FormData()
    form.append('file', buffer, {
      filename: audioFile.name,
      contentType: audioFile.type || 'audio/wav',
    })
    form.append('model', 'whisper-1')
    form.append('language', 'en')
    form.append('response_format', 'json')

    console.log('⚙️ Sending to Whisper using node-fetch...')
    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...form.getHeaders(),
      },
      body: form as any,
    })

    const whisperData = await whisperRes.json() as { text: string }

    if (!whisperRes.ok) {
      console.error('❌ Whisper error:', whisperData)
      return NextResponse.json({ error: 'Whisper API failed', detail: whisperData }, { status: 500 })
    }

    console.log('✅ Transcription:', whisperData.text)

    const openai = new OpenAI({ apiKey })

    const prompt = `
You are an advanced cognitive speech analysis AI with expertise in neurolinguistics, psychiatry, and affective computing.

Given the following transcript, produce a structured report with:

1. **Transcript** (cleaned-up if needed)
2. **Clinical Insights**: Tone, emotion, fluency, and any signs of:
   - Mental health indicators (e.g., depression, anxiety, ADHD)
   - Neurological speech disorders (e.g., apraxia, Tourette’s, Parkinsonian markers)
3. **Risk Flags**: Flag each potential condition as Low, Moderate, or High Risk (with reasoning).
4. **Patient-Friendly Summary**: Rewrite results in clear, supportive language suitable for non-clinical users.
5. **References**: Link to any supporting scientific research or papers.

Use medically appropriate tone, never diagnose. Only highlight patterns that warrant attention.

Transcript:
${whisperData.text}
`

    const analysis = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    })

    return NextResponse.json({
      transcript: whisperData.text,
      analysis: analysis.choices[0].message.content,
    })
  } catch (err: any) {
    console.error('🔥 Final route error:', err)
    return NextResponse.json({ error: 'Server error', detail: err?.message || err }, { status: 500 })
  }
}