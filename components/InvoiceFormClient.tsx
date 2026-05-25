'use client'

import { useMemo, useRef, useState } from 'react'
import type { HourEntry, InvoicePayload, OcrResult } from '@/lib/types'

type PublicConfig = {
  displayName: string
  hourlyRate: number
  forfaitHours: number
  forfaitLabel: string
}

type Step = 'idle' | 'uploading' | 'reviewing' | 'generating' | 'done'

const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
]

function currentBillingMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function formatMonth(billingMonth: string): string {
  const [y, m] = billingMonth.split('-')
  return `${MONTHS_FR[parseInt(m, 10) - 1]} ${y}`
}

function formatHours(h: number): string {
  if (h % 1 === 0) return `${h}H`
  const whole = Math.floor(h)
  const minutes = Math.round((h - whole) * 60)
  return `${whole}H${String(minutes).padStart(2, '0')}`
}

function formatDateInput(date: string): string {
  // YYYY-MM-DD reste tel quel pour <input type="date">
  return date
}

function formatAmount(value: number): string {
  return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

export function InvoiceFormClient({ config }: { config: PublicConfig }) {
  const [step, setStep] = useState<Step>('idle')
  const [billingMonth, setBillingMonth] = useState<string>(currentBillingMonth())
  const [entries, setEntries] = useState<HourEntry[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hoursTotal = useMemo(
    () => entries.reduce((sum, e) => sum + (Number.isFinite(e.hours) ? e.hours : 0), 0),
    [entries]
  )
  const hoursAmount = hoursTotal * config.hourlyRate
  const forfaitAmount = config.forfaitHours * config.hourlyRate
  const grandTotal = hoursAmount + forfaitAmount

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setStep('uploading')
    setWarnings([])

    try {
      // iOS prend les photos en HEIC par défaut, format non supporté par
      // l'API Anthropic. On convertit en JPEG côté navigateur avant l'envoi.
      let payload: Blob = file
      let payloadName = file.name
      const isHeic =
        file.type === 'image/heic' ||
        file.type === 'image/heif' ||
        /\.(heic|heif)$/i.test(file.name)

      if (isHeic) {
        const heic2any = (await import('heic2any')).default
        const converted = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.85
        })
        payload = Array.isArray(converted) ? converted[0] : converted
        payloadName = file.name.replace(/\.(heic|heif)$/i, '.jpg') || 'photo.jpg'
      }

      const formData = new FormData()
      formData.append('image', payload, payloadName)

      const res = await fetch('/api/ocr', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? `Erreur ${res.status}`)
      }

      const result = data as OcrResult
      setEntries(result.entries)
      setWarnings(result.warnings ?? [])

      // Si Claude a détecté un mois, on l'utilise pour pré-sélectionner.
      if (result.detectedMonth && /^\d{4}-\d{2}$/.test(result.detectedMonth)) {
        setBillingMonth(result.detectedMonth)
      }

      setStep('reviewing')
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.")
      setStep('idle')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function updateEntry(index: number, patch: Partial<HourEntry>) {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)))
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  function addEntry() {
    const [y, m] = billingMonth.split('-')
    const today = new Date()
    const day = today.getDate()
    const defaultDate = `${y}-${m}-${String(day).padStart(2, '0')}`
    setEntries((prev) => [...prev, { date: defaultDate, hours: 4.5 }])
  }

  async function generatePDF() {
    setError(null)
    setStep('generating')

    try {
      const payload: InvoicePayload = {
        billingMonth,
        entries: entries.filter((e) => e.hours > 0 && e.date),
        hoursTotal,
        hoursAmount,
        forfaitAmount,
        grandTotal
      }

      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `Erreur ${res.status}` }))
        throw new Error(data.error ?? `Erreur ${res.status}`)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `F${billingMonth}-Marion-Brasier.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue lors de la génération.")
      setStep('reviewing')
    }
  }

  function resetAll() {
    setStep('idle')
    setEntries([])
    setWarnings([])
    setError(null)
    setBillingMonth(currentBillingMonth())
  }

  // ----------------------------- RENDER -----------------------------

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-terracotta/40 bg-terracotta/10 p-4 text-sm text-terracotta">
          {error}
        </div>
      )}

      <section className="card">
        <h2 className="text-lg font-semibold text-anthracite mb-4">1. Mois facturé</h2>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={billingMonth}
            onChange={(e) => setBillingMonth(e.target.value)}
            className="input-field max-w-xs"
            disabled={step === 'uploading' || step === 'generating'}
          />
          <span className="text-sm text-pierre">{formatMonth(billingMonth)}</span>
        </div>
      </section>

      {step === 'idle' && (
        <section className="card">
          <h2 className="text-lg font-semibold text-anthracite mb-2">2. Photo du carnet</h2>
          <p className="text-sm text-anthracite/70 mb-4">
            Prends la page du mois en photo en cadrant bien toutes les lignes. Je vais lire les dates et les heures pour toi.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="photo-input"
          />
          <label htmlFor="photo-input" className="btn-primary cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            Prendre ou choisir une photo
          </label>
        </section>
      )}

      {step === 'uploading' && (
        <section className="card flex items-center gap-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-anthracite/30 border-t-anthracite" />
          <div>
            <p className="font-medium text-anthracite">Lecture de ton carnet en cours...</p>
            <p className="text-sm text-pierre">Ça prend environ 10 à 20 secondes.</p>
          </div>
        </section>
      )}

      {(step === 'reviewing' || step === 'generating' || step === 'done') && (
        <>
          <section className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-anthracite">2. Heures détectées</h2>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-sauge-800 hover:underline"
              >
                Reprendre une photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                    onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {warnings.length > 0 && (
              <div className="mb-4 rounded-lg border border-ocre/40 bg-ocre/10 p-3 text-xs text-anthracite/80">
                <p className="font-medium mb-1">À vérifier :</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-pierre">
                    <th className="pb-2 pr-3 font-medium">Date</th>
                    <th className="pb-2 pr-3 font-medium">Heures</th>
                    <th className="pb-2 pr-3 font-medium text-right">Montant</th>
                    <th className="pb-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => (
                    <tr key={idx} className="border-t border-anthracite/10">
                      <td className="py-2 pr-3">
                        <input
                          type="date"
                          value={formatDateInput(entry.date)}
                          onChange={(e) => updateEntry(idx, { date: e.target.value })}
                          className="input-field py-1.5 text-sm"
                          disabled={step !== 'reviewing'}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          max="24"
                          value={entry.hours}
                          onChange={(e) => updateEntry(idx, { hours: parseFloat(e.target.value) || 0 })}
                          className="input-field py-1.5 text-sm w-20"
                          disabled={step !== 'reviewing'}
                        />
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {formatAmount(entry.hours * config.hourlyRate)}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeEntry(idx)}
                          disabled={step !== 'reviewing'}
                          className="text-pierre hover:text-terracotta disabled:opacity-30"
                          aria-label="Supprimer la ligne"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-sm text-pierre">
                        Aucune heure détectée. Ajoute une ligne manuellement ou reprends une photo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {step === 'reviewing' && (
              <button
                type="button"
                onClick={addEntry}
                className="mt-3 text-sm font-medium text-sauge-800 hover:underline"
              >
                + Ajouter une ligne
              </button>
            )}
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold text-anthracite mb-4">3. Récapitulatif facture</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-anthracite/80">
                  {entries.length} jour{entries.length > 1 ? 's' : ''} × {formatHours(hoursTotal)} au total
                </span>
                <span className="tabular-nums">{formatAmount(hoursAmount)}</span>
              </div>
              <div className="flex justify-between text-anthracite/80">
                <span>
                  {config.forfaitLabel} ({config.forfaitHours}H)
                </span>
                <span className="tabular-nums">{formatAmount(forfaitAmount)}</span>
              </div>
              <div className="flex justify-between pt-2 mt-2 border-t border-anthracite/15 text-lg font-semibold text-anthracite">
                <span>Total à payer</span>
                <span className="tabular-nums">{formatAmount(grandTotal)}</span>
              </div>
            </div>

            {step === 'done' ? (
              <div className="mt-6 space-y-3">
                <div className="rounded-lg border border-sauge/40 bg-sauge/10 p-3 text-sm text-sauge-800">
                  Facture téléchargée. Tu peux maintenant l'envoyer à ta cliente par email ou WhatsApp.
                </div>
                <button type="button" onClick={resetAll} className="btn-secondary w-full">
                  Faire une nouvelle facture
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={generatePDF}
                disabled={step === 'generating' || entries.length === 0}
                className="btn-primary w-full mt-6"
              >
                {step === 'generating' ? 'Génération du PDF...' : 'Générer la facture PDF'}
              </button>
            )}
          </section>
        </>
      )}
    </div>
  )
}
