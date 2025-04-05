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

    const prompt = `You are an advanced cognitive speech analysis AI trained in linguistics, clinical psychology, and neurology. Based on the following transcript, analyze:

- Emotional state (confidence, anxiety, etc.)
- Tone, clarity, and speech fluency
- Potential indicators of mental health conditions (e.g., depression, anxiety, ADHD)
- Signs of neurological or speech disorders (e.g., Tourette syndrome, apraxia, Parkinsonian speech, stuttering)

Use medically appropriate language, avoid diagnosis, but highlight noteworthy patterns clearly and what medical condition if any potentially could be heard.

Transcript:
${whisperData.text}`

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