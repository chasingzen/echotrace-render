import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI()

export async function POST(req: Request) {
  const formData = await req.formData()
  const audioFile = formData.get('audio') as File
  const language = formData.get('language') || 'en'
  const isMedical = formData.get('medicalMode') === 'true'

  if (!audioFile) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    response_format: 'json',
    language: language as string,
  })

  const basePrompt = `
You are an advanced speech and clinical insight AI trained to interpret transcripts from human speech. Your task is to analyze the content and detect:
- Emotional tone (stress, confidence, hesitation, etc.)
- Speech disorders (stuttering, disfluency, etc.)
- Clarity, coherence, and complexity
- Cognitive markers (confusion, aphasia, etc.)
- Any indicators of underlying neurological or psychological conditions

Structure your response into labeled sections using **bold headings**:
**Transcript:**
[include the clean transcription here]

**Clinical Insights:**
- Bullet point observations of detected patterns or concerns
- Mention emotional tone, rhythm, or disruptions

**Risk Flags:**
List any speech patterns that may correlate with clinical conditions, if any. Use Low/Moderate/High severity.

**Neurological & Psychological Flags:**
- Highlight anything that could indicate apraxia, Tourette, cognitive decline, etc.

**Patient Summary:**
Summarize your findings in easy-to-understand terms a patient could read.

**References:**
Include 3–5 peer-reviewed studies related to the above conditions. Use this format:
- Title (Author, Journal, Year): Summary  
  URL: working link

Only include real studies with working, public URLs.
Skip any reference you cannot verify with a valid link.
`

  const medicalAddon = `
In Medical Mode:
- Flag any vocal or language markers associated with neurological, psychiatric, or speech disorders.
- Consider indicators of: Tourette syndrome, apraxia of speech, Parkinsonian speech, stuttering, depression, anxiety, aphasia, ASD, or cognitive delay.
- Rate severity as low, moderate, or high.
- Summarize in patient-friendly language.
- Link to supporting studies (with working URLs).
- Skip any reference you cannot verify with a working link.
`

  const prompt = `${basePrompt}${isMedical ? medicalAddon : ''}`

  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: prompt },
      {
        role: 'user',
        content: `Transcript:\n\n${transcription.text}`,
      },
    ],
  })

  return NextResponse.json({
    transcript: transcription.text,
    analysis: chatCompletion.choices[0].message.content,
    language,
  })
}