import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'

// En local : charge les vars depuis le .env racine du workspace LANAMI.
// Sur Vercel : .env n'existe pas, les vars sont injectées via le dashboard.
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../../../.env')
if (existsSync(envPath)) {
  loadEnv({ path: envPath })
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
    // Force l'inclusion des fichiers de police et du logo dans la lambda
    // serverless Vercel qui sert /api/pdf (sinon ils sont oubliés au tracing).
    outputFileTracingIncludes: {
      '/api/pdf': [
        './node_modules/@fontsource/nunito-sans/files/nunito-sans-latin-*.woff',
        './node_modules/@fontsource/playfair-display/files/playfair-display-latin-500-*.woff',
        './public/logo-mb.png'
      ]
    }
  }
}

export default nextConfig
