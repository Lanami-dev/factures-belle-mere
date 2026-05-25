import path from 'node:path'
import { readFileSync } from 'node:fs'
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'
import { businessConfig, clientConfig, billingConfig } from '@/lib/config'
import type { InvoicePayload } from '@/lib/types'

// ---------------------------------------------------------------
//  Polices embarquées (depuis @fontsource via node_modules)
// ---------------------------------------------------------------

const fontsRoot = path.join(process.cwd(), 'node_modules', '@fontsource')

Font.register({
  family: 'NunitoSans',
  fonts: [
    { src: path.join(fontsRoot, 'nunito-sans/files/nunito-sans-latin-300-normal.woff'), fontWeight: 300 },
    { src: path.join(fontsRoot, 'nunito-sans/files/nunito-sans-latin-300-italic.woff'), fontWeight: 300, fontStyle: 'italic' },
    { src: path.join(fontsRoot, 'nunito-sans/files/nunito-sans-latin-400-normal.woff'), fontWeight: 400 },
    { src: path.join(fontsRoot, 'nunito-sans/files/nunito-sans-latin-400-italic.woff'), fontWeight: 400, fontStyle: 'italic' },
    { src: path.join(fontsRoot, 'nunito-sans/files/nunito-sans-latin-500-normal.woff'), fontWeight: 500 },
    { src: path.join(fontsRoot, 'nunito-sans/files/nunito-sans-latin-600-normal.woff'), fontWeight: 600 }
  ]
})

Font.register({
  family: 'Playfair',
  fonts: [
    { src: path.join(fontsRoot, 'playfair-display/files/playfair-display-latin-500-normal.woff'), fontWeight: 500 },
    { src: path.join(fontsRoot, 'playfair-display/files/playfair-display-latin-500-italic.woff'), fontWeight: 500, fontStyle: 'italic' }
  ]
})

// ---------------------------------------------------------------
//  Logo (chargé en Buffer pour éviter les soucis de path sur Windows)
// ---------------------------------------------------------------

const logoBuffer = readFileSync(path.join(process.cwd(), 'public', 'logo-mb.png'))

// ---------------------------------------------------------------
//  Palette (extraite du logo de Marion)
// ---------------------------------------------------------------

const C = {
  bg: '#FAF6EF',
  textDark: '#3D332A',
  textMid: '#6B5C4F',
  textLight: '#8A7766',
  beigeRule: '#D9C7B0',
  beigeRow: '#E8DCC8',
  terracotta: '#E66B47'
}

// ---------------------------------------------------------------
//  Helpers de formatage
// ---------------------------------------------------------------

const MONTH_NAMES_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
]

function formatMonth(billingMonth: string): string {
  const [yearStr, monthStr] = billingMonth.split('-')
  return `${MONTH_NAMES_FR[parseInt(monthStr, 10) - 1]} ${yearStr}`
}

function formatPeriod(billingMonth: string): string {
  const [yearStr, monthStr] = billingMonth.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)
  const lastDay = new Date(year, month, 0).getDate()
  return `Du 01/${monthStr}/${year} au ${String(lastDay).padStart(2, '0')}/${monthStr}/${year}`
}

function formatAmount(value: number): string {
  // Format manuel pour éviter l'espace insécable mal rendu par certaines polices.
  const fixed = value.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${withThousands},${decPart} €`
}

function formatHours(value: number): string {
  const fixed = value % 1 === 0 ? String(value) : value.toFixed(2).replace('.', ',')
  return `${fixed} h`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function getInvoiceNumber(billingMonth: string): string {
  return `F${billingMonth}`
}

// ---------------------------------------------------------------
//  Styles
// ---------------------------------------------------------------

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    color: C.textDark,
    paddingTop: 28,
    paddingHorizontal: 56,
    paddingBottom: 110,
    fontFamily: 'NunitoSans',
    fontWeight: 300,
    fontSize: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  logo: {
    width: 170,
    height: 170
  },
  headerRight: {
    marginTop: 34,
    alignItems: 'flex-end'
  },
  factureTitle: {
    fontFamily: 'Playfair',
    fontSize: 38,
    fontWeight: 500,
    color: C.terracotta,
    marginBottom: 8,
    lineHeight: 1
  },
  factureMeta: {
    fontSize: 9,
    color: C.textLight,
    fontWeight: 300
  },
  separator: {
    height: 1,
    backgroundColor: C.beigeRule,
    marginTop: 4,
    marginBottom: 22
  },
  twoCols: {
    flexDirection: 'row',
    marginBottom: 28
  },
  colLeft: {
    flex: 1,
    paddingRight: 16
  },
  colRight: {
    flex: 1,
    paddingLeft: 16
  },
  sectionLabel: {
    fontSize: 8,
    letterSpacing: 2.4,
    color: C.terracotta,
    fontWeight: 600,
    marginBottom: 8
  },
  partyName: {
    fontFamily: 'Playfair',
    fontWeight: 500,
    fontSize: 16,
    color: C.textDark,
    marginBottom: 6
  },
  partyDetails: {
    fontSize: 9,
    color: C.textMid,
    lineHeight: 1.65,
    fontWeight: 300
  },
  tableHeader: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: C.terracotta,
    borderBottomWidth: 0.5,
    borderBottomColor: C.terracotta,
    paddingVertical: 10
  },
  tableHeaderText: {
    fontSize: 8,
    letterSpacing: 2.4,
    color: C.terracotta,
    fontWeight: 600
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: C.beigeRow,
    paddingVertical: 14,
    alignItems: 'flex-start'
  },
  cellDescription: { flex: 4, paddingRight: 8 },
  cellQty: { flex: 1, textAlign: 'right', paddingRight: 4 },
  cellPrice: { flex: 1.2, textAlign: 'right', paddingRight: 4 },
  cellTotal: { flex: 1.5, textAlign: 'right' },
  totalsBlock: {
    alignItems: 'flex-end',
    marginTop: 18
  },
  totalsInner: {
    minWidth: 240
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6
  },
  totalLabel: {
    fontSize: 10,
    color: C.textMid,
    fontWeight: 300
  },
  totalValue: {
    fontSize: 10,
    color: C.textMid,
    fontWeight: 400
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: C.terracotta,
    marginTop: 6
  },
  grandTotalLabel: {
    fontSize: 10,
    letterSpacing: 2.5,
    color: C.terracotta,
    fontWeight: 600
  },
  grandTotalValue: {
    fontSize: 20,
    color: C.terracotta,
    fontWeight: 400
  },
  tvaMention: {
    fontSize: 9,
    fontStyle: 'italic',
    color: C.textLight,
    fontWeight: 300,
    marginTop: 18
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 56,
    right: 56,
    borderTopWidth: 1,
    borderTopColor: C.beigeRule,
    paddingTop: 14
  },
  footerRow: {
    flexDirection: 'row',
    marginBottom: 10
  },
  footerColLeft: { flex: 1 },
  footerColRight: { flex: 1, alignItems: 'flex-end' },
  footerLabel: {
    fontSize: 7,
    letterSpacing: 2.4,
    color: C.terracotta,
    fontWeight: 600,
    marginBottom: 4
  },
  footerText: {
    fontSize: 8,
    color: C.textMid,
    lineHeight: 1.6,
    fontWeight: 300
  },
  footerThanks: {
    textAlign: 'center',
    fontFamily: 'Playfair',
    fontSize: 14,
    color: C.terracotta,
    marginTop: 12,
    fontWeight: 500,
    fontStyle: 'italic'
  }
})

// ---------------------------------------------------------------
//  Template
// ---------------------------------------------------------------

export function InvoicePDF({ payload }: { payload: InvoicePayload }) {
  const issueDate = formatDate(new Date())
  const period = formatPeriod(payload.billingMonth)
  const invoiceNumber = getInvoiceNumber(payload.billingMonth)
  const monthLabel = formatMonth(payload.billingMonth)

  const clientHasAddress = Boolean(
    clientConfig.address.street || clientConfig.address.postalCode || clientConfig.address.city
  )

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={logoBuffer} style={styles.logo} />
          <View style={styles.headerRight}>
            <Text style={styles.factureTitle}>Facture</Text>
            <Text style={styles.factureMeta}>N° {invoiceNumber} · Émise le {issueDate}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Émetteur / Facturé à */}
        <View style={styles.twoCols}>
          <View style={styles.colLeft}>
            <Text style={styles.sectionLabel}>ÉMETTEUR</Text>
            <Text style={styles.partyName}>{businessConfig.legalName}</Text>
            <Text style={styles.partyDetails}>
              {businessConfig.activity}{'\n'}
              {businessConfig.address.street}{'\n'}
              {businessConfig.address.postalCode} {businessConfig.address.city}{'\n'}
              SIRET {businessConfig.siret}
            </Text>
          </View>
          <View style={styles.colRight}>
            <Text style={styles.sectionLabel}>FACTURÉ À</Text>
            <Text style={styles.partyName}>{clientConfig.legalName}</Text>
            <Text style={styles.partyDetails}>
              {clientHasAddress && (
                <>
                  {clientConfig.address.street && `${clientConfig.address.street}\n`}
                  {(clientConfig.address.postalCode || clientConfig.address.city) &&
                    `${clientConfig.address.postalCode} ${clientConfig.address.city}\n`}
                </>
              )}
              Période{'\n'}
              {period}
            </Text>
          </View>
        </View>

        {/* Tableau */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.cellDescription]}>DÉSIGNATION</Text>
          <Text style={[styles.tableHeaderText, styles.cellQty]}>QUANTITÉ</Text>
          <Text style={[styles.tableHeaderText, styles.cellPrice]}>PRIX</Text>
          <Text style={[styles.tableHeaderText, styles.cellTotal]}>TOTAL</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.cellDescription}>Heures d&apos;accompagnement — {monthLabel}</Text>
          <Text style={styles.cellQty}>{formatHours(payload.hoursTotal)}</Text>
          <Text style={styles.cellPrice}>{formatAmount(billingConfig.hourlyRate)}</Text>
          <Text style={[styles.cellTotal, { fontWeight: 500 }]}>{formatAmount(payload.hoursAmount)}</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.cellDescription}>{billingConfig.forfaitLabel}</Text>
          <Text style={styles.cellQty}>{billingConfig.forfaitHours} h</Text>
          <Text style={styles.cellPrice}>{formatAmount(billingConfig.hourlyRate)}</Text>
          <Text style={[styles.cellTotal, { fontWeight: 500 }]}>{formatAmount(payload.forfaitAmount)}</Text>
        </View>

        {/* Totaux */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalsInner}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total HT</Text>
              <Text style={styles.totalValue}>{formatAmount(payload.grandTotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA</Text>
              <Text style={styles.totalLabel}>Non applicable</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL</Text>
              <Text style={styles.grandTotalValue}>{formatAmount(payload.grandTotal)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.tvaMention}>{businessConfig.tvaMention}</Text>

        {/* Footer fixé en bas */}
        <View fixed style={styles.footer}>
          <View style={styles.footerRow}>
            <View style={styles.footerColLeft}>
              <Text style={styles.footerLabel}>PAIEMENT</Text>
              <Text style={styles.footerText}>
                {billingConfig.paymentTerms}{'\n'}
                {businessConfig.iban && `IBAN : ${businessConfig.iban}`}
              </Text>
            </View>
            <View style={styles.footerColRight}>
              <Text style={styles.footerLabel}>CONTACT</Text>
              <Text style={[styles.footerText, { textAlign: 'right' }]}>
                {businessConfig.email}{'\n'}
                {businessConfig.phone}
              </Text>
            </View>
          </View>
          <Text style={styles.footerThanks}>Merci pour votre confiance.</Text>
        </View>
      </Page>
    </Document>
  )
}
