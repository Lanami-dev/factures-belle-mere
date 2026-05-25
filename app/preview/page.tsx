import Link from 'next/link'
import { TemplatePreviews } from '@/components/TemplatePreviews'

export default function PreviewPage() {
  return (
    <main className="min-h-screen p-6 lg:p-10 bg-creme">
      <div className="mx-auto max-w-[820px]">
        <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-pierre">Aperçu</p>
            <h1 className="mt-1 text-3xl font-semibold text-anthracite">Template facture — Nunito Sans</h1>
            <p className="mt-2 text-sm text-anthracite/70 max-w-2xl">
              Logo + palette crème/beige/brun + accents terracotta discrets, Nunito Sans light.
              Total dans un récap aligné à droite (pas de bandeau pleine couleur).
              Dis-moi les détails à ajuster.
            </p>
          </div>
          <Link href="/" className="btn-secondary">
            ← Retour à l'app
          </Link>
        </header>

        <TemplatePreviews />

        <p className="mt-6 text-xs text-pierre text-center">
          Aperçu à l'échelle A4 réelle (1 page entière visible). Le rendu PDF final sera quasi identique.
        </p>
      </div>
    </main>
  )
}
