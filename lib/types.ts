export type HourEntry = {
  // Format ISO YYYY-MM-DD pour la robustesse, affiché en jj/MM dans l'UI.
  date: string
  // Décimal pour gérer les 4H30 → 4.5
  hours: number
}

export type InvoiceLine = {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export type InvoicePayload = {
  // Mois facturé au format YYYY-MM
  billingMonth: string
  entries: HourEntry[]
  hoursTotal: number
  hoursAmount: number
  forfaitAmount: number
  grandTotal: number
}

export type OcrResult = {
  entries: HourEntry[]
  // Mois détecté par le modèle (YYYY-MM), peut différer de la sélection utilisateur
  detectedMonth: string | null
  // Notes de l'OCR si il y a des ambiguïtés (signalé à l'UI)
  warnings: string[]
}
