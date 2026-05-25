// Mockup HTML/CSS du template final : Nunito Sans + palette logo + accent terracotta.
// Le mockup est rendu à dimensions A4 réelles (595 x 842 pt CSS) puis scalé pour
// tenir dans la fenêtre du navigateur. Garantit qu'on voit toute la page de PDF.

'use client'

import { useEffect, useRef, useState } from 'react'
import { Nunito_Sans, Playfair_Display } from 'next/font/google'

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-nunito-sans',
  display: 'swap'
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap'
})

// ---------- Données factices identiques à la facture d'avril ----------
const hoursTotal = 53.5
const hoursAmount = 3210
const forfaitAmount = 1200
const grandTotal = 4410

function fmt(value: number): string {
  const fixed = value.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  return `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')},${decPart} €`
}

// Dimensions A4 en points PDF (1pt = 1/72 inch) :
//   210mm × 297mm = 595pt × 842pt
const A4_WIDTH = 595
const A4_HEIGHT = 842

// =========================================================================
//  Template Terracotta + Nunito Sans
// =========================================================================

function TerracottaTemplate() {
  return (
    <div
      style={{
        backgroundColor: '#FAF6EF',
        color: '#3D332A',
        padding: '28px 56px 48px',
        width: A4_WIDTH,
        height: A4_HEIGHT,
        fontFamily: 'var(--font-nunito-sans), system-ui, sans-serif',
        fontWeight: 300,
        fontSize: 10,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <img src="/logo-mb.png" alt="Marion Brasier" style={{ width: 170, height: 170 }} />
        <div style={{ textAlign: 'right', marginTop: 34 }}>
          <div style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 38,
            fontWeight: 500,
            color: '#E66B47',
            letterSpacing: '0.01em',
            lineHeight: 1,
            marginBottom: 8
          }}>
            Facture
          </div>
          <div style={{ fontSize: 9, color: '#8A7766', fontWeight: 300 }}>
            N° F2026-04 · Émise le 25 mai 2026
          </div>
        </div>
      </div>

      <div style={{ height: 1, backgroundColor: '#D9C7B0', marginTop: 4, marginBottom: 22 }} />

      {/* Émetteur / Facturé à */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <div style={{
            fontSize: 8,
            letterSpacing: '0.3em',
            color: '#E66B47',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 8
          }}>
            Émetteur
          </div>
          <div style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontWeight: 500,
            fontSize: 16,
            marginBottom: 6,
            color: '#3D332A'
          }}>
            Marion BRASIER
          </div>
          <div style={{ color: '#6B5C4F', fontSize: 9, lineHeight: 1.65, fontWeight: 300 }}>
            Accompagnement personnalisé
            <br />
            30 boulevard Maréchal Foch
            <br />
            06600 Antibes
            <br />
            SIRET 494 127 327 00026
          </div>
        </div>
        <div>
          <div style={{
            fontSize: 8,
            letterSpacing: '0.3em',
            color: '#E66B47',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 8
          }}>
            Facturé à
          </div>
          <div style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontWeight: 500,
            fontSize: 16,
            marginBottom: 6,
            color: '#3D332A'
          }}>
            Benoit DAGEVILLE
          </div>
          <div style={{ color: '#6B5C4F', fontSize: 9, lineHeight: 1.65, fontWeight: 300 }}>
            Période
            <br />
            Du 01/04/2026 au 30/04/2026
          </div>
        </div>
      </div>

      {/* Tableau */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, marginTop: 28 }}>
        <thead>
          <tr style={{ borderTop: '1px solid #E66B47', borderBottom: '0.5px solid #E66B47' }}>
            <th style={{ textAlign: 'left', padding: '10px 0', fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 600, color: '#E66B47' }}>
              Désignation
            </th>
            <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 600, color: '#E66B47', width: 70 }}>
              Quantité
            </th>
            <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 600, color: '#E66B47', width: 80 }}>
              Prix
            </th>
            <th style={{ textAlign: 'right', padding: '10px 0', fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 600, color: '#E66B47', width: 90 }}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '0.5px solid #E8DCC8' }}>
            <td style={{ padding: '14px 0', fontWeight: 300 }}>Heures d'accompagnement — avril 2026</td>
            <td style={{ textAlign: 'right', padding: '14px 8px', fontWeight: 300 }}>{hoursTotal} h</td>
            <td style={{ textAlign: 'right', padding: '14px 8px', fontWeight: 300 }}>60,00 €</td>
            <td style={{ textAlign: 'right', padding: '14px 0', fontWeight: 500 }}>{fmt(hoursAmount)}</td>
          </tr>
          <tr style={{ borderBottom: '0.5px solid #E8DCC8' }}>
            <td style={{ padding: '14px 0', fontWeight: 300 }}>Forfait gestion quotidienne (courses, démarches, téléphone)</td>
            <td style={{ textAlign: 'right', padding: '14px 8px', fontWeight: 300 }}>20 h</td>
            <td style={{ textAlign: 'right', padding: '14px 8px', fontWeight: 300 }}>60,00 €</td>
            <td style={{ textAlign: 'right', padding: '14px 0', fontWeight: 500 }}>{fmt(forfaitAmount)}</td>
          </tr>
        </tbody>
      </table>

      {/* Récap totals (style discret, sans bandeau couleur) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
        <div style={{ minWidth: 240 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 10, color: '#6B5C4F', fontWeight: 300 }}>
            <span>Total HT</span>
            <span style={{ fontWeight: 400 }}>{fmt(grandTotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 10, color: '#6B5C4F', fontWeight: 300 }}>
            <span>TVA</span>
            <span>Non applicable</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            padding: '12px 0 4px 0',
            borderTop: '1px solid #E66B47',
            marginTop: 6
          }}>
            <span style={{
              fontSize: 10,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#E66B47',
              fontWeight: 600
            }}>
              Total
            </span>
            <span style={{
              fontSize: 20,
              color: '#E66B47',
              fontWeight: 400,
              letterSpacing: '0.02em'
            }}>
              {fmt(grandTotal)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 9, fontStyle: 'italic', color: '#8A7766', fontWeight: 300, marginTop: 18 }}>
        TVA non applicable, art. 293 B du CGI
      </div>

      <div style={{ flex: 1 }} />

      {/* Footer */}
      <div style={{ borderTop: '1px solid #D9C7B0', paddingTop: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 10 }}>
          <div>
            <div style={{
              fontSize: 7,
              letterSpacing: '0.3em',
              color: '#E66B47',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 4
            }}>
              Paiement
            </div>
            <div style={{ fontSize: 8, color: '#6B5C4F', lineHeight: 1.6, fontWeight: 300 }}>
              Paiement à réception par virement
              <br />
              IBAN : FR76 1831 5100 0008 0082 9898 022
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: 7,
              letterSpacing: '0.3em',
              color: '#E66B47',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 4
            }}>
              Contact
            </div>
            <div style={{ fontSize: 8, color: '#6B5C4F', lineHeight: 1.6, fontWeight: 300 }}>
              marion.brasier@icloud.com
              <br />
              06 61 85 30 62
            </div>
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontSize: 14,
          color: '#E66B47',
          marginTop: 12,
          fontWeight: 400,
          fontStyle: 'italic'
        }}>
          Merci pour votre confiance.
        </div>
      </div>
    </div>
  )
}

// =========================================================================
//  Scaled A4 frame : le mockup est rendu en pixels fixes (595×842 pt) puis
//  scalé via transform pour tenir dans le conteneur. Garantit qu'on voit
//  toute la page.
// =========================================================================

function ScaledA4Preview({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const measure = () => {
      const w = containerRef.current?.offsetWidth ?? A4_WIDTH
      setScale(w / A4_WIDTH)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        aspectRatio: `${A4_WIDTH} / ${A4_HEIGHT}`,
        position: 'relative',
        border: '1px solid rgba(44,44,44,0.15)',
        boxShadow: '0 8px 30px rgba(44,44,44,0.10)',
        overflow: 'hidden',
        backgroundColor: '#FFF'
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: A4_WIDTH,
        height: A4_HEIGHT,
        transform: `scale(${scale})`,
        transformOrigin: 'top left'
      }}>
        {children}
      </div>
    </div>
  )
}

export function TemplatePreviews() {
  return (
    <div className={`${nunitoSans.variable} ${playfair.variable}`}>
      <ScaledA4Preview>
        <TerracottaTemplate />
      </ScaledA4Preview>
    </div>
  )
}
