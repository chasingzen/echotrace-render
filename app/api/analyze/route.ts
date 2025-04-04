import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio')

    if (!audioFile || typeof audioFile === 'string') {
      return NextResponse.json({ error: 'Audio file missing or invalid' }, { status: 400 })
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer())
    const transcription = await openai.audio.transcriptions.create({
      file: buffer,
      model: 'whisper-1',
      response_format: 'json',
      language: 'en',
    })

    const prompt = `You are a cognitive speech analyst. Based on this transcript, assess the tone, emotional state, clarity, and any indicators of stress or confidence. Be concise and objective.\n\nTranscript:\n${transcription.text}`

    const analysis = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    return NextResponse.json({
      transcript: transcription.text,
      analysis: analysis.choices[0].message.content,
    })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
