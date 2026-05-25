import { NextResponse, type NextRequest } from 'next/server'
import { extractHoursFromImage } from '@/lib/ocr'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image')

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Aucune image reçue." }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image trop grosse (max 10 Mo)." }, { status: 400 })
    }

    const mediaType = file.type || 'image/jpeg'
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mediaType)) {
      return NextResponse.json({ error: `Format image non supporté (${mediaType}).` }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')

    console.log(`[ocr] traitement image type=${mediaType} size=${(file.size / 1024).toFixed(0)}KB`)

    const result = await extractHoursFromImage(base64, mediaType)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue lors de la lecture du carnet."
    console.error('[ocr] erreur:', message, err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
