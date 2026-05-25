import { InvoiceFormClient } from '@/components/InvoiceFormClient'
import { businessConfig, billingConfig } from '@/lib/config'

export default function HomePage() {
  // On expose au client uniquement ce dont il a besoin pour afficher et calculer.
  // Pas d'IBAN, pas de SIRET ici, ils restent côté serveur (template PDF).
  const publicConfig = {
    displayName: businessConfig.legalName,
    hourlyRate: billingConfig.hourlyRate,
    forfaitHours: billingConfig.forfaitHours,
    forfaitLabel: billingConfig.forfaitLabel
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-pierre">
            Espace de {businessConfig.legalName}
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-anthracite">
            Générer une facture
          </h1>
          <p className="mt-2 text-sm text-anthracite/70">
            Prends en photo la page du mois dans ton carnet, je m'occupe du reste.
          </p>
        </header>

        <InvoiceFormClient config={publicConfig} />
      </div>
    </main>
  )
}
