export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })

    const data = await res.json()
    return NextResponse.json({ status: res.status, models: data })
  } catch (err: any) {
    return NextResponse.json({
      error: 'Connection to OpenAI failed',
      message: err.message,
    }, { status: 500 })
  }
}