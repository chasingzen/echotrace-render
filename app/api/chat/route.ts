// /app/api/chat/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages,
    }),
  })

  const data = await response.json()
  return NextResponse.json(data)
}
