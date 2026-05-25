import { NextResponse, type NextRequest } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF, getInvoiceNumber } from '@/components/InvoicePDF'
import type { InvoicePayload } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as InvoicePayload

    if (!payload?.billingMonth || !/^\d{4}-\d{2}$/.test(payload.billingMonth)) {
      return NextResponse.json({ error: "Mois facturé invalide." }, { status: 400 })
    }
    if (!Array.isArray(payload.entries)) {
      return NextResponse.json({ error: "Liste d'heures invalide." }, { status: 400 })
    }

    const pdfBuffer = await renderToBuffer(<InvoicePDF payload={payload} />)
    const invoiceNumber = getInvoiceNumber(payload.billingMonth)

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoiceNumber}-Marion-Brasier.pdf"`,
        'Cache-Control': 'no-store'
      }
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur génération PDF."
    console.error('[pdf] erreur:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
