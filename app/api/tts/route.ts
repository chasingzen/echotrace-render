// /app/api/tts/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { input, voice = 'nova' } = await req.json()

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tts-1-hd',
      input,
      voice
    })
  })

  const arrayBuffer = await response.arrayBuffer()
  return new Response(arrayBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg'
    }
  })
}
