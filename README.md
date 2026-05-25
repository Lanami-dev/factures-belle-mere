# Factures Marion Brasier

App perso de génération de factures pour Marion Brasier (belle-mère de Mélissa, auto-entrepreneuse accompagnement à domicile).

Marion prend en photo la page mensuelle de son carnet, l'app lit les heures avec Claude Vision, elle valide/corrige, télécharge le PDF, l'envoie à sa cliente.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Claude Vision API (`claude-sonnet-4-5`) pour l'OCR du carnet manuscrit
- `@react-pdf/renderer` pour la facture PDF
- Auth maison : cookie signé HMAC-SHA256, un seul mot de passe
- Déployable sur Vercel (plan Hobby suffit, voir CGU)

## Lancer en local

### 1. Variables d'env requises (dans le `.env` racine du workspace)

```bash
# --- Factures Marion ---
MBFACTURE_ACCESS_PASSWORD=<mot_de_passe_pour_Marion>
MBFACTURE_SESSION_SECRET=<32+_caracteres_aleatoires>
MBFACTURE_IBAN=FR7618315100000800829898022
```

Pour générer un `MBFACTURE_SESSION_SECRET` solide :
```powershell
# PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

`ANTHROPIC_API_KEY` doit aussi être présente dans le `.env` racine (déjà prévue dans le template).

### 2. Install et dev

```bash
cd livrables/perso/factures-belle-mere
npm install
npm run dev
```

L'app tourne sur http://localhost:3000.

## Configurer (statique)

Tout est dans [lib/config.ts](lib/config.ts) :
- Identité Marion (nom, adresse, SIRET)
- Mentions légales (TVA non applicable)
- Cliente (Benoit DAGEVILLE)
- Tarif horaire (60€)
- Forfait gestion mensuel (20H)

Pour ajouter l'adresse de la cliente plus tard : éditer `clientConfig.address` dans ce fichier, ou la passer via env si on veut plus de souplesse.

## Numérotation facture

Format `F{YYYY}-{MM}` basé sur le mois facturé. Une facture par mois donc unique sans BDD.

## Déploiement Vercel

À faire (voir section dédiée à venir).

DNS : ajouter un CNAME `mbfacture` → `cname.vercel-dns.com` chez Hostinger.

## Notes

- L'app est volontairement single-user (une seule personne, un seul mot de passe). Si un jour on veut ouvrir à d'autres autoentrepreneurs : refactoriser pour ajouter Supabase Auth + multitenancy.
- Les secrets ne vivent JAMAIS dans le code ni dans un `.env.local` projet. Toujours dans le `.env` racine du workspace.
- L'IBAN passe par l'env (semi-confidentiel) ; le reste des infos pro vit en clair dans `lib/config.ts`.
