// Configuration statique de l'autoentreprise.
// Les valeurs sensibles (IBAN, mot de passe) sont injectées via env (voir .env racine).
// Les autres infos vivent ici en clair, c'est juste la carte d'identité pro de Marion.

export const businessConfig = {
  legalName: 'Marion BRASIER',
  address: {
    street: '30 boulevard Maréchal Foch',
    postalCode: '06600',
    city: 'Antibes'
  },
  email: 'marion.brasier@icloud.com',
  phone: '06 61 85 30 62',
  siret: '494 127 327 00026',
  tvaMention: 'TVA non applicable, art. 293 B du CGI',
  activity: "Accompagnement personnalisé",
  // L'IBAN passe par l'env pour éviter qu'il traîne dans le repo.
  iban: process.env.MBFACTURE_IBAN ?? ''
}

export const clientConfig = {
  legalName: 'Benoit DAGEVILLE',
  address: {
    street: '',
    postalCode: '',
    city: ''
  }
}

export const billingConfig = {
  hourlyRate: 60,
  forfaitLabel: 'Forfait gestion quotidienne (courses, démarches, téléphone)',
  forfaitHours: 20,
  paymentTerms: 'Paiement à réception par virement bancaire',
  // Pas de pénalités B2C par défaut, mais on peut activer si besoin.
  showPenalties: false
}

export function getAccessPassword(): string {
  const pwd = process.env.MBFACTURE_ACCESS_PASSWORD
  if (!pwd) {
    throw new Error("MBFACTURE_ACCESS_PASSWORD manquant dans le .env racine.")
  }
  return pwd
}

export function getSessionSecret(): string {
  const secret = process.env.MBFACTURE_SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error("MBFACTURE_SESSION_SECRET manquant ou trop court (32+ caractères) dans le .env racine.")
  }
  return secret
}

export function getAnthropicKey(): string {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY manquant dans le .env racine.")
  }
  return key
}
