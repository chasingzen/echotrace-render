export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: Request) {
  try {
    // Check if the key is being injected at runtime
    const apiKey = process.env.OPENAI_API_KEY
    console.log('🔐 RUNTIME API KEY:', apiKey ? 'Exists ✅' : 'Missing ❌')

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'OpenAI API key is missing at runtime. Check your Render env vars.',
        },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio')

    if (!audioFile || typeof audioFile === 'string') {
      console.error('❌ No audio file or invalid type received')
      return NextResponse.json({ error: 'Audio file missing or invalid' }, { status: 400 })
    }

    const fileMeta = audioFile as File
    console.log('📦 Received file:', {
      name: fileMeta.name,
      type: fileMeta.type,
      size: fileMeta.size,
    })

    const blob = new Blob([await audioFile.arrayBuffer()], {
      type: fileMeta.type || 'audio/wav',
    })

    const openai = new OpenAI({ apiKey })

    const whisperFile = new File([blob], fileMeta.name || 'recording.wav', {
      type: blob.type,
    })

    console.log('⚙️ Sending to Whisper...')
    const transcription = await openai.audio.transcriptions.create({
      file: whisperFile,
      model: 'whisper-1',
      response_format: 'json',
      language: 'en',
    })

    console.log('✅ Transcription complete:', transcription.text)

    const prompt = `You are a cognitive speech analyst. Based on this transcript, assess the tone, emotional state, clarity, and any indicators of stress or confidence. Be concise and objective.\n\nTranscript:\n${transcription.text}`

    console.log('⚙️ Sending to GPT-4...')
    const analysis = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    console.log('✅ GPT-4 analysis complete.')

    return NextResponse.json({
      transcript: transcription.text,
      analysis: analysis.choices[0].message.content,
    })
  } catch (err: any) {
    console.error('🔥 Server error:', err)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        detail: err?.message || err,
      },
      { status: 500 }
    )
  }
}