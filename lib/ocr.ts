import Anthropic from '@anthropic-ai/sdk'
import { getAnthropicKey } from './config'
import type { OcrResult, HourEntry } from './types'

const MODEL = 'claude-sonnet-4-5-20250929'

const SYSTEM_PROMPT = `Tu es un OCR spécialisé dans la lecture de carnets manuscrits français qui listent des heures travaillées.

Le carnet contient typiquement :
- Un en-tête de mois (ex "Avril 2026", "Mai 2026")
- Une liste de lignes au format : "JJ/MM/AAAA   XHYY" ou "JJ/MM/AAAA   XH" ou "JJ/MM   XH30"
- Parfois un total en bas (à IGNORER, on le recalcule)
- Parfois des annotations type "Merci", "+20H", etc. (à IGNORER)

Les durées en français :
- "4H30" = 4.5 heures
- "4H" = 4 heures
- "4H15" = 4.25 heures
- "4H45" = 4.75 heures

Tu réponds UNIQUEMENT avec un JSON valide, sans markdown, sans backticks, sans commentaire, au format :
{
  "detectedMonth": "YYYY-MM" ou null,
  "entries": [
    { "date": "YYYY-MM-DD", "hours": <nombre décimal> }
  ],
  "warnings": ["..."]
}

Règles strictes :
- Pour chaque date détectée, déduis l'année du contexte (en-tête de mois) si elle n'est pas écrite.
- Si une ligne est illisible ou ambiguë, AJOUTE-la quand même avec ta meilleure estimation et signale-la dans warnings (ex: "Ligne 5 difficile à lire, j'ai supposé 4H30").
- N'invente PAS de lignes qui ne sont pas dans le carnet.
- N'inclus PAS les lignes de totaux finaux (54H, etc.) ni les annotations.
- Tri les entries par date croissante.
- Si plusieurs encres / couleurs : c'est juste pour distinguer ce qui a été ajouté plus tard, traite tout pareil.`

export async function extractHoursFromImage(imageBase64: string, mediaType: string): Promise<OcrResult> {
  const client = new Anthropic({ apiKey: getAnthropicKey() })

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
              data: imageBase64
            }
          },
          {
            type: 'text',
            text: "Lis ce carnet et extrait les heures travaillées au format JSON demandé. Réponds uniquement avec le JSON."
          }
        ]
      }
    ]
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error("Réponse Claude inattendue (aucun texte).")
  }

  let parsed: { detectedMonth: string | null; entries: HourEntry[]; warnings?: string[] }
  try {
    // On nettoie au cas où il glisse quand même des backticks.
    const cleaned = textBlock.text.trim().replace(/^```json\s*|\s*```$/g, '').replace(/^```\s*|\s*```$/g, '')
    parsed = JSON.parse(cleaned)
  } catch (err) {
    throw new Error(`Impossible de parser la réponse Claude : ${textBlock.text.slice(0, 200)}`)
  }

  // Sanity check : tri par date + filtre les heures négatives ou aberrantes.
  const entries = (parsed.entries ?? [])
    .filter((e) => e.date && typeof e.hours === 'number' && e.hours > 0 && e.hours <= 24)
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    entries,
    detectedMonth: parsed.detectedMonth ?? null,
    warnings: parsed.warnings ?? []
  }
}
