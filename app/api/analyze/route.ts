export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio')

    if (!audioFile || typeof audioFile === 'string') {
      console.error('❌ No audio file or invalid type')
      return NextResponse.json({ error: 'Audio file missing or invalid' }, { status: 400 })
    }

    console.log('✅ Received audio file:', {
      name: (audioFile as File).name,
      type: (audioFile as File).type,
      size: (audioFile as File).size,
    })

    const blob = new Blob([await audioFile.arrayBuffer()], {
      type: (audioFile as File).type || 'audio/wav',
    })

    const fileForOpenAI = new File(
      [blob],
      (audioFile as File).name || 'recording.wav',
      {
        type: blob.type,
      }
    )

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    })

    console.log('⚙️ Sending to Whisper...')
    const transcription = await openai.audio.transcriptions.create({
      file: fileForOpenAI,
      model: 'whisper-1',
      response_format: 'json',
      language: 'en',
    })

    console.log('✅ Transcription complete')

    const prompt = `You are a cognitive speech analyst. Based on this transcript, assess the tone, emotional state, clarity, and any indicators of stress or confidence. Be concise and objective.\n\nTranscript:\n${transcription.text}`

    console.log('⚙️ Sending to GPT-4...')
    const analysis = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    console.log('✅ Analysis complete')

    return NextResponse.json({
      transcript: transcription.text,
      analysis: analysis.choices[0].message.content,
    })
  } catch (err: any) {
    console.error('🔥 API error:', err)
    return NextResponse.json({ error: 'Internal Server Error', detail: err?.message || err }, { status: 500 })
  }
}