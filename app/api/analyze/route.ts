export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import fetch from 'node-fetch'
import FormData from 'form-data'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OpenAI API Key' }, { status: 500 })
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio') as unknown as File

    if (!audioFile || typeof audioFile === 'string') {
      return NextResponse.json({ error: 'Invalid or missing audio file' }, { status: 400 })
    }

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
      return NextResponse.json({ error: 'Whisper API failed', detail: whisperData }, { status: 500 })
    }

    const openai = new OpenAI({ apiKey })

    const prompt = `
You are an advanced cognitive speech analysis AI with expertise in neurolinguistics, psychiatry, and affective computing.

Given the following transcript, analyze and return the results in the following structured format (use **headings** and **bulleted lists** where helpful):

---

**Transcript:**
[Short cleaned transcript]

**Clinical Insights:**
- Emotional tone
- Fluency, clarity
- Vocal features (speed, pauses, pitch, irregularities)

**Risk Flags:**
- Condition: [Risk Level — Low / Moderate / High]
  - Reasoning: [why it was flagged]
- (e.g., Depression, Apraxia, Tourette’s, ADHD)

**Patient Summary:**
Summarize the findings in clear, supportive, non-clinical language suitable for general users. Use 2–3 sentences.

**References:**
- Title (Journal, Year): [URL]
- Use 1–3 supporting research links if available

---

Only include conditions or flags if they are truly detectable via voice. Do not diagnose. Return results using the format above.

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
    return NextResponse.json({ error: 'Server error', detail: err?.message || err }, { status: 500 })
  }
}